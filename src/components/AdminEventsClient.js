"use client";

import { useEffect, useState } from "react";

export default function AdminEventsClient() {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [hosted, setHosted] = useState(false);
    const [participated, setParticipated] = useState(false);

    async function load() {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data);
    }

    useEffect(() => { load(); }, []);

    async function handleAdd(e) {
        e.preventDefault();
        const tags = [];
        if (hosted) tags.push('hosted');
        if (participated) tags.push('participated');

        const payload = { title, date, description, tags };
        const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
            setTitle(''); setDate(''); setDescription(''); setHosted(false); setParticipated(false);
            load();
        }
    }

    async function handleDelete(id) {
        if (!confirm('削除しますか？')) return;
        await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
        load();
    }

    async function handleLogout() {
        await fetch('/api/admin/login', { method: 'DELETE' });
        window.location.reload();
    }

    return (
        <main className="max-w-4xl mx-auto px-4 py-24">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">イベント管理</h1>
                <button onClick={handleLogout} className="px-3 py-1 bg-gray-200 rounded">ログアウト</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 mb-8">
                <div>
                    <label className="block text-sm font-medium">タイトル</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-sm font-medium">日付</label>
                    <input type="date" className="mt-1 border rounded px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-sm font-medium">説明</label>
                    <textarea className="mt-1 w-full border rounded px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2"><input type="checkbox" checked={hosted} onChange={(e) => setHosted(e.target.checked)} /> <span>主催</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" checked={participated} onChange={(e) => setParticipated(e.target.checked)} /> <span>参加</span></label>
                </div>
                <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded">追加</button>
                </div>
            </form>

            <section className="space-y-4">
                {events.map((ev) => (
                    <div key={ev.id} className="p-4 border rounded flex justify-between items-start">
                        <div>
                            <div className="font-semibold">{ev.title}</div>
                            <div className="text-sm text-gray-500">{ev.date} · {ev.tags?.join(', ')}</div>
                            <div className="mt-2 text-sm">{ev.description}</div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                            <button onClick={() => handleDelete(ev.id)} className="px-3 py-1 bg-red-500 text-white rounded">削除</button>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}
