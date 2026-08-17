import Image from "next/image";
import { DEFAULT_BRANDING } from "@/lib/branding";

export default function Loading() {
  const height = 56;
  const width = Math.round(height * DEFAULT_BRANDING.logoIconAspect);
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Image
        src={DEFAULT_BRANDING.logoIconSrc}
        alt={DEFAULT_BRANDING.siteName}
        width={width}
        height={height}
        priority
        className="animate-pulse motion-reduce:animate-none"
      />
    </div>
  );
}
