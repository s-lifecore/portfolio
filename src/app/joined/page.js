import EventsView from "../../components/EventsView";
import fs from 'fs/promises';
import path from 'path';

export default async function JoinedPage() {
    const jsonPath = path.join(process.cwd(), 'lib', 'events.json');
    let events = [];
    try {
        const raw = await fs.readFile(jsonPath, 'utf-8');
        events = JSON.parse(raw);
        events.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
        events = [];
    }

    return (
        <div className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-white to-pink-50">
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
