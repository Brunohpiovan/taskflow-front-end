"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, UpdateCardDTO } from "@/types/card.types";
import { cardsService } from "@/services/cards.service";
import { useEnvironmentsStore } from "@/stores/environments.store";
import { useBoardsStore } from "@/stores/boards.store";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar.css";

const locales = {
    "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Card;
    color?: string;
}

export function CalendarView() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());
    const [selectedEnvId, setSelectedEnvId] = useState<string>("");

    const { simpleEnvironments, fetchSimpleEnvironments, isLoading } = useEnvironmentsStore();
    const { fetchBoards } = useBoardsStore();

    // Fetch environments on mount
    useEffect(() => {
        fetchSimpleEnvironments().catch(console.error);
    }, [fetchSimpleEnvironments]);

    // Set default environment
    useEffect(() => {
        if (simpleEnvironments.length > 0 && !selectedEnvId) {
            setSelectedEnvId(simpleEnvironments[0].id);
        }
    }, [simpleEnvironments, selectedEnvId]);


    const fetchEvents = useCallback(async () => {
        if (!selectedEnvId) return;

        try {
            const cards = await cardsService.getCalendarCards(selectedEnvId);

            const calendarEvents: CalendarEvent[] = cards
                .filter((card) => card.dueDate)
                .map((card) => {
                    const dueDate = new Date(card.dueDate!);
                    const start = new Date(dueDate.getTime() - 60 * 60 * 1000);

                    return {
                        id: card.id,
                        title: card.title,
                        start: start,
                        end: dueDate,
                        resource: card,
                    };
                });
            setEvents(calendarEvents);
        } catch (error) {
            console.error("Failed to fetch calendar cards", error);
        }
    }, [selectedEnvId]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedCard(event.resource);
        setIsModalOpen(true);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const backgroundColor = event.color || "#3174ad";
        return {
            style: {
                backgroundColor,
                borderRadius: "4px",
                opacity: 0.8,
                color: "white",
                border: "0px",
                display: "block",
            },
        };
    };

    const handleUpdateCard = async (data: UpdateCardDTO & { boardId?: string }) => {
        if (!selectedCard) return;

        try {
            // Handle move if boardId changed
            if (data.boardId && data.boardId !== selectedCard.boardId) {
                await cardsService.move(selectedCard.id, {
                    targetBoardId: data.boardId,
                    newPosition: 0, // Move to top of the new list
                });
            }

            // Remove boardId from data before calling update
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { boardId, ...updateData } = data;

            // Only call update if there are fields to update
            if (Object.keys(updateData).length > 0) {
                await cardsService.update(selectedCard.id, updateData);
            }

            await fetchEvents();
            // Close modal is handled by the component state updates usually,
            // but here we might want to ensure fresh data
        } catch (error) {
            console.error("Failed to update card", error);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 bg-background space-y-4">
            <div className="flex items-center justify-between">
                <div className="w-[300px]">
                    <Select
                        value={selectedEnvId}
                        onValueChange={setSelectedEnvId}
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                            {simpleEnvironments.map((env) => (
                                <SelectItem key={env.id} value={env.id}>
                                    {env.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex-1 min-h-[500px]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    culture="pt-BR"
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    messages={{
                        next: "Próximo",
                        previous: "Anterior",
                        today: "Hoje",
                        month: "Mês",
                        week: "Semana",
                        day: "Dia",
                        agenda: "Agenda",
                        date: "Data",
                        time: "Hora",
                        event: "Evento",
                        noEventsInRange: "Não há eventos neste período.",
                    }}
                />
            </div>

            {selectedCard && (
                <CardDetailModal
                    card={selectedCard}
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    environmentId={selectedEnvId}
                    onUpdate={handleUpdateCard}
                    onDelete={() => {
                        setIsModalOpen(false);
                        fetchEvents();
                    }}
                />
            )}
        </div>
    );
}
