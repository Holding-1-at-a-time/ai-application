"use client"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Car, Wrench, Calendar, MapPin, MessageSquare } from "lucide-react"

interface EntityVisualizationProps {
    organizationId: string
    source?: string
    limit?: number
}

export default function EntityVisualization({ organizationId, source, limit = 5 }: EntityVisualizationProps) {
    const entityRecognitions = useQuery(api.nlp.getRecentEntityRecognitions, {
        organizationId,
        source,
        limit,
    })

    if (!entityRecognitions) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Entity Recognition</CardTitle>
                    <CardDescription>Detected entities from recent communications</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    Entity Recognition
                </CardTitle>
                <CardDescription>
                    {source ? `Detected entities from ${source} communications` : "Detected entities from recent communications"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {entityRecognitions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <p>No entity recognitions available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {entityRecognitions.map((recognition) => (
                            <div key={recognition._id} className="space-y-4">
                                <div className="bg-muted/40 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline">{recognition.source}</Badge>
                                        <Badge variant="outline">
                                            {recognition.language.detected} ({(recognition.language.confidence * 100).toFixed(0)}%)
                                        </Badge>
                                    </div>
                                    <p className="text-sm">{recognition.text}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Car Models */}
                                    {recognition.entities.carModels.length > 0 && (
                                        <div className="border rounded-lg p-3">
                                            <h4 className="font-medium flex items-center mb-2">
                                                <Car className="mr-2 h-4 w-4 text-blue-500" />
                                                Car Models
                                            </h4>
                                            <div className="space-y-2">
                                                {recognition.entities.carModels.map((model, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <span className="text-sm">{model.brand ? `${model.brand} ${model.name}` : model.name}</span>
                                                        <Badge variant="outline">{(model.confidence * 100).toFixed(0)}%</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Service Types */}
                                    {recognition.entities.serviceTypes.length > 0 && (
                                        <div className="border rounded-lg p-3">
                                            <h4 className="font-medium flex items-center mb-2">
                                                <Wrench className="mr-2 h-4 w-4 text-green-500" />
                                                Service Types
                                            </h4>
                                            <div className="space-y-2">
                                                {recognition.entities.serviceTypes.map((service, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <span className="text-sm">
                                                            {service.category ? `${service.name} (${service.category})` : service.name}
                                                        </span>
                                                        <Badge variant="outline">{(service.confidence * 100).toFixed(0)}%</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    {recognition.entities.dates.length > 0 && (
                                        <div className="border rounded-lg p-3">
                                            <h4 className="font-medium flex items-center mb-2">
                                                <Calendar className="mr-2 h-4 w-4 text-yellow-500" />
                                                Dates
                                            </h4>
                                            <div className="space-y-2">
                                                {recognition.entities.dates.map((date, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <span className="text-sm">
                                                            {date.value} <span className="text-xs text-muted-foreground">({date.type})</span>
                                                        </span>
                                                        <Badge variant="outline">{(date.confidence * 100).toFixed(0)}%</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Locations */}
                                    {recognition.entities.locations.length > 0 && (
                                        <div className="border rounded-lg p-3">
                                            <h4 className="font-medium flex items-center mb-2">
                                                <MapPin className="mr-2 h-4 w-4 text-red-500" />
                                                Locations
                                            </h4>
                                            <div className="space-y-2">
                                                {recognition.entities.locations.map((location, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <span className="text-sm">{location.value}</span>
                                                        <Badge variant="outline">{(location.confidence * 100).toFixed(0)}%</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-primary/5 p-3 rounded-lg">
                                    <h4 className="font-medium mb-1">Summary</h4>
                                    <p className="text-sm text-muted-foreground">{recognition.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

