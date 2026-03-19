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
        <main className="max-w-4xl mx-auto px-4 py-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">イベント</h1>
                <p className="mt-2 text-gray-600">主催したものと参加したものでタグ付けしています。</p>
            </header>

            <EventsView initialEvents={events} />
        </main>
    );
}
