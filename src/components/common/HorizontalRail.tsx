import Link from "next/link";
import type { ReactNode } from "react";

export default function HorizontalRail({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs font-medium text-foreground-muted hover:text-foreground">
            Ver todo
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
