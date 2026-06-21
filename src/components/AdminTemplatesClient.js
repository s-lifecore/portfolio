"use client";

import { useEffect, useState } from 'react';

export default function AdminTemplatesClient() {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    async function load() {
        setError('');
        const res = await fetch('/api/templates');
        const data = await res.json();
        if (!res.ok) { setError(data?.error || '取得失敗'); return; }
        setItems(Array.isArray(data) ? data : []);
    }

    useEffect(() => { load(); }, []);

    async function openTemplate(id) {
        setError('');
        const res = await fetch(`/api/templates?id=${id}`);
        const data = await res.json();
        if (!res.ok) { setError(data?.error || '取得失敗'); return; }
        setSelected(data.id); setContent(data.content || '');
    }

    async function handleSave() {
        if (!selected) return;
        setSaving(true); setError('');
        try {
            const res = await fetch('/api/templates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected, content }) });
            if (!res.ok) { const d = await res.json().catch(()=>({})); setError(d?.error || '保存失敗'); return; }
            await load();
        } finally { setSaving(false); }
    }

    async function handleCreate() {
        const id = prompt('新しいテンプレートID (英数字とハイフン):');
        if (!id) return;
        setSaving(true); setError('');
        try {
            const res = await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, content: '' }) });
            if (!res.ok) { const d = await res.json().catch(()=>({})); setError(d?.error || '作成失敗'); return; }
            await load();
        } finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!confirm('テンプレートを削除しますか？')) return;
        setSaving(true); setError('');
        try {
            const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
            if (!res.ok) { const d = await res.json().catch(()=>({})); setError(d?.error || '削除失敗'); return; }
            setSelected(null); setContent(''); await load();
        } finally { setSaving(false); }
    }

    return (
        <main className="max-w-4xl mx-auto px-4 py-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">テンプレート管理</h1>
                <div className="space-x-2">
                    <button onClick={handleCreate} className="px-3 py-1 bg-blue-600 text-white rounded">新規テンプレート</button>
                </div>
            </div>

            {error && <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <aside className="col-span-1">
                    <ul className="space-y-2">
                        {items.map(it => (
                            <li key={it.id} className="p-2 border rounded flex justify-between items-center">
                                <button onClick={()=>openTemplate(it.id)} className="text-left">{it.id}</button>
                                <div className="space-x-1">
                                    <button onClick={()=>handleDelete(it.id)} className="text-sm text-red-600">削除</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </aside>
                <section className="col-span-2">
                    {selected ? (
                        <>
                            <div className="mb-2 text-sm text-gray-600">編集: {selected}</div>
                            <textarea rows={18} className="w-full border rounded p-3" value={content} onChange={(e)=>setContent(e.target.value)} />
                            <div className="mt-2 flex items-center space-x-2">
                                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">{saving ? '保存中...' : '保存'}</button>
                                <button onClick={()=>{ setSelected(null); setContent(''); }} className="px-4 py-2 bg-gray-200 rounded">閉じる</button>
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500">テンプレートを選択してください。</div>
                    )}
                </section>
            </div>
        </main>
    );
}
