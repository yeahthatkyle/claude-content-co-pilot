import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function Header() {
  return (
    <header className="bg-background border-b-2 border-primary">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
          Corpay Content Engine
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/history"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            History
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:block">by Optimism</span>
        </div>
      </div>
    </header>
  );
}

export function ModeShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <div className="w-16" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "outline";
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "text-foreground hover:bg-surface",
    outline: "border border-border text-foreground hover:bg-surface",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-6 ${className}`}>{children}</div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{children}</label>;
}

export function Field({
  as: As = "input",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement> & { as?: "input" | "textarea" | "select" }) {
  const cls =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  // @ts-expect-error dynamic element
  return <As className={cls} {...props} />;
}

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-surface"
    >
      Copy
    </button>
  );
}

export function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
            value === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}

function parseInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part as string;
  });
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  type ListBuf = { type: "ul" | "ol"; items: string[] };
  let list: ListBuf | null = null;
  let key = 0;

  const flushList = () => {
    if (!list) return;
    const Tag = list.type === "ul" ? "ul" : "ol";
    const cls = list.type === "ul"
      ? "list-disc list-outside ml-5 space-y-0.5 mb-3 text-sm leading-relaxed"
      : "list-decimal list-outside ml-5 space-y-0.5 mb-3 text-sm leading-relaxed";
    nodes.push(
      <Tag key={key++} className={cls}>
        {list.items.map((item, i) => (
          <li key={i}>{parseInline(item)}</li>
        ))}
      </Tag>
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw;

    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const ul = line.match(/^[-*] (.+)/);
    const ol = line.match(/^\d+\. (.+)/);
    const hr = line.match(/^---+$/);

    if (h1) {
      flushList();
      nodes.push(<h1 key={key++} className="text-xl font-semibold mt-2 mb-3 text-foreground">{parseInline(h1[1])}</h1>);
    } else if (h2) {
      flushList();
      nodes.push(<h2 key={key++} className="text-base font-semibold mt-5 mb-2 text-foreground">{parseInline(h2[1])}</h2>);
    } else if (h3) {
      flushList();
      nodes.push(<h3 key={key++} className="text-sm font-semibold mt-4 mb-1 text-foreground">{parseInline(h3[1])}</h3>);
    } else if (ul) {
      if (list && list.type !== "ul") flushList();
      if (!list) list = { type: "ul", items: [] };
      list.items.push(ul[1]);
    } else if (ol) {
      if (list && list.type !== "ol") flushList();
      if (!list) list = { type: "ol", items: [] };
      list.items.push(ol[1]);
    } else if (hr) {
      flushList();
      nodes.push(<hr key={key++} className="my-4 border-border" />);
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      nodes.push(<p key={key++} className="text-sm leading-relaxed mb-2 text-foreground">{parseInline(line)}</p>);
    }
  }
  flushList();

  return <div className="space-y-0">{nodes}</div>;
}

