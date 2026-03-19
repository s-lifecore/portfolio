"use client";

import { useState } from "react";
import EventCard from "./EventCard";

export default function EventsView({ initialEvents = [] }) {
    const [filter, setFilter] = useState("all");

    const filtered = filter === "all" ? initialEvents : initialEvents.filter((e) => e.tags?.includes(filter));

    return (
        <div>
            <div className="flex items-center space-x-3 mb-6">
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

            <section className="grid gap-4">
                {filtered.map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                ))}
            </section>
        </div>
    );
}
