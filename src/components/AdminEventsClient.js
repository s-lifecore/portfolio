"use client";

import { useEffect, useState } from "react";

export default function AdminEventsClient() {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [hosted, setHosted] = useState(false);
    const [participated, setParticipated] = useState(false);
    const [host, setHost] = useState("");
    const [venue, setVenue] = useState("");
    const [url, setUrl] = useState("");
    const [reviewUrl, setReviewUrl] = useState("");
    const [editingId, setEditingId] = useState(null);

    async function load() {
        const res = await fetch('/api/events');
        const data = await res.json();
        const sorted = (data || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
        setEvents(sorted);
    }

    useEffect(() => { load(); }, []);

    async function handleAdd(e) {
        e.preventDefault();
        const tags = [];
        if (hosted) tags.push('hosted');
        if (participated) tags.push('participated');
        const payload = { title, date, description, tags };
        if (host) payload.host = host;
        if (venue) payload.venue = venue;
        if (url) payload.url = url;
        if (reviewUrl) payload.reviewUrl = reviewUrl;

        if (editingId) {
            // update
            payload.id = editingId;
            const res = await fetch('/api/events', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) {
                clearForm();
                load();
            }
        } else {
            // create
            const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) {
                clearForm();
                load();
            }
        }
    }

    function clearForm() {
        setTitle(''); setDate(''); setDescription(''); setHosted(false); setParticipated(false);
        setHost(''); setVenue(''); setUrl(''); setReviewUrl('');
        setEditingId(null);
    }

    async function handleDelete(id) {
        if (!confirm('削除しますか？')) return;
        await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
        // if deleting currently editing item, clear form
        if (editingId === id) clearForm();
        load();
    }

    function startEdit(ev) {
        setEditingId(ev.id);
        setTitle(ev.title || '');
        setDate(ev.date || '');
        setDescription(ev.description || '');
        setHosted(Array.isArray(ev.tags) && ev.tags.includes('hosted'));
        setParticipated(Array.isArray(ev.tags) && ev.tags.includes('participated'));
        setHost(ev.host || '');
        setVenue(ev.venue || '');
        setUrl(ev.url || '');
        setReviewUrl(ev.reviewUrl || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    <label className="block text-sm font-medium">主催者</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={host} onChange={(e) => setHost(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium">会場</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={venue} onChange={(e) => setVenue(e.target.value)} />
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
                    <label className="block text-sm font-medium">外部URL</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                    <label className="block text-sm font-medium">感想ページURL</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded">{editingId ? '更新' : '追加'}</button>
                    {editingId && (
                        <button type="button" onClick={() => clearForm()} className="px-4 py-2 bg-gray-200 rounded">キャンセル</button>
                    )}
                </div>
            </form>

            <section className="space-y-4">
                {events.map((ev) => (
                    <div key={ev.id} className="p-4 border rounded flex justify-between items-start">
                        <div>
                            <div className="font-semibold">{ev.title}</div>
                            <div className="text-sm text-gray-500">{ev.date} · {ev.tags?.join(', ')}</div>
                            <div className="mt-2 text-sm">{ev.description}</div>
                            <div className="mt-2 text-sm">
                                {ev.url && (
                                    <a href={ev.url} target="_blank" rel="noreferrer" className="text-blue-600 underline mr-3">外部リンク</a>
                                )}
                                {ev.reviewUrl && (
                                    <a href={ev.reviewUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">感想ページ</a>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                            <button onClick={() => startEdit(ev)} className="px-3 py-1 bg-yellow-500 text-white rounded">編集</button>
                            <button onClick={() => handleDelete(ev.id)} className="px-3 py-1 bg-red-500 text-white rounded">削除</button>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}
