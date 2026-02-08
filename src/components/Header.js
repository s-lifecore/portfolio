"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "ホーム" },
    { href: "/about", label: "自己紹介" },
    { href: "/projects", label: "制作物一覧" },
    { href: "/contact", label: "お問い合わせ" },
    { href: "/blogs", label: "外部記事一覧" },
  ];

  // 外クリックでメニュー閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // メニュー開閉時にbodyのスクロールを制御
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <header className="shadow-md fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
        {/* ロゴ */}
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
        >
          Sudo
        </Link>

        {/* デスクトップナビゲーション */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* モバイルメニューボタン */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* モバイルメニュー（サイドバー） */}
      {/* 背景オーバーレイ */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* サイドバー */}
      <div
        ref={dropdownRef}
        className={`md:hidden fixed top-0 bottom-0 right-0 h-screen w-80 max-w-[85vw] bg-gradient-to-b from-pink-300 via-pink-200 to-rose-200 flex flex-col transition-transform duration-300 z-50 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between p-6 border-b border-white">
          <h2 className="text-2xl font-bold text-white">メニュー</h2>
          <button
            className="text-white p-2 rounded-lg hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setIsMenuOpen(false)}
            aria-label="メニューを閉じる"
          >
            <X size={28} />
          </button>
        </div>

        {/* メニューリンク */}
        <nav className="flex flex-col p-6 space-y-3 overflow-y-auto" role="navigation">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-medium hover:scale-105 transition-all duration-200 py-4 px-5 rounded-xl ${
                  isActive 
                    ? "bg-white text-blue-600 shadow-lg font-bold" 
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isMenuOpen ? "slideIn 0.3s ease-out forwards" : "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* フッター部分 */}
        <div className="mt-auto p-6 border-t border-white">
          <p className="text-sm text-white text-center">
            © 2026 Sudo
          </p>
        </div>
      </div>
    </header>
  );
}
