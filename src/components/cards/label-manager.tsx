"use client";

import { useEffect, useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { labelsService } from "@/services/labels.service";
import { Label as LabelType } from "@/types/card.types";
import { cn } from "@/lib/utils";

interface LabelManagerProps {
    environmentId: string;
    selectedLabels: LabelType[];
    onChange: (labels: LabelType[]) => void;
}

const COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#a855f7", // purple-500
    "#ec4899", // pink-500
];

export function LabelManager({ environmentId, selectedLabels, onChange }: LabelManagerProps) {
    const [availableLabels, setAvailableLabels] = useState<LabelType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // New label form
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState(COLORS[0]);

    useEffect(() => {
        loadLabels();
    }, [environmentId]);

    const loadLabels = async () => {
        try {
            setLoading(true);
            const data = await labelsService.getByEnvironmentId(environmentId);
            setAvailableLabels(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load labels", error);
        } finally {
            setLoading(false);
        }
    };

    const selectedIds = selectedLabels.map(l => l.id);

    const toggleLabel = (label: LabelType) => {
        const isSelected = selectedIds.includes(label.id);
        const newSelected = isSelected
            ? selectedLabels.filter(l => l.id !== label.id)
            : [...selectedLabels, label];

        // Call onChange immediately to update UI
        onChange(newSelected);
    };

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) return;
        try {
            const label = await labelsService.create({
                environmentId,
                name: newLabelName.trim(),
                color: newLabelColor,
            });
            setAvailableLabels([...availableLabels, label]);
            setNewLabelName("");
            setIsCreating(false);
            // Auto-select the new label
            onChange([...selectedLabels, label]);
            toast.success("Etiqueta criada");
        } catch (error) {
            toast.error("Erro ao criar etiqueta");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Etiquetas</Label>
                <Popover open={isCreating} onOpenChange={setIsCreating}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                            <Plus className="mr-1 h-3 w-3" />
                            Nova
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="end">
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Nova Etiqueta</h4>
                            <Input
                                placeholder="Nome da etiqueta"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                className="h-8"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={cn(
                                            "w-6 h-6 rounded-full border border-border transition-all hover:scale-110",
                                            newLabelColor === color && "ring-2 ring-primary ring-offset-1"
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewLabelColor(color)}
                                    />
                                ))}
                            </div>
                            <Button size="sm" className="w-full" onClick={handleCreateLabel}>
                                Criar
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
                {selectedLabels.map((label) => (
                    <div
                        key={label.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                        style={{ backgroundColor: label.color }}
                    >
                        {label.name}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleLabel(label);
                            }}
                            className="hover:bg-black/20 rounded-full p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                {selectedLabels.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Nenhuma etiqueta selecionada</span>
                )}
            </div>

            <div className="border rounded-md p-2 space-y-1.5 max-h-[120px] overflow-y-auto">
                {availableLabels.length === 0 ? (
                    <p className="text-xs text-center py-2 text-muted-foreground">Sem etiquetas disponíveis</p>
                ) : (
                    availableLabels.map((label) => (
                        <div
                            key={label.id}
                            className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded-sm cursor-pointer"
                            onClick={() => toggleLabel(label)}
                        >
                            <Checkbox
                                checked={selectedIds.includes(label.id)}
                                onCheckedChange={() => toggleLabel(label)}
                            />
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: label.color }}
                            />
                            <span className="text-sm">{label.name}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
