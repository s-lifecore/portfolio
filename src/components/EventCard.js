"use client";

import { useState } from "react";

function truncate(text, n = 120) {
    if (!text) return "";
    return text.length > n ? text.slice(0, n).trim() + "…" : text;
}

export default function EventCard({ event }) {
    const [open, setOpen] = useState(false);

    const tags = Array.isArray(event?.tags) ? event.tags : [];

    return (
        <>
            <article
                role="button"
                tabIndex={0}
                onClick={() => setOpen(true)}
                onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true); }}
                className="bg-white shadow-sm rounded-lg p-6 border cursor-pointer hover:shadow-md transition"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${tag === "hosted"
                                        ? "bg-green-100 text-green-800"
                                        : tag === "participated"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {tag === "hosted" ? "主催" : tag === "participated" ? "参加" : tag}
                            </span>
                        ))}
                    </div>
                </div>

                {event.description && (
                    <p className="mt-4 text-sm text-gray-700">{truncate(event.description, 140)}</p>
                )}

                {event.url && (
                    <div className="mt-3">
                        <a href={event.url} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                            リンクへ移動
                        </a>
                    </div>
                )}
            </article>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6 z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{event.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">閉じる</button>
                        </div>

                        <div className="mt-4 text-sm text-gray-700 space-y-3">
                            <div>
                                <div className="font-medium">説明</div>
                                <div className="mt-1">{event.description || '-'}</div>
                            </div>

                            <div>
                                <div className="font-medium">主催</div>
                                <div className="mt-1">{event.host || (tags.includes('hosted') ? '（主催）' : '-')}</div>
                            </div>

                            <div>
                                <div className="font-medium">会場</div>
                                <div className="mt-1">{event.venue || '-'}</div>
                            </div>

                            <div>
                                <div className="font-medium">URL</div>
                                <div className="mt-1">
                                    {event.url ? (
                                        <a href={event.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{event.url}</a>
                                    ) : (
                                        '-'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
