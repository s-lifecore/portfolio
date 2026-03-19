"use client";
import CustomH2 from "@/components/CustomH2";
import Privacy_div from "@/components/Privacy";
import CustomHeader from "@/components/Header";
import { useRouter } from "next/navigation";

const PrivacyPolicy = () => {
    const router = useRouter();
    return (
        <>
            <CustomHeader />
            <main className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="background-shape shape-top-right" />
                <div className="background-shape shape-bottom-left" />
                <div className="px-6 py-8 max-w-3xl mx-auto">
                    <Privacy_div className="text-center mb-8">
                        <h1 className="text-4xl font-bold">プライバシーポリシー</h1>
                        <p className="text-lg mt-4">当サイトでは、お問い合わせフォームを通じて収集する情報は、以下の通りです。</p>
                    </Privacy_div>

                    <Privacy_div className="mb-6">
                        <CustomH2>収集する情報</CustomH2>
                        <p className="text-lg">お問い合わせフォームにご記入いただく情報は、名前とメールアドレスのみです。</p>
                    </Privacy_div>

                    <Privacy_div className="mb-6">
                        <CustomH2>利用目的</CustomH2>
                        <p className="text-lg">収集した情報は、お問い合わせに対する返信やご連絡を行うためにのみ使用いたします。</p>
                    </Privacy_div>

                    <Privacy_div className="mb-6">
                        <CustomH2>情報の保管</CustomH2>
                        <p className="text-lg">収集した情報は、お問い合わせへの返信後、特に保存の必要がない場合は速やかに削除いたします。</p>
                    </Privacy_div>

                    <Privacy_div className="mb-6">
                        <CustomH2>第三者への提供</CustomH2>
                        <p className="text-lg">収集した情報は、第三者に提供することはありません。ただし、法律に基づき開示を求められた場合を除きます。</p>
                    </Privacy_div>

                    <Privacy_div className="mb-6">
                        <CustomH2>ユーザーの権利</CustomH2>
                        <p className="text-lg">ご自身の情報に関する確認、訂正、削除をご希望の場合は、お問い合わせフォームまたは以下の連絡先までご連絡ください。</p>
                    </Privacy_div>

                    <Privacy_div className="mb-6">
                        <CustomH2>セキュリティ対策</CustomH2>
                        <p className="text-lg">収集した情報は、適切な方法で管理し、不正アクセスや漏洩を防止するための対策を講じています。</p>
                    </Privacy_div>
                    <button
                        onClick={() => router.back()}
                        className="bottom-4 mt-4 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition duration-300"
                    >
                        前のページへ戻る
                    </button>
                </div>
            </main>
        </>
    );
};

export default PrivacyPolicy;
