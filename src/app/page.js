import Header from "@/components/Header";
import "../styles/globals.css";
import CustomFooter from "@/components/CustomFooter";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="background-shape shape-top-right" />
      <div className="background-shape shape-bottom-left" />

      <main className="flex flex-col flex-grow items-center justify-center text-center p-8 sm:p-20 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 bg-gradient-to-r from-blue-500 via-pink-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
            Sudo's Portfolio
          </h1>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-12 mb-8 transform hover:scale-105 transition-all duration-300">
            <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl mb-6 text-gray-800">
              Welcome to My Portfolio
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              このサイトは、私のポートフォリオサイトです。<br />
              Web開発を中心に、様々なプロジェクトに取り組んでいます。<br />
              Next.js, React, Tailwind CSSなどのモダンな技術を使用しています。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/projects"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-200"
              >
                プロジェクトを見る
              </Link>
              <Link
                href="/about"
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl border-2 border-blue-600 hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-200"
              >
                自己紹介
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">モダンな技術</h3>
              <p className="text-sm text-gray-600">Next.js、React、Tailwind CSSなど最新技術を使用</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">創造的な発想</h3>
              <p className="text-sm text-gray-600">ユーザー体験を重視した設計とデザイン</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">実践的な開発</h3>
              <p className="text-sm text-gray-600">実際に動作するアプリケーションを多数公開</p>
            </div>
          </div>
        </div>
      </main>

      <CustomFooter />
    </div>
  );
}
