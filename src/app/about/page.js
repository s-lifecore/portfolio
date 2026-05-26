"use client";

import Header from "@/components/Header";
import { useState } from "react";
import "../../styles/globals.css";
import Head from "next/head";

const aboutData = {
  name: "須藤 拓海 / Sudo Takumi",
  affiliation: "金沢工業大学 / Kanazawa Institute of Technology",
  location: "石川県, 日本 / Ishikawa, Japan",
  motto: "learning by doing: 実践で学ぶ",
  hobbies: ["旅行 / Traveling"],
  technicalSkills: {
    フロントエンド: ["HTML", "CSS", "JavaScript", "Vue.js", "Next.js", "Tailwind CSS"],
    バックエンド: ["Python", "Java", "Ruby", "Ruby on Rails", "Firebase"],
    インフラ: ["Docker", "Vercel", "Cloudflare", "GitHub Pages"],
  },
  projects: {
    description: "GitHubにて公開している制作物の一覧です。制作物は随時更新していきます。",
    link: "https://s-lifecore.github.io/portfolio-projects/" // 制作品一覧ページへのリンク
  },
  socialMedia: [
    { platform: "Twitter", link: "https://twitter.com/ocean_t_umi/" },
    { platform: "note", link: "https://note.com/link_sudo" },
    { platform: "Qiita", link: "https://qiita.com/takumi1227" },
    { platform: "Zenn", link: "https://zenn.dev/sudo_dev" },
    { platform: "GitHub", link: "https://github.com/s-lifecore" },
    { platform: "Gist", link: "https://gist.github.com/s-lifecore" },
  ],
  extracurricular: [
    { name: "CirKitプロジェクト / 株式会社CirKit", link: "https://cirkit.jp/" },
    { name: "GDSC KIT / GDGoC KIT", link: "https://gdg.community.dev/gdg-on-campus-kanazawa-institute-of-technology-ishikawa-japan/"},
    { name: "情報セキュリティ・スキルアップ・プロジェクト", link: "https://www2.kanazawa-it.ac.jp/kitsec/" },
    { name: "教職課程", link: "https://www.kanazawa-it.ac.jp/kyoshoku/tlp/index.html" },
    { name: "KIT DevelopersHub", link: "#" },
    { name: "防災・減災プロジェクトSoRA", link : "https://sora2kit.wixsite.com/-----------sora" },
  ],
  workExperience: [
    {
      company: "CirKitプロジェクト / 株式会社CirKit",
      details: [
        { period: "2024年5月 - 2024年10月", position: "研修生" },
        { period: "2024年11月 - 現在", position: "学内アンケートウェブアプリ「SAKITO」チーム" },
        { period: "2025年度", position: "新人採用（エンジニア職担当）" },
        { period: "2025年度", position: "エンジニア研修 メンターリーダー" },
      ]
    },
    {
      company: "GDSC KIT / GDGoC KIT",
      details: [
	{ period: "2024年4月 - 2026年5月", position: "member"},
	{ period: "2026年5月 - 現在", position: "Organizer"},
      ]
    },
    {
      company: "情報セキュリティ・スキルアップ・プロジェクト",
      details: [
        { period: "2024年4月 - 現在", position: "メンバー" },
      ]
    },
    {
      company: "教職課程",
      details: [
        { period: "2024年4月 - 2026年5月", position: "教職課程履修生" },
      ]
    },
    {
      company: "KIT DevelopersHub",
      details: [
        { period: "2026年3月 - 現在", position: "イベント運営メンバー" },
        { period: "2026年4月 - 現在", position: "開発メンバー" },
      ]
    },
    {
      company: "防災・減災プロジェクトSoRA",
      details: [
        { period: "2026年5月 - 現在", position: "メンバー" }
      ]
    },
  ]
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
    <Header className="pb-6"/>
      <div className="background-shape shape-top-right" />
      <div className="background-shape shape-bottom-left" />
      <main className="pt-20 p-6">
        <h1 className="text-3xl font-bold mb-4">自己紹介ページへようこそ</h1>

        {/* 基本情報 */}
        <ToggleSection title="基本情報" defaultOpen>
          <p><strong>名前:</strong> {aboutData.name}</p>
          <p><strong>所属:</strong> {aboutData.affiliation}</p>
          <p><strong>所在地:</strong> {aboutData.location}</p>
        </ToggleSection>

        {/* モットー・趣味 */}
        <ToggleSection title="モットー・趣味">
          <p><strong>モットー:</strong> {aboutData.motto}</p>
          <p><strong>趣味:</strong> {aboutData.hobbies.join(", ")}</p>
        </ToggleSection>

        {/* 使用技術 */}
        <ToggleSection title="使用技術">
          {Object.entries(aboutData.technicalSkills).map(([category, skills]) => (
            <div key={category} className="mt-2">
              <h3 className="font-semibold">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <ul className="list-disc pl-6">
                {skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          ))}
        </ToggleSection>

        {/* 課外活動・職歴 */}
        <ToggleSection title="課外活動・職歴">
          <p><strong>課外活動:</strong> </p>
          <ul className="list-disc pl-6">
            {aboutData.extracurricular.map((activity, index) => (
              <li key={index}>
                <a href={activity.link} className="text-blue-600 dark:text-blue-400">{activity.name}</a>
              </li>
            ))}
          </ul>
          <p><strong>職歴:</strong></p>
          <ul className="list-disc pl-6">
            {aboutData.workExperience.map((work, index) => (
              <li key={index}>
                <strong>{work.company}</strong>
                <ul className="list-disc pl-6">
                  {work.details.map((detail, subIndex) => (
                    <li key={subIndex}>{detail.period}: {detail.position}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </ToggleSection>

        {/* 制作品 */}
        <ToggleSection title="制作品">
          <p>{aboutData.projects.description} <a href={aboutData.projects.link} className="text-blue-600 dark:text-blue-400">GitHub</a></p>
        </ToggleSection>

        {/* ソーシャルメディア */}
        <ToggleSection title="ソーシャルメディア">
          {aboutData.socialMedia.map((social, index) => (
            <p key={index}>
              <a href={social.link} className="text-blue-600 dark:text-blue-400">{social.platform}</a>
            </p>
          ))}
        </ToggleSection>
      </main>

    </>
  );
}
