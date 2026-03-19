"use client";

import { useState } from "react";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handle(e) {
        e.preventDefault();
        setError("");
        const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
        if (res.ok) {
            window.location.reload();
        } else {
            const data = await res.json();
            setError(data?.error || 'ログイン失敗');
        }
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-xl font-semibold mb-4">管理画面ログイン</h2>
            <form onSubmit={handle} className="space-y-3">
                <div>
                    <label className="block text-sm">パスワード</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
                </div>
                {error && <div className="text-sm text-red-600">{error}</div>}
                <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded">ログイン</button>
                </div>
            </form>
        </div>
    );
}
