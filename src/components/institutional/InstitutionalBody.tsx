export default function InstitutionalBody({ body }: { body: string }) {
  const paragraphs = body.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground-muted sm:text-base">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
