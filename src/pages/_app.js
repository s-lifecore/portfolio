import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <div className="background-shape shape-top-right" />
      <div className="background-shape shape-bottom-left" />
      <Component {...pageProps} className="font-inter" />
    </>
  );
}
