import { fetchQiitaArticles, fetchRssArticles } from '../../lib/fetchArticles';
import Header from '../../components/Header';
import { formatDate, getBadgeColor } from '../../utils/formatters';
import Link from 'next/link';
import '../../styles/globals.css';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
    const qiita = await fetchQiitaArticles('takumi1227');
    // const zenn = await fetchRssArticles('https://zenn.dev/sudo_dev/feed', 'Zenn');

    // const articles = [...qiita, ...zenn].sort(
    const articles = [...qiita].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    return (
        <div>
            <Header className="pb-6" />
            <div className="background-shape shape-top-right" />
            <div className="background-shape shape-bottom-left" />
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex justify-end mb-4">
                    <Link
                        href="/blogs/private"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <span>技術記事以外はこちら</span>
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
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
                <div className="flex justify-end mb-4">
                    <Link
                        href="/blogs/private"
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <span>技術記事以外はこちら</span>
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
