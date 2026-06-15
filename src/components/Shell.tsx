import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
          Corpay Content Engine
        </Link>
        <span className="text-xs text-muted-foreground">by Optimism</span>
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
