"use client";

import { useState } from "react";
import { Amenity } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateAmenityDescription } from "@/app/admin/amenities/actions";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AmenitiesListProps {
    initialAmenities: Amenity[];
}

export default function AmenitiesList({ initialAmenities }: AmenitiesListProps) {
    const [amenities, setAmenities] = useState(initialAmenities);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const { toast } = useToast();

    const handleEdit = (amenity: Amenity) => {
        setEditingId(amenity.id);
        setEditValue(amenity.description || "");
    };

    const handleSave = async (id: number) => {
        setLoadingId(id);
        try {
            await updateAmenityDescription(id, editValue);
            setAmenities((prev) =>
                prev.map((a) => (a.id === id ? { ...a, description: editValue } : a))
            );
            setEditingId(null);
            toast({
                title: "Éxito",
                description: "Descripción actualizada correctamente.",
            });
        } catch {
            toast({
                title: "Error",
                description: "No se pudo actualizar la descripción.",
                variant: "destructive",
            });
        } finally {
            setLoadingId(null);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue("");
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {amenities.map((amenity) => (
                        <TableRow key={amenity.id}>
                            <TableCell className="font-medium">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-help underline decoration-dotted">
                                                {amenity.name}
                                            </span>
                                        </TooltipTrigger>
                                        {amenity.description && (
                                            <TooltipContent>
                                                <p>{amenity.description}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell>{amenity.category}</TableCell>
                            <TableCell>
                                {editingId === amenity.id ? (
                                    <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-8"
                                    />
                                ) : (
                                    <span
                                        className="text-muted-foreground cursor-pointer hover:text-foreground"
                                        onClick={() => handleEdit(amenity)}
                                    >
                                        {amenity.description || "Sin descripción (click para editar)"}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                {editingId === amenity.id ? (
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave(amenity.id)}
                                            disabled={loadingId === amenity.id}
                                        >
                                            {loadingId === amenity.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleCancel}
                                            disabled={loadingId === amenity.id}
                                        >
                                            X
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(amenity)}>
                                        Editar
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
