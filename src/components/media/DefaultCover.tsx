import clsx from "clsx";
import { pickCoverVariant, type CoverVariantKey } from "@/lib/coverVariants";

export type DefaultCoverVariant = "auto" | CoverVariantKey;
export type DefaultCoverSize = "xs" | "small" | "medium" | "large";

type DefaultCoverProps = {
  title?: string;
  subtitle?: string;
  seed?: string;
  variant?: DefaultCoverVariant;
  size?: DefaultCoverSize;
  showLabel?: boolean;
  className?: string;
};

const SIZE_MAP: Record<DefaultCoverSize, { icon: string; label: string; showLabel: boolean }> = {
  xs: { icon: "h-3.5 w-3.5", label: "hidden", showLabel: false },
  small: { icon: "h-5 w-5", label: "text-[10px]", showLabel: false },
  medium: { icon: "h-8 w-8 sm:h-10 sm:w-10", label: "text-xs sm:text-sm", showLabel: true },
  large: { icon: "h-14 w-14 sm:h-20 sm:w-20", label: "text-sm sm:text-base", showLabel: true },
};

export default function DefaultCover({
  title = "",
  subtitle,
  seed,
  variant = "auto",
  size = "medium",
  showLabel = false,
  className,
}: DefaultCoverProps) {
  const resolved = pickCoverVariant(seed ?? title ?? "shinoteca", variant);
  const { Icon } = resolved;
  const sizing = SIZE_MAP[size];
  const canShowLabel = showLabel && sizing.showLabel && title;

  return (
    <div
      role="img"
      aria-label={title ? `Carátula predeterminada para ${title}` : "Carátula predeterminada"}
      className={clsx(
        "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br shadow-inner",
        resolved.gradient,
        className
      )}
    >
      {/* ambient light blobs */}
      <div
        aria-hidden
        className={clsx(
          "absolute -left-4 -top-6 h-2/3 w-2/3 rounded-full blur-2xl",
          resolved.glow
        )}
      />
      <div
        aria-hidden
        className="absolute -bottom-8 -right-6 h-1/2 w-1/2 rounded-full bg-black/30 blur-2xl"
      />
      {/* subtle texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]"
      />

      <div className="relative z-10 flex flex-col items-center justify-center gap-2 px-2 text-center">
        <Icon className={clsx(sizing.icon, "text-white/85 drop-shadow")} strokeWidth={1.6} />
        {canShowLabel && (
          <div className="max-w-full">
            <p className={clsx(sizing.label, "truncate font-medium text-white/80")}>{title}</p>
            {subtitle && (
              <p className="truncate text-[10px] text-white/50">{subtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
