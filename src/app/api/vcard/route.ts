// app/api/vcard/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    // vCardフォーマットのテキストを組み立て
    // ※ 改行コードは \r\n (CRLF) が確実です
    const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "FN:Sudo Takumi",
        "N:Sudo;Takumi;;;",
        "ORG:金沢工業大学;情報工学科",
        "TITLE:Civic Tech & Disaster Tech Developer", // 肩書きを追加！
        "EMAIL;TYPE=PREF,INTERNET:sudoproject.personal@gmail.com",
        "URL:https://s-taku0502.vercel.app", // おもて.pngのURLに同期
        "NOTE:CityRiskView / Hackit / Michikusa Memory", // メモに活動内容を添える
        "END:VCARD"
    ].join("\r\n");

    // ファイルダウンロードとしてレスポンスを返す
    return new NextResponse(vcard, {
        headers: {
            "Content-Type": "text/vcard; charset=utf-8",
            "Content-Disposition": 'attachment; filename="Sudo_Takumi.vcf"',
        },
    });
}