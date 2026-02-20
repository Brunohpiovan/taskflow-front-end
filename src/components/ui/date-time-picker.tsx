"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Clock, X, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateTimePickerProps {
    value?: string; // YYYY-MM-DDThh:mm format (datetime-local compatible)
    onChange: (value: string) => void; // "" means "clear"
    placeholder?: string;
    id?: string;
}

function formatDisplay(value: string): string {
    if (!value) return "";
    try {
        const date = new Date(value);
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return value;
    }
}

function getStatusColor(value: string): string {
    if (!value) return "";
    try {
        const date = new Date(value);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffMs < 0) return "text-red-500 dark:text-red-400"; // overdue
        if (diffDays <= 2) return "text-amber-500 dark:text-amber-400"; // due soon
        return "text-emerald-600 dark:text-emerald-400"; // plenty of time
    } catch {
        return "";
    }
}

function getStatusBg(value: string): string {
    if (!value) return "bg-muted/50 border-border hover:border-primary/50";
    try {
        const date = new Date(value);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffMs < 0) return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 hover:border-red-400";
        if (diffDays <= 2) return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 hover:border-amber-400";
        return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400";
    } catch {
        return "bg-muted/50 border-border hover:border-primary/50";
    }
}

export function DateTimePicker({
    value = "",
    onChange,
    placeholder = "Definir prazo",
    id,
}: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const [localDate, setLocalDate] = useState("");
    const [localTime, setLocalTime] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync local state from value when popover opens
    useEffect(() => {
        if (open) {
            if (value) {
                const [datePart, timePart] = value.split("T");
                setLocalDate(datePart ?? "");
                setLocalTime(timePart ? timePart.slice(0, 5) : "00:00");
            } else {
                setLocalDate("");
                setLocalTime("00:00");
            }
        }
    }, [open, value]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    function handleConfirm() {
        if (!localDate) {
            onChange("");
        } else {
            const time = localTime || "00:00";
            onChange(`${localDate}T${time}`);
        }
        setOpen(false);
    }

    function handleClear() {
        onChange("");
        setOpen(false);
    }

    const displayText = formatDisplay(value);
    const statusColor = getStatusColor(value);
    const statusBg = getStatusBg(value);
    const hasValue = Boolean(value);

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                id={id}
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`
          w-full flex items-center gap-2 px-3 py-2 rounded-md border text-sm
          transition-all duration-200 cursor-pointer text-left
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1
          ${statusBg}
        `}
            >
                <Calendar
                    className={`h-4 w-4 flex-shrink-0 transition-colors ${hasValue ? statusColor : "text-muted-foreground"}`}
                />
                <span className={`flex-1 ${hasValue ? statusColor + " font-medium" : "text-muted-foreground"}`}>
                    {displayText || placeholder}
                </span>
                {hasValue && (
                    <span
                        role="button"
                        aria-label="Limpar data"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </span>
                )}
                <ChevronDown
                    className={`h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {/* Popover */}
            {open && (
                <div
                    className="
            absolute z-50 left-0 mt-1.5 w-72
            bg-popover border border-border rounded-xl shadow-lg
            p-4 space-y-4
            animate-in fade-in-0 zoom-in-95 duration-150
          "
                >
                    <div className="space-y-3">
                        {/* Date */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                <Calendar className="h-3.5 w-3.5" />
                                Data
                            </label>
                            <input
                                type="date"
                                value={localDate}
                                onChange={(e) => {
                                    if (e.target.value === "") {
                                        // Native browser "Clear" button was clicked
                                        handleClear();
                                    } else {
                                        setLocalDate(e.target.value);
                                    }
                                }}
                                className="
                  w-full h-9 px-3 rounded-md border border-input bg-background text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-colors cursor-pointer
                  [color-scheme:light] dark:[color-scheme:dark]
                "
                            />
                        </div>

                        {/* Time */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                <Clock className="h-3.5 w-3.5" />
                                Hora
                            </label>
                            <input
                                type="time"
                                value={localTime}
                                onChange={(e) => setLocalTime(e.target.value)}
                                disabled={!localDate}
                                className="
                  w-full h-9 px-3 rounded-md border border-input bg-background text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-colors cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed
                  [color-scheme:light] dark:[color-scheme:dark]
                "
                            />
                        </div>
                    </div>

                    {/* Quick shortcuts */}
                    {!localDate && (
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                { label: "Hoje", days: 0 },
                                { label: "Amanhã", days: 1 },
                                { label: "Em 1 semana", days: 7 },
                            ].map(({ label, days }) => {
                                const d = new Date();
                                d.setDate(d.getDate() + days);
                                const dateStr = d.toISOString().slice(0, 10);
                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => {
                                            setLocalDate(dateStr);
                                            if (!localTime) setLocalTime("09:00");
                                        }}
                                        className="
                      text-xs px-2.5 py-1 rounded-full border border-border
                      bg-muted/60 hover:bg-primary/10 hover:border-primary/40
                      transition-all duration-150 text-muted-foreground hover:text-primary
                    "
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1 border-t border-border">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="flex-1 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Limpar
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleConfirm}
                            disabled={!localDate}
                            className="flex-1 h-8"
                        >
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            Confirmar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
