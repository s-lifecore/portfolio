"use client";

import { useEffect, useState, useRef } from "react";
import { getTemplateForCategory } from '../lib/recruitmentTemplates';
import Link from "next/link";

export default function AdminRecruitmentsClient() {
    const [items, setItems] = useState([]);
    const [loadError, setLoadError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [idField, setIdField] = useState("");
    const [summary, setSummary] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [descriptionPlaceholder, setDescriptionPlaceholder] = useState('');
    const [templateOptions, setTemplateOptions] = useState([]);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [requirements, setRequirements] = useState("");
    const [welcomeSkills, setWelcomeSkills] = useState("");
    const [editingId, setEditingId] = useState(null);

    async function load() {
        setLoadError("");
        const res = await fetch('/api/recruitments');
        const data = await res.json();
        if (!res.ok) { setItems([]); setLoadError(data?.error || '取得失敗'); return; }
        setItems(Array.isArray(data) ? data : []);
    }

    useEffect(() => { load(); }, []);

    async function fetchTemplateList() {
        const res = await fetch('/api/templates');
        if (!res.ok) return;
        const data = await res.json();
        setTemplateOptions(Array.isArray(data) ? data : []);
    }

    async function insertTemplate(id) {
        if (!id) return;
        if (description && description.trim().length > 0) {
            const ok = confirm('現在の本文を上書きします。よろしいですか？（キャンセルで追記）');
            if (!ok) {
                // append
                const resA = await fetch(`/api/templates?id=${id}`);
                if (!resA.ok) return;
                const d = await resA.json();
                setDescription((prev) => prev + '\n\n' + (d.content || ''));
                setShowTemplatePicker(false);
                return;
            }
        }
        const res = await fetch(`/api/templates?id=${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setDescription(data.content || '');
        setShowTemplatePicker(false);
    }

    // update placeholder template when category changes (only for new entries)
    useEffect(() => {
        if (editingId) return; // skip when editing existing
        if (description && description.trim().length > 0) return; // don't override filled description
        const tpl = getTemplateForCategory(category);
        setDescriptionPlaceholder(tpl || '');
    }, [category, editingId, description]);

    const categoryOptions = Array.from(new Set(items.map(it => (it.category || '').trim()).filter(Boolean)));
    const categoryRef = useRef(null);
    const [showCatDrop, setShowCatDrop] = useState(false);
    const [positionUp, setPositionUp] = useState(false);

    function openCategoryList() {
        const input = categoryRef.current;
        if (!input) { setShowCatDrop(true); return; }
        const rect = input.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setPositionUp(spaceBelow < 240);
        setShowCatDrop(true);
    }

    function parseListInput(text) {
        return text.split('\n').map(s => s.trim()).filter(Boolean);
    }

    async function handleAdd(e) {
        e.preventDefault();
        setSaveError(""); setSaving(true);
        try {
            const payload = {
                // use provided id (filename) if present, otherwise backend will slugify
                ...(idField ? { id: idField } : {}),
                title, summary, category, location,
                description,
                requirements: parseListInput(requirements),
                welcomeSkills: parseListInput(welcomeSkills),
            };
            // if editing and no explicit idField provided, keep editingId
            if (editingId && !idField) payload.id = editingId;

            const res = await fetch('/api/recruitments', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const d = await res.json().catch(()=>({})); setSaveError(d?.error || '保存失敗'); return; }
            clearForm(); await load();
        } finally { setSaving(false); }
    }

    function clearForm() {
        setIdField(''); setTitle(''); setSummary(''); setCategory(''); setLocation(''); setDescription('');
        setRequirements(''); setWelcomeSkills(''); setEditingId(null); setSaveError('');
    }

    async function handleDelete(id) {
        if (!confirm('削除しますか？')) return;
        setSaveError(''); setSaving(true);
        try {
            const res = await fetch(`/api/recruitments?id=${id}`, { method: 'DELETE' });
            if (!res.ok) { const d = await res.json().catch(()=>({})); setSaveError(d?.error || '削除失敗'); return; }
            if (editingId === id) clearForm(); await load();
        } finally { setSaving(false); }
    }

    function startEdit(it) {
        setEditingId(it.id);
        setIdField(it.id || '');
        setTitle(it.title || ''); setSummary(it.summary || ''); setCategory(it.category || ''); setLocation(it.location || '');
        setDescription(it.description || ''); setRequirements((it.requirements || []).join('\n')); setWelcomeSkills((it.welcomeSkills || []).join('\n'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <main className="max-w-4xl mx-auto px-4 py-24">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">募集管理</h1>
                <div className="flex items-center space-x-2">
                    <Link href="/" className="px-3 py-1 bg-gray-100 rounded">ホームへ戻る</Link>
                </div>
            </div>

            {saveError && <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">{saveError}</div>}

            <form onSubmit={handleAdd} className="space-y-3 mb-8">
                <div>
                    <label className="block text-sm font-medium">ファイル名 / id <span className="ml-2 text-sm text-gray-500">(任意)</span></label>
                    <input className="mt-1 w-full border rounded px-3 py-2 placeholder-gray-400" value={idField} onChange={(e)=>setIdField(e.target.value)} placeholder="例: frontend" />
                    <div className="text-xs text-gray-400 mt-1">テンプレート: frontend → frontend.md</div>
                </div>
                <div>
                    <label className="block text-sm font-medium">タイトル <span className="text-red-500">*</span></label>
                    <input className="mt-1 w-full border rounded px-3 py-2 placeholder-gray-400" value={title} onChange={(e)=>setTitle(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-sm font-medium">要約 <span className="ml-2 text-sm text-gray-500">(任意)</span></label>
                    <input className="mt-1 w-full border rounded px-3 py-2 placeholder-gray-400" value={summary} onChange={(e)=>setSummary(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                            <label className="block text-sm font-medium">カテゴリ <span className="ml-2 text-sm text-gray-500">(任意)</span></label>
                            <div className="relative">
                                <input ref={categoryRef} onFocus={openCategoryList} onChange={(e)=>{ setCategory(e.target.value); setShowCatDrop(true); }} value={category} className="mt-1 w-full border rounded px-3 py-2 placeholder-gray-400" placeholder="過去のカテゴリを選択できます" />
                                {showCatDrop && categoryOptions.length > 0 && (
                                    <ul
                                        onMouseDown={(e)=>e.preventDefault()}
                                        className={`absolute left-0 right-0 z-50 bg-white border rounded shadow max-h-60 overflow-auto ${positionUp ? 'bottom-full mb-2' : 'mt-2 top-full'}`}>
                                        {categoryOptions.map((c) => (
                                            <li key={c} onMouseDown={(e)=>{ e.preventDefault(); setCategory(c); setShowCatDrop(false); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{c}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {categoryOptions.length > 0 && <div className="text-xs text-gray-400 mt-1">過去に使用したカテゴリ: {categoryOptions.join('、')}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">場所 <span className="ml-2 text-sm text-gray-500">(任意)</span></label>
                        <input className="mt-1 w-full border rounded px-3 py-2 placeholder-gray-400" value={location} onChange={(e)=>setLocation(e.target.value)} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium">本文（Markdown） <span className="ml-2 text-sm text-gray-500">(任意)</span></label>
                        <div className="flex items-center space-x-2">
                            <button type="button" onClick={async ()=>{ await fetchTemplateList(); setShowTemplatePicker(!showTemplatePicker); }} className="text-sm px-2 py-1 bg-gray-100 rounded">テンプレートを挿入</button>
                        </div>
                    </div>
                    {showTemplatePicker && (
                        <div className="mt-2 mb-2 border rounded p-2 bg-white max-h-48 overflow-auto">
                            {templateOptions.length === 0 && <div className="text-sm text-gray-500">テンプレートがありません</div>}
                            <ul className="space-y-1">
                                {templateOptions.map(t => (
                                    <li key={t.id} className="flex items-center justify-between">
                                        <button type="button" onClick={()=>insertTemplate(t.id)} className="text-left px-2 py-1 hover:bg-gray-50 w-full">{t.id}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <textarea className="mt-1 w-full border rounded px-3 py-2 placeholder-gray-400" rows={10} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder={descriptionPlaceholder || `例:\n- 仕事の内容\n- 応募方法`} />
                </div>
                <div>
                    <label className="block text-sm font-medium">応募条件（改行で複数） <span className="ml-2 text-sm text-gray-500">(任意)</span></label>
                    <textarea className="mt-1 w-full border rounded px-3 py-2 placeholder-gray-400" rows={3} value={requirements} onChange={(e)=>setRequirements(e.target.value)} placeholder={`例:\n- 実務3年以上\n- React経験`} />
                </div>
                <div>
                    <label className="block text-sm font-medium">歓迎スキル（改行で複数） <span className="ml-2 text-sm text-gray-500">(任意)</span></label>
                    <textarea className="mt-1 w-full border rounded px-3 py-2 placeholder-gray-400" rows={3} value={welcomeSkills} onChange={(e)=>setWelcomeSkills(e.target.value)} placeholder={`例:\n- TypeScript\n- CI/CDの経験`} />
                </div>
                <div className="flex items-center space-x-2">
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving ? '処理中...' : editingId ? '更新' : '追加'}</button>
                    {editingId && <button type="button" onClick={() => clearForm()} className="px-4 py-2 bg-gray-200 rounded">キャンセル</button>}
                </div>
            </form>

            <section className="space-y-4">
                {loadError && <div className="p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">{loadError}</div>}
                {items.map((it) => (
                    <div key={it.id} className="p-4 border rounded flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            {it._filename && <div className="text-xs text-gray-400">{it._filename}</div>}
                            <div className="font-semibold">{it.title}</div>
                            <div className="text-sm text-gray-500">{it.category} · {it.location}</div>
                            {it.summary && <div className="mt-2 text-sm text-gray-700">{it.summary}</div>}
                            {it.description && <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">{it.description}</div>}
                        </div>
                        <div className="flex flex-col space-y-2 ml-4 shrink-0">
                            <button onClick={() => startEdit(it)} disabled={saving} className="px-3 py-1 bg-yellow-500 text-white rounded">編集</button>
                            <button onClick={() => handleDelete(it.id)} disabled={saving} className="px-3 py-1 bg-red-500 text-white rounded">削除</button>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}
