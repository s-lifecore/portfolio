import Header from "../../components/Header";
import "../../styles/globals.css";

export default function CalendarPage() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="background-shape shape-top-right" />
        <div className="background-shape shape-bottom-left" />
        <h1 className="text-3xl font-bold mb-4 text-center">カレンダー</h1>
        <div className="w-full max-w-5xl mx-auto flex justify-center">
          <iframe
            src="https://own-calendar.vercel.app"
            width="1100"
            height="700"
            className="w-full max-w-full border border-gray-300 rounded-md"
          />
        </div>
      </main>
    </>
  );
}
