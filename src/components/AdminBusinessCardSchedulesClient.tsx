'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Schedule {
  id: string;
  token: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminBusinessCardSchedulesClient() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoadError('');
    try {
      const res = await fetch('/api/business-card-schedules');
      const data = await res.json();
      if (!res.ok) {
        setSchedules([]);
        setLoadError(data?.error || 'スケジュールの取得に失敗しました。');
        return;
      }
      const sorted = Array.isArray(data)
        ? data.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        : [];
      setSchedules(sorted);
    } catch (error) {
      setLoadError('通信エラーが発生しました。');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const payload = {
        token,
        start_at: startAt,
        end_at: endAt,
        is_active: isActive,
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? '/api/business-card-schedules'
        : '/api/business-card-schedules';

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data?.error || '保存に失敗しました。');
        return;
      }

      clearForm();
      await load();
    } catch (error) {
      setSaveError('通信エラーが発生しました。');
    } finally {
      setSaving(false);
    }
  }

  function clearForm() {
    setToken('');
    setStartAt('');
    setEndAt('');
    setIsActive(true);
    setEditingId(null);
    setSaveError('');
  }

  async function handleDelete(id: string) {
    if (!confirm('削除しますか？')) return;
    setSaveError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/business-card-schedules?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data?.error || '削除に失敗しました。');
        return;
      }
      if (editingId === id) clearForm();
      await load();
    } catch (error) {
      setSaveError('通信エラーが発生しました。');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(schedule: Schedule) {
    setEditingId(schedule.id);
    setToken(schedule.token);
    setStartAt(schedule.start_at.slice(0, 16)); // datetime-local形式に変換
    setEndAt(schedule.end_at.slice(0, 16));
    setIsActive(schedule.is_active);
    setSaveError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.reload();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">ビジネスカード スケジュール管理</h1>
        <div className="flex items-center space-x-2">
          <Link href="/admin" className="px-3 py-1 bg-gray-100 rounded">
            管理パネルへ戻る
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            ログアウト
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          {saveError}
        </div>
      )}

      {editingId && (
        <div className="mb-4 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm font-medium">
          編集中: <span className="font-bold">{token || editingId}</span>
        </div>
      )}

      <form onSubmit={handleAdd} className="space-y-3 mb-8">
        <div>
          <label className="block text-sm font-medium">トークン</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="sudo-event-2026"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">開始日時</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded px-3 py-2"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">終了日時</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded px-3 py-2"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            有効
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {saving ? '処理中...' : editingId ? '更新' : '追加'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => clearForm()}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>

      <section className="space-y-4">
        {loadError && (
          <div className="p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
            {loadError}
          </div>
        )}
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className={`p-4 border rounded flex justify-between items-start ${
              editingId === schedule.id ? 'border-yellow-400 bg-yellow-50' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{schedule.token}</div>
              <div className="text-sm text-gray-500">
                {new Date(schedule.start_at).toLocaleString('ja-JP')} ~{' '}
                {new Date(schedule.end_at).toLocaleString('ja-JP')}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                ステータス:{' '}
                {schedule.is_active ? (
                  <span className="text-green-600 font-semibold">有効</span>
                ) : (
                  <span className="text-gray-400">無効</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                閲覧数: {schedule.view_count}
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4 shrink-0">
              <button
                onClick={() => startEdit(schedule)}
                disabled={saving}
                className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(schedule.id)}
                disabled={saving}
                className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
