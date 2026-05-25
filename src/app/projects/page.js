import "../../styles/globals.css";
import Header from "@/components/Header";

/*
"/": "status=[公開中, 限定公開中, 公開停止中, 制作中, GitHub公開中]のいずれかを指定します。公開中の場合はリンクが有効になります。",
"start": "制作開始日を指定します。公開中の場合は表示されません。",
"update": "更新日を指定します。制作中の場合は表示されません。",
"imageUrl": "画像のURLを指定します。画像がない場合は表示されません。",
*/
// 上が昔、下が最新
const projects = [
  {
    title: "スタンプラリー（ウェブアプリ）/ 一般利用者用",
    description: "金沢市額（ぬか）振興会の方との提携により制作したスタンプラリーです。",
    link: "https://kanazawa-nuka2024.web.app/",
    link: "https://nuka-stamprally.vercel.app/",
    status: "限定公開中",
    start: "2024/08/20",
    update: "2025/02/15",
    imageUrl: "/images/summer-festival.png",
  },
  {
    title: "スタンプラリー（ウェブアプリ）/ 管理者用",
    description: "金沢市額（ぬか）振興会の方との提携により制作したスタンプラリーです。但し、管理者専用画面のため、一般利用者はアクセスできません。",
    link: "https://knzwnk-auth.web.app/",
    link: "https://stamp-web-auth.vercel.app/",
    status: "公開停止中",
    start: "2025/01/20",
    update: "2025/02/15",
    imageUrl: "/images/stamp-rally-admin.png",
  },
  {
    title: "Portfolio Website",
    description: "大学生活での制作物をまとめたポートフォリオサイトです。",
    link: "#",
    status: "制作中",
    start: "2025/02/14",
    update: "2026/01/07",
    imageUrl: "/images/portfolio.png",
  },
  {
    title: "trim6",
    description: "あらゆるURLを6文字に短縮するジェネレーター",
    link: "https://trim6.onrender.com/",
    status: "公開中",
    start: "2025/02/26",
    update: "2025/02/27",
    imageUrl: "/images/trim6.png",
  },
  {
    title: "personal_diaries",
    description: "日々の出来事を記録するための日記アプリ",
    link: "https://personal-diaries.onrender.com/",
    status: "公開中",
    start: "2025/02/27",
    update: "#",
    imageUrl: "/images/personal-diaries.png",
  },
  {
    title: "日記共有アプリ",
    description: "個人の日記を共有するためのアプリ。友達と一緒に日記をつけることができます。",
    link: "#",
    status: "制作中",
    start: "2025/03/25",
    update: "#",
    imageUrl: "",
  },
  {
    title: "spotstock（行きたい場所マップ）",
    description: "インスタグラムの投稿を元に、行きたい場所をマップ上に表示するアプリ",
    link: "https://spotstock.lifecore.jp/",
    status: "制作中",
    start: "2025/03/25",
    update: "2026/01/06",
    imageUrl: "/images/spotstock.png",
  },
  {
    title: "タスク管理サイト",
    description: "タスクを管理するためのウェブアプリ。進捗共有機能を実装中です。",
    link: "https://task-sharing-app.vercel.app/",
    status: "公開停止中",
    start: "2025/03/26",
    update: "アプリ内で配信中",
    imageUrl: "/images/task_sharing.png",
  },
  {
    title: "CityRiskView",
    description: "避難所の情報をすばやく確認することができるシステムです。",
    link: "https://crvmap.app/",
    status: "公開中",
    start: "2025/04/27",
    update: "2026/02/08",
    imageUrl: "/images/cityriskview.png",
  },
  {
    title: "Markdownコンバータ",
    description: "Markdown形式のテキストをPDFに変換するツールです。",
    link: "https://github.com/s-lifecore/markdown_converter",
    status: "GitHub公開中",
    start: "2025/07/27",
    update: "#",
    imageUrl: "",
  },
  {
    title: "過去問K.I.T.A.",
    description: "学内ハッカソンで開発した、過去問共有サイトです。",
    link: "https://hackit2025-cirkit.vercel.app/",
    status: "限定公開中",
    start: "2025/07/27",
    update: "2025/08/04",
    imageUrl: "/images/hackit2025.png",
  },
  {
    title: "日程調整サイト",
    description: "完全AI制作の、日程調整サイトです。調整さんの代替を目指しています。",
    link: "https://schedule-adjustment.vercel.app/",
    status: "限定公開中",
    start: "2025/08/07",
    update: "#",
    imageUrl: "/images/schedule-adjustment.png",
  },
  {
    title: "omiyappy（おみやっぴー）",
    description: "ハッカソンで開発した、お土産提案サイトです。",
    link: "https://omiyappy.vercel.app/",
    status: "限定公開中",
    start: "2025/08/07",
    update: "#",
    imageUrl: "/images/omiyappy.png",
  },
  {
    title: "個人ブログ（echogarden）",
    description: "技術的な内容や日常の出来事を綴る、SNSを兼ねた個人ブログです。",
    link: "https://echogarden-production.up.railway.app/",
    status: "限定公開中",
    start: "2025/12/31",
    update: "#",
    imageUrl: "/images/personal-blog.png",
  },
  {
    title: "みちくさメモリー",
    description: "AIに出してもらったお題をもとに散歩し、見つけた風景や出来事を記録するアプリです。",
    link: "https://www.michikusa-memory.com/",
    status: "公開中",
    start: "2026/02/01",
    update: "2026/02/08",
    imageUrl: "/images/michikusa.png",
  },
  {
    title: "みちくさメモリー公式サイト",
    description: "「みちくさメモリー」の公式サイトです。 アプリの紹介やダウンロードリンクを掲載しています。",
    link: "https://info.michikusa-memory.com/",
    status: "公開中",
    start: "2026/02/08",
    update: "2026/02/08",
    imageUrl: "/images/michikusa.png",
  },
];

export default function ProjectsPage() {
  const getStatusStyle = (status) => {
    const styles = {
      "公開中": "bg-green-100 text-green-800 border-green-300",
      "限定公開中": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "公開停止中": "bg-red-100 text-red-800 border-red-300",
      "制作中": "bg-blue-100 text-blue-800 border-blue-300",
      "GitHub公開中": "bg-pink-100 text-pink-800 border-pink-300",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const isLinkActive = (status) => {
    return ["公開中", "制作中", "GitHub公開中", "限定公開中"].includes(status);
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="background-shape shape-top-right" />
        <div className="background-shape shape-bottom-left" />
        
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent">
            成果物一覧
          </h1>
          <p className="text-center text-gray-600 mb-12 text-lg">
            これまでに制作したプロジェクトの一覧です
          </p>
          
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              >
                {project.imageUrl && (
                  <div className="relative overflow-hidden h-48 bg-gray-100">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-1 leading-tight">
                      {project.title}
                    </h2>
                  </div>
                  
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border mb-3 ${getStatusStyle(project.status)}`}>
                    {project.status}
                  </span>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 min-h-[4.5rem]">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-col gap-2 mb-4">
                    {(project.update !== "#" || project.start !== "#") && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {project.update === "#"
                          ? `制作開始: ${project.start}`
                          : `更新: ${project.update}`}
                      </p>
                    )}
                  </div>
                  
                  {project.link !== "#" && isLinkActive(project.status) ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span>プロジェクトを見る</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  ) : (
                    <button
                      className="w-full px-4 py-2.5 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                      disabled
                    >
                      準備中
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
