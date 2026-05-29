import EventsView from "../../components/EventsView";
import { listEvents } from "@/lib/eventsMarkdown";

export default async function JoinedPage() {
    let events = [];
    try {
        events = listEvents();
    } catch (e) {
        events = [];
    }

    return (
        <div className="relative from-rose-50">
            <div className="background-shape shape-top-right" />
            <div className="background-shape shape-bottom-left" />

            <section className="relative max-w-4xl mx-auto px-4 py-24">
                <header className="mb-8 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                    <h1 className="text-3xl font-bold text-gray-900">イベント</h1>
                    <p className="mt-2 text-gray-700">主催したものと参加したものでタグ付けしています。</p>
                </header>

                <EventsView initialEvents={events} />
            </section>
        </div>
    );
}
