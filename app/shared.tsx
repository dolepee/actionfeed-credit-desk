import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <nav className="nav">
      <Link className="brand" href="/">
        CreditGate <span>by ActionFeed</span>
      </Link>
      <div className="links">
        <Link href="/">desk</Link>
        <Link href="/credit">credit</Link>
        <a href="https://github.com/dolepee/actionfeed-credit-desk">source</a>
        <ThemeToggle />
      </div>
    </nav>
  );
}

export function shortHash(value: string): string {
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}
