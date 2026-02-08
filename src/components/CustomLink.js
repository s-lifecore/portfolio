// /components/CustomLink.js
import Link from "next/link";

const CustomLink = ({ href, children, className = "", external = false }) => {
  // 外部リンクの場合
  if (external || href.startsWith("http")) {
    return (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center transition-all duration-200 hover:scale-105 ${className}`}
      >
        {children}
      </a>
    );
  }

  // 内部リンクの場合
  return (
    <Link 
      href={href} 
      className={`inline-flex items-center transition-all duration-200 hover:scale-105 ${className}`}
    >
      {children}
    </Link>
  );
};

export default CustomLink;
