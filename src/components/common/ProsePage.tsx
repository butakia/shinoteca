export default function ProsePage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-foreground-muted">{subtitle}</p>}
      <div className="prose-content mt-6 space-y-4 text-sm leading-relaxed text-foreground-muted [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  );
}
