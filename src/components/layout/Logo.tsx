"use client";

import Link from "next/link";
import Image from "next/image";
import { useBranding } from "@/context/BrandingContext";

type LogoProps = {
  variant?: "full" | "icon";
  height?: number;
  className?: string;
  linkToHome?: boolean;
};

export default function Logo({ variant = "full", height = 32, className, linkToHome = true }: LogoProps) {
  const { branding } = useBranding();
  const src = variant === "icon" ? branding.logoIconSrc : branding.logoFullSrc;
  const aspect = variant === "icon" ? branding.logoIconAspect : branding.logoFullAspect;
  const width = Math.round(height * aspect);

  const img = (
    <Image
      src={src}
      alt={branding.siteName}
      width={width}
      height={height}
      priority
      className="h-full w-auto object-contain"
      style={{ height, width }}
    />
  );

  if (!linkToHome) return <span className={className}>{img}</span>;

  return (
    <Link
      href="/"
      aria-label={`${branding.siteName} — inicio`}
      className={`inline-block transition-transform duration-150 hover:scale-105 active:scale-90 ${className ?? ""}`}
    >
      {img}
    </Link>
  );
}
