import { Inter, JetBrains_Mono, Poppins, Playfair_Display, Pacifico } from "next/font/google";
import "../styles/globals.css";

import Header from "../components/Header";
import CustomFooter from "../components/CustomFooter";

// フォントを読み込む
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetBrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "700"] });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400", "700"] });
const pacifico = Pacifico({ variable: "--font-pacifico", subsets: ["latin"], weight: ["400"] });

export const metadata = {
  title: "sudo",
  description: "my portfolio of sudo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${inter.variable} ${jetBrainsMono.variable} ${poppins.variable} ${playfairDisplay.variable} ${pacifico.variable}`}>
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="c58f65b0-74c9-4768-aec4-98669b72d129"></script>
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <CustomFooter />
      </body>
    </html>
  );
}
