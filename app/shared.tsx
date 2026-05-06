import Link from "next/link";

export function Nav() {
  return (
    <nav className="nav">
      <Link className="brand" href="/">
        ActionFeed <span>/ credit desk</span>
      </Link>
      <div className="links">
        <Link href="/credit">credit</Link>
        <Link href="/proof">proof</Link>
        <a href="https://hackquest.io/hackathons/0G-APAC-Hackathon">0G APAC</a>
      </div>
    </nav>
  );
}

export function shortHash(value: string): string {
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

