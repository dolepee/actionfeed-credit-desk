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
        <a href="https://github.com/dolepee/creditgate">source</a>
        <ThemeToggle />
      </div>
    </nav>
  );
}

export function CreditGateMark() {
  return (
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="creditgate-mark-gradient" x1="18" x2="78" y1="14" y2="82">
          <stop stopColor="#fff1a6" />
          <stop offset="0.46" stopColor="#72efa3" />
          <stop offset="1" stopColor="#83c4ff" />
        </linearGradient>
        <radialGradient id="creditgate-mark-glow" cx="68" cy="20" r="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#77b7ff" stopOpacity="0.38" />
          <stop offset="0.52" stopColor="#70e6a0" stopOpacity="0.16" />
          <stop offset="1" stopColor="#07100b" stopOpacity="0" />
        </radialGradient>
        <filter id="creditgate-mark-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.38" />
        </filter>
        <clipPath id="creditgate-mark-clip">
          <rect width="96" height="96" rx="24" />
        </clipPath>
        <linearGradient id="creditgate-mark-shell" x1="12" x2="82" y1="4" y2="92">
          <stop stopColor="#10190f" />
          <stop offset="1" stopColor="#07100b" />
        </linearGradient>
      </defs>
      <g clipPath="url(#creditgate-mark-clip)">
        <rect width="96" height="96" rx="24" fill="url(#creditgate-mark-shell)" />
        <rect width="96" height="96" rx="24" fill="url(#creditgate-mark-glow)" />
        <path
          d="M48 12 76 25.4v20.1c0 20.4-10.8 32.8-28 38.5-17.2-5.7-28-18.1-28-38.5V25.4L48 12Z"
          fill="url(#creditgate-mark-gradient)"
          filter="url(#creditgate-mark-shadow)"
        />
        <path
          d="M29.5 30.3 48 21.5l18.5 8.8v15.3c0 15-6.8 24.1-18.5 28.6-11.7-4.5-18.5-13.6-18.5-28.6V30.3Z"
          fill="#07100b"
          opacity="0.9"
        />
        <path d="M35 40.5h26" stroke="#fff3c9" strokeLinecap="round" strokeWidth="6" />
        <path d="M38 54h20" stroke="#fff3c9" strokeLinecap="round" strokeWidth="6" />
        <path d="M36 40.5v25" stroke="#fff3c9" strokeLinecap="round" strokeWidth="6" />
        <path d="M48 40.5v25" stroke="#fff3c9" strokeLinecap="round" strokeWidth="6" />
        <path d="M60 40.5v25" stroke="#fff3c9" strokeLinecap="round" strokeWidth="6" />
        <path
          d="M33.5 67.8c6.3 5.8 14.9 9.4 14.9 9.4s11.9-4.7 18.1-13.8"
          fill="none"
          stroke="#70e6a0"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M63.4 23.7 70.8 27.2v14.2"
          fill="none"
          opacity="0.44"
          stroke="#07100b"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}

export function shortHash(value: string): string {
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}
