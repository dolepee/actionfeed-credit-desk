import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <nav className="nav">
      <Link className="brand" href="/">
        <CreditGateMark />
        <span className="brand-text">
          CreditGate <span>0G agent credit</span>
        </span>
      </Link>
      <div className="links">
        <Link href="/">gate</Link>
        <Link href="/credit">credit</Link>
        <Link href="/proof">proof</Link>
        <a href="https://github.com/dolepee/creditgate">source</a>
        <ThemeToggle />
      </div>
    </nav>
  );
}

export function CreditGateMark() {
  return (
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="creditgate-mark-gradient" x1="10" x2="56" y1="12" y2="54">
          <stop stopColor="#ffe08a" />
          <stop offset="0.48" stopColor="#70e6a0" />
          <stop offset="1" stopColor="#77b7ff" />
        </linearGradient>
      </defs>
      <path
        d="M32 6 52 16v15c0 13.5-7.6 22.8-20 27-12.4-4.2-20-13.5-20-27V16L32 6Z"
        fill="url(#creditgate-mark-gradient)"
      />
      <path d="M22 31h20" stroke="#06100b" strokeLinecap="round" strokeWidth="5" />
      <path d="M32 21v20" stroke="#06100b" strokeLinecap="round" strokeWidth="5" />
      <path
        d="M19 18.8 32 12.3l13 6.5V31c0 10.5-4.7 17-13 20.5C23.7 48 19 41.5 19 31V18.8Z"
        fill="none"
        opacity="0.48"
        stroke="#06100b"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function shortHash(value: string): string {
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}
