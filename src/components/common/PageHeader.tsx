export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>}
    </div>
  );
}
