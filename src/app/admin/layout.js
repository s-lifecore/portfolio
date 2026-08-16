"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const isIndex = pathname === "/admin";

    return (
        <div>
            {!isIndex && (
                <div className="max-w-4xl mx-auto px-4 pt-4">
                    <Link
                        href="/admin"
                        className="inline-block px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                        ← 管理者ページに戻る
                    </Link>
                </div>
            )}
            {children}
        </div>
    );
}
