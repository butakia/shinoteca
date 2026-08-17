// Next.js remounts template.tsx on every navigation (unlike layout.tsx, which
// persists) — that remount is what re-triggers the CSS animation below on
// every page change, giving the whole site a fade/slide-in without any JS
// transition library or client-side route-change tracking.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
