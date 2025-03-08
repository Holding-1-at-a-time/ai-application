"use client"

import type React from "react"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Camera, Upload, X, Check } from "lucide-react"

interface ServiceImageUploadProps {
    organizationId: string
    appointmentId: string
    serviceId: string
}

export default function ServiceImageUpload({ organizationId, appointmentId, serviceId }: ServiceImageUploadProps) {
    const [beforeImage, setBeforeImage] = useState<File | null>(null)
    const [afterImage, setAfterImage] = useState<File | null>(null)
    const [beforePreview, setBeforePreview] = useState<string | null>(null)
    const [afterPreview, setAfterPreview] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Convex mutation for storing image data
    const storeServiceImages = useMutation(api.serviceImages.storeServiceImages)

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file type
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file type",
                description: "Please select an image file.",
                variant: "destructive",
            })
            return
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please select an image smaller than 5MB.",
                variant: "destructive",
            })
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            const preview = e.target?.result as string
            if (type === "before") {
                setBeforeImage(file)
                setBeforePreview(preview)
            } else {
                setAfterImage(file)
                setAfterPreview(preview)
            }
        }
        reader.readAsDataURL(file)
    }

    // Clear selected file
    const clearFile = (type: "before" | "after") => {
        if (type === "before") {
            setBeforeImage(null)
            setBeforePreview(null)
        } else {
            setAfterImage(null)
            setAfterPreview(null)
        }
    }

    // Handle image upload
    const handleUpload = async () => {
        if (!beforeImage || !afterImage) {
            toast({
                title: "Missing images",
                description: "Please select both before and after images.",
                variant: "destructive",
            })
            return
        }

        setIsUploading(true)

        try {
            // In a real implementation, you would upload the images to a storage service
            // and get back URLs. For this example, we'll simulate that with a delay.

            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // In a real app, these would be actual URLs from your storage service
            const beforeImageUrl = beforePreview || ""
            const afterImageUrl = afterPreview || ""

            // Store image data in Convex
            await storeServiceImages({
                organizationId,
                appointmentId,
                serviceId,
                beforeImageUrl,
                afterImageUrl,
            })

            toast({
                title: "Images uploaded",
                description: "Service images have been uploaded and will be analyzed shortly.",
            })

            // Clear form
            setBeforeImage(null)
            setAfterImage(null)
            setBeforePreview(null)
            setAfterPreview(null)
        } catch (error) {
            console.error("Error uploading images:", error)
            toast({
                title: "Upload failed",
                description: "Failed to upload service images. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Camera className="mr-2 h-5 w-5 text-primary" />
                    Upload Service Images
                </CardTitle>
                <CardDescription>
                    Upload before and after images of the service to document quality and enable AI analysis.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Image */}
                    <div className="space-y-4">
                        <Label>Before Service</Label>
                        {beforePreview ? (
                            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                                <img
                                    src={beforePreview || "/placeholder.svg"}
                                    alt="Before service preview"
                                    className="object-cover w-full h-full"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={() => clearFile("before")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-md aspect-video flex flex-col items-center justify-center p-4">
                                <Camera className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">Select a before service image</p>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "before")}
                                    className="max-w-xs"
                                />
                            </div>
                        )}
                    </div>

                    {/* After Image */}
                    <div className="space-y-4">
                        <Label>After Service</Label>
                        {afterPreview ? (
                            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                                <img
                                    src={afterPreview || "/placeholder.svg"}
                                    alt="After service preview"
                                    className="object-cover w-full h-full"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={() => clearFile("after")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-md aspect-video flex flex-col items-center justify-center p-4">
                                <Camera className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">Select an after service image</p>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "after")}
                                    className="max-w-xs"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleUpload} disabled={!beforeImage || !afterImage || isUploading} className="w-full">
                    {isUploading ? (
                        <>
                            <Upload className="mr-2 h-4 w-4 animate-pulse" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Upload Images
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}

