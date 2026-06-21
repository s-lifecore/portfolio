'use client';

import { useState, useEffect } from 'react';
import { fetchQiitaArticles, fetchRssArticles } from '../../../lib/fetchArticles';
import Header from '../../../components/Header';
import { formatDate, getBadgeColor } from '../../../utils/formatters';
import '../../../styles/globals.css';
import Link from 'next/link';

export default function PrivatePage() {
    const [input, setInput] = useState('');
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);

    // 複数のキーワードを配列として取得
    const validKeywords = [
        process.env.NEXT_PUBLIC_PRIVATE_KEYWORD_1,
        process.env.NEXT_PUBLIC_PRIVATE_KEYWORD_2,
        process.env.NEXT_PUBLIC_PRIVATE_KEYWORD_3,
        process.env.NEXT_PUBLIC_PRIVATE_KEYWORD_4
    ].filter(Boolean); // undefinedや空の値を除外

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const qiita = await fetchQiitaArticles('takumi1227');
            const zenn = await fetchRssArticles('https://zenn.dev/sudo_dev/feed', 'Zenn');
            const note = await fetchRssArticles('https://note.com/link_sudo/rss', 'Note');

            // すべての記事を表示（noteを含む）
            const allArticles = [...qiita, ...zenn, ...note]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            if (allArticles.length === 0) {
                setError('記事が見つかりませんでした');
            } else {
                setArticles(allArticles);
                setError('');
            }
        } catch (err) {
            console.error('記事取得エラー:', err);
            setError('記事の読み込み中にエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const inputLower = input.trim().toLowerCase();
        
        // いずれかのキーワードに一致するか確認
        if (validKeywords.some(keyword => keyword?.toLowerCase() === inputLower)) {
            setVerified(true);
            setError('');
            await fetchArticles();
        } else {
            setError('キーワードが間違っています。もう一度お試しください。');
        }
    };

    return (
        <div>
            <Header className="pb-6" />
            <div className="background-shape shape-top-right" />
            <div className="background-shape shape-bottom-left" />
            <div className="max-w-5xl mx-auto p-6">
                {!verified ? (
                    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4 mt-12">
                        <label className="text-lg font-semibold text-gray-700">
                            限定公開記事にアクセスするには、キーワードを入力してください。
                        </label>
                        <p className="text-sm text-gray-500">私が参加している課外活動名（小文字6文字）</p>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="例: sudoxx"
                            className="border rounded px-4 py-2 w-64 text-center"
                        />
                        {error && <p className="text-red-500">{error}</p>}
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            アクセスする
                        </button>
                    </form>
                ) : loading ? (
                    <div className="flex justify-center items-center mt-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="text-center mt-12 text-red-500">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        {articles.map((article, i) => (
                            <a
                                key={i}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white border border-gray-200 rounded-2xl shadow hover:shadow-md transition p-4"
                            >
                                <div className="text-sm text-gray-400 mb-1">
                                    {formatDate(article.date)}
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {article.title}
                                </h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <img
                                        src={`/icons/${article.source.toLowerCase()}.png`}
                                        alt={article.source}
                                        className="w-4 h-4"
                                    />
                                    <span className={`text-xs px-2 py-1 rounded ${getBadgeColor(article.source)}`}>
                                        {article.source}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-end mb-4">
                    <Link
                        href="/blogs"
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <span>技術記事はこちら</span>
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
        </div>
    );
}