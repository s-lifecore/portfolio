'use client';

import { notFound } from "next/navigation";
import DisasterSafetyBanner from "@/components/DisasterSafetyBanner";
import ConsentManager from "@/components/ConsentManager";
import { useState, use, useCallback } from 'react';

interface PageProps {
    params: Promise<{
        token: string;
    }>;
}

export default function BusinessCardPage({ params }: PageProps) {
    const { token } = use(params);
    const [consent, setConsent] = useState<{ hasConsent: boolean; location?: { lat: number; lon: number } }>({
        hasConsent: false
    });

    const handleConsentChange = useCallback((hasConsent: boolean, location?: { lat: number; lon: number }) => {
        setConsent(prev => {
            // 状態が変わらない場合は更新しない（無限ループ防止）
            if (prev.hasConsent === hasConsent && 
                prev.location?.lat === location?.lat && 
                prev.location?.lon === location?.lon) {
                return prev;
            }
            return { hasConsent, location };
        });
    }, []);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <DisasterSafetyBanner hasConsent={consent.hasConsent} location={consent.location} />
                
                <ConsentManager 
                    onConsentChange={handleConsentChange} 
                />

                <div className="rounded-2xl bg-white p-6 shadow-xl border border-gray-100">

                {/* プロフィールヘッダー */}
                <div className="text-center my-4">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Takumi Sudo</h1>
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                        <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-full">
                            Civic Tech & Disaster Tech Developer
                        </p>
                        <p className="text-xs font-semibold text-pink-600 bg-pink-50 inline-block px-3 py-1 rounded-full">
                            Community Organizer
                        </p>
                    </div>
                    <p className="mt-2.5 text-sm text-gray-500">
                        金沢工業大学 情報工学科
                    </p>
                </div>

                {/* About Me */}
                <div className="bg-gray-50/70 rounded-xl p-3.5 text-sm text-gray-600 border border-gray-100">
                    <p className="font-bold text-gray-800 mb-1 text-xs uppercase tracking-wider">About Me</p>
                    <p className="leading-relaxed text-xs">
                        情報工学を学ぶ学生エンジニア。IT技術で身近な社会課題を解決し、持続可能で安心して暮らせる社会を作ることを目指しています。
                    </p>
                </div>

                <hr className="my-5 border-gray-100" />

                {/* リンク集 */}
                <div className="space-y-2.5">
                    <a
                        href="/api/vcard"
                        className="flex items-center justify-between rounded-xl border border-emerald-500 bg-emerald-600 p-3.5 font-bold text-white transition hover:bg-emerald-700 shadow-md text-center"
                    >
                        <span>👤 連絡先をスマホに保存 (vCard)</span>
                        <span className="text-xs text-emerald-200">↓</span>
                    </a>

                    <a
                        href="mailto:sudoproject.personal@gmail.com"
                        className="flex items-center justify-between rounded-xl border border-emerald-200 p-3.5 font-semibold text-emerald-700 transition hover:bg-emerald-50/50 bg-emerald-50/30"
                    >
                        <span>✉️ Mail で連絡する</span>
                        <span className="text-xs text-emerald-400">→</span>
                    </a>

                    <a
                        href="https://s-taku0502.vercel.app"
                        target="_blank"
                        className="flex items-center justify-between rounded-xl border border-gray-200 p-3.5 font-medium text-gray-700 transition hover:bg-gray-50 bg-white"
                    >
                        <span>🌐 Portfolio</span>
                        <span className="text-xs text-gray-400">→</span>
                    </a>

                    <a
                        href="https://github.com/s-lifecore"
                        target="_blank"
                        className="flex items-center justify-between rounded-xl border border-gray-200 p-3.5 font-medium text-gray-700 transition hover:bg-gray-50 bg-white"
                    >
                        <span>🐙 GitHub</span>
                        <span className="text-xs text-gray-400">→</span>
                    </a>

                    <a
                        href="https://note.com/link_sudo"
                        target="_blank"
                        className="flex items-center justify-between rounded-xl border border-gray-200 p-3.5 font-medium text-gray-700 transition hover:bg-gray-50 bg-white"
                    >
                        <span>📝 note</span>
                        <span className="text-xs text-gray-400">→</span>
                    </a>

                    <div className="pt-1 grid grid-cols-2 gap-2">
                        <a
                            href="https://trim6.onrender.com/VfE3Gw"
                            target="_blank"
                            className="block text-center rounded-xl border border-gray-200 p-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-gray-50/50"
                        >
                            👤 Eight
                        </a>
                        <a
                            href="https://my.prairie.cards/u/sudo"
                            target="_blank"
                            className="block text-center rounded-xl border border-gray-200 p-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 bg-gray-50/50"
                        >
                            📱 my-parie
                        </a>
                    </div>
                </div>

                <hr className="my-5 border-gray-100" />

                {/* What's I'm Working On */}
                <div>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {"What's"} I&apos;m Working On
                    </h2>
                    <div className="space-y-3 text-xs text-gray-600">
                        <div>
                            <p className="font-bold text-gray-800 flex items-center gap-1">
                                <span className="text-emerald-500">🛠️</span> CityRiskView
                            </p>
                            <p className="text-gray-500 scale-95 origin-left">~ Disaster Resilience Platform ~</p>
                            <p className="mt-0.5 text-gray-600 leading-relaxed">災害時の迅速な情報共有と、平時の備えを支援する防災プラットフォーム。</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 flex items-center gap-1">
                                <span className="text-pink-500">🚀</span> KIT DevelopersHub & GDGoC KIT
                            </p>
                            <p className="text-gray-500 scale-95 origin-left">~ Student Hackathon Organizer ~</p>
                            <p className="mt-0.5 text-gray-600 leading-relaxed">学生向けハッカソンの企画・運営や、学内外の技術コミュニティ活動。</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 flex items-center gap-1">
                                <span className="text-blue-500">🚶</span> Michikusa Memory
                            </p>
                            <p className="text-gray-500 scale-95 origin-left">~ Walking Memory Archive ~</p>
                            <p className="mt-0.5 text-gray-600 leading-relaxed">ふとした散歩の時間を冒険に変えるアプリケーション。</p>
                        </div>
                    </div>
                </div>

                </div>
            </div>
        </main>
    );
}
