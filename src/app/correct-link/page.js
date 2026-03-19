"use client";

import { useState } from "react";
import "../../styles/globals.css";

const aboutData = {
    tech: [
        { name: "Qiita", link: "https://qiita.com/takumi1227" },
        { name: "GitHub", link: "https://github.com/s-taku0502?tab=repositories" },
    ],
    sns: [
        { name: "X(Twitter)", link: "https://x.com/ocean_t_umi" },
    ],
};

function ToggleSection({ title, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4 border-b border-gray-300 dark:border-gray-600">
            <button
                className="text-lg font-semibold w-full text-left p-3 bg-gray-200 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                <span className="transition-transform duration-200">
                    {isOpen ? "▼" : "▶"}
                </span>
            </button>
            <div
                className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-screen opacity-100 p-3" : "max-h-0 opacity-0"
                    }`}
            >
                {children}
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <>
            <div className="background-shape shape-top-right" />
            <div className="background-shape shape-bottom-left" />
            <main className="p-6">
                <h1 className="text-3xl font-bold mb-4">リンク集へようこそ</h1>

                <ToggleSection title="技術ブログリンク">
                    <ul className="list-disc pl-6">
                        {aboutData.tech.map((activity, index) => (
                            <li key={index}>
                                <a href={activity.link} className="text-blue-600 dark:text-blue-400">{activity.name}</a>
                            </li>
                        ))}
                    </ul>
                </ToggleSection>

                <ToggleSection title="SNSリンク">
                    <ul className="list-disc pl-6">
                        {aboutData.sns.map((activity, index) => (
                            <li key={index}>
                                <a href={activity.link} className="text-blue-600 dark:text-blue-400">{activity.name}</a>
                            </li>
                        ))}
                    </ul>
                </ToggleSection>

            </main>
        </>
    );
}
