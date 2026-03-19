"use client";

export default function EventCard({ event }) {
    return (
        <article className="bg-white shadow-sm rounded-lg p-6 border">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                    {event.tags.map((tag) => (
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
                <p className="mt-4 text-sm text-gray-700">{event.description}</p>
            )}
        </article>
    );
}
