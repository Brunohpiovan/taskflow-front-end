import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
    return (
        <div className="flex flex-col h-full">
            <header className="border-b px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
                <p className="text-muted-foreground text-sm">
                    Visualize os prazos de suas tarefas
                </p>
            </header>
            <main className="flex-1 overflow-hidden">
                <CalendarView />
            </main>
        </div>
    );
}
