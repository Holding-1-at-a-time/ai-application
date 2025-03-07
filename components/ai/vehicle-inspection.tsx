"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, Scan, CheckCircle, XCircle, AlertCircle, FileText, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VehicleInspectionProps {
    appointmentId?: string
    vehicleId?: string
}

export default function VehicleInspection({ appointmentId, vehicleId }: VehicleInspectionProps) {
    const [activeTab, setActiveTab] = useState("camera")
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Setup AI chat for analysis
    const { messages, setMessages, append, isLoading } = useChat({
        api: "/api/ai/vehicle-inspection",
        body: {
            appointmentId,
            vehicleId,
        },
    })

    // Get the latest assistant message
    const analysisResult = messages.filter((m) => m.role === "assistant").pop()?.content
        ? JSON.parse(messages.filter((m) => m.role === "assistant").pop()?.content || "{}")
        : null

    // Start camera
    const startCamera = async () => {
        try {
            if (videoRef.current) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                videoRef.current.srcObject = stream
            }
        } catch (error) {
            console.error("Error accessing camera:", error)
        }
    }

    // Capture image from camera
    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas")
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
                const imageDataUrl = canvas.toDataURL("image/jpeg")
                setCapturedImage(imageDataUrl)

                // Stop the camera stream
                const stream = videoRef.current.srcObject as MediaStream
                if (stream) {
                    stream.getTracks().forEach((track) => track.stop())
                }
                videoRef.current.srcObject = null
            }
        }
    }

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setCapturedImage(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Analyze image
    const analyzeImage = async () => {
        if (!capturedImage) return

        setIsAnalyzing(true)
        try {
            await append({
                role: "user",
                content: capturedImage,
            })
        } catch (error) {
            console.error("Error analyzing image:", error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Reset the process
    const resetProcess = () => {
        setCapturedImage(null)
        setMessages([])
        if (activeTab === "camera") {
            startCamera()
        }
    }

    // Start camera when tab changes to camera
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        if (value === "camera") {
            startCamera()
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Scan className="mr-2 h-5 w-5 text-primary" />
                    AI Vehicle Inspection
                </CardTitle>
                <CardDescription>Capture and analyze vehicle condition with AI-powered visual inspection</CardDescription>
            </CardHeader>
            <CardContent>
                {!capturedImage ? (
                    <Tabs defaultValue="camera" value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="grid grid-cols-2 mb-4">
                            <TabsTrigger value="camera">
                                <Camera className="mr-2 h-4 w-4" />
                                Camera
                            </TabsTrigger>
                            <TabsTrigger value="upload">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="camera" className="flex flex-col items-center">
                            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                    onLoadedMetadata={() => videoRef.current?.play()}
                                />
                            </div>
                            <Button onClick={captureImage}>
                                <Camera className="mr-2 h-4 w-4" />
                                Capture Image
                            </Button>
                        </TabsContent>

                        <TabsContent value="upload" className="flex flex-col items-center">
                            <div
                                className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-center text-muted-foreground">
                                    Click to upload an image of the vehicle, or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG - Max 10MB</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </div>
                            <Button onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Select Image
                            </Button>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={capturedImage || "/placeholder.svg"}
                                alt="Vehicle"
                                className="w-full aspect-video object-cover rounded-lg"
                            />
                            {analysisResult && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="bg-white p-4 rounded-lg max-w-md">
                                        <h3 className="font-medium mb-2">Analysis Complete</h3>
                                        <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                                        <Button size="sm" className="mt-3" onClick={() => setIsAnalyzing(false)}>
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!analysisResult ? (
                            <div className="flex justify-center">
                                <Button onClick={analyzeImage} disabled={isAnalyzing}>
                                    {isAnalyzing ? (
                                        <>
                                            <Scan className="mr-2 h-4 w-4 animate-pulse" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Scan className="mr-2 h-4 w-4" />
                                            Analyze Image
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center mb-2">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                            <h3 className="font-medium">Good Condition</h3>
                                        </div>
                                        <ul className="space-y-1">
                                            {analysisResult.goodCondition.map((item: string, index: number) => (
                                                <li key={index} className="text-sm flex items-start">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 mt-1.5"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center mb-2">
                                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                                            <h3 className="font-medium">Needs Attention</h3>
                                        </div>
                                        <ul className="space-y-1">
                                            {analysisResult.needsAttention.map((item: string, index: number) => (
                                                <li key={index} className="text-sm flex items-start">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mr-2 mt-1.5"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center mb-2">
                                            <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                            <h3 className="font-medium">Issues Detected</h3>
                                        </div>
                                        <ul className="space-y-1">
                                            {analysisResult.issues.map((item: string, index: number) => (
                                                <li key={index} className="text-sm flex items-start">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2 mt-1.5"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">Recommended Services</h3>
                                    <div className="space-y-2">
                                        {analysisResult.recommendedServices.map((service: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                                                    <span className="text-sm">{service.name}</span>
                                                </div>
                                                <Badge variant={service.priority === "High" ? "destructive" : "default"}>
                                                    {service.priority}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={resetProcess}>
                    Reset
                </Button>
                {analysisResult && (
                    <Button size="sm" variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

