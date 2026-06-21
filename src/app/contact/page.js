import Header from "../../components/Header";
import "../../styles/globals.css";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="background-shape shape-top-right"/>
        <div className="background-shape shape-bottom-left" />
        <h1 className="text-3xl font-bold mb-4 text-center">お問い合わせ</h1>
        <form
          action="https://formspree.io/f/mdkgkeza"
          method="POST"
          className="w-full max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md"
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              お名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              メッセージ
            </label>
            <textarea
              id="message"
              name="message"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              rows="4"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            送信する
          </button>
        </form>
      </main>
    </>
  );
}
