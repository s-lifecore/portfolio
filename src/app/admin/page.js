import Link from 'next/link';

export const metadata = { title: '管理パネル' };

export default function AdminIndex() {
    return (
        <main className="max-w-3xl mx-auto py-24 px-4">
            <h1 className="text-2xl font-bold mb-6">管理パネル</h1>
            <p className="mb-6 text-sm text-gray-600">編集したいセクションを選んでください。</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/admin/events" className="p-6 border rounded hover:bg-gray-50 text-center">イベント管理</Link>
                <Link href="/admin/recruitments" className="p-6 border rounded hover:bg-gray-50 text-center">募集管理</Link>
            </div>
        </main>
    );
}
