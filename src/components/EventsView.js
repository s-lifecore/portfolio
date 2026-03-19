"use client";

import { useState } from "react";
import EventCard from "./EventCard";

export default function EventsView({ initialEvents = [] }) {
    const [filter, setFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc"); // 'desc' or 'asc'
    const [year, setYear] = useState("all");
    const [query, setQuery] = useState("");

    const years = Array.from(
        new Set(
            (initialEvents || [])
                .map((e) => {
                    const d = new Date(e?.date);
                    return isNaN(d) ? null : d.getFullYear();
                })
                .filter(Boolean)
        )
    ).sort((a, b) => b - a);

    let processed = (initialEvents || []).slice();

    if (filter !== "all") processed = processed.filter((e) => e.tags?.includes(filter));

    if (year !== "all") {
        processed = processed.filter((e) => {
            const d = new Date(e?.date);
            return !isNaN(d) && String(d.getFullYear()) === String(year);
        });
    }

    if (query.trim()) {
        const q = query.trim().toLowerCase();
        processed = processed.filter((e) => {
            return (
                String(e?.title || "").toLowerCase().includes(q) ||
                String(e?.description || "").toLowerCase().includes(q)
            );
        });
    }

    processed.sort((a, b) => {
        const da = new Date(a?.date);
        const db = new Date(b?.date);
        const diff = (isNaN(da) ? 0 : da.getTime()) - (isNaN(db) ? 0 : db.getTime());
        return sortOrder === "desc" ? -diff : diff;
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1 rounded-md font-medium ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                    >
                        全て
                    </button>
                    <button
                        onClick={() => setFilter("hosted")}
                        className={`px-3 py-1 rounded-md font-medium ${filter === "hosted" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}
                    >
                        主催
                    </button>
                    <button
                        onClick={() => setFilter("participated")}
                        className={`px-3 py-1 rounded-md font-medium ${filter === "participated" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                    >
                        参加
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="検索（タイトル・説明）"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border rounded px-3 py-1"
                    />
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded px-3 py-1">
                        <option value="all">すべての年</option>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}年</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="px-3 py-1 bg-gray-100 rounded"
                    >
                        {sortOrder === "desc" ? "最新順" : "古い順"}
                    </button>
                </div>
            </div>

            <section className="grid gap-4">
                {processed.map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                ))}
            </section>
        </div>
    );
}
