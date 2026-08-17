"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { mobileNavItems } from "./nav-items";
import { usePlayer } from "@/context/PlayerContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { currentSong } = usePlayer();

  return (
    <nav
      className={clsx(
        "glass fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around pb-[env(safe-area-inset-bottom)] lg:hidden",
        currentSong && "border-t-0"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      {mobileNavItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              active ? "text-white" : "text-foreground-muted"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
