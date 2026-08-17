"use client";

import { PlayerProvider } from "@/context/PlayerContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { PlaylistsProvider } from "@/context/PlaylistsContext";
import { AuthProvider } from "@/context/AuthContext";
import { InstitutionalPagesProvider } from "@/context/InstitutionalPagesContext";
import { CreditsProvider } from "@/context/CreditsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { BrandingProvider } from "@/context/BrandingContext";
import { SongsProvider } from "@/context/SongsContext";
import { NoticesProvider } from "@/context/NoticesContext";
import { PremiumProvider } from "@/context/PremiumContext";
import { DownloadsProvider } from "@/context/DownloadsContext";
import { ArtistFilterProvider } from "@/context/ArtistFilterContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BrandingProvider>
        <NoticesProvider>
          <AuthProvider>
            <InstitutionalPagesProvider>
              <CreditsProvider>
                <ArtistFilterProvider>
                <SongsProvider>
                  <FavoritesProvider>
                    <PlaylistsProvider>
                      <PremiumProvider>
                        <DownloadsProvider>
                          <PlayerProvider>{children}</PlayerProvider>
                        </DownloadsProvider>
                      </PremiumProvider>
                    </PlaylistsProvider>
                  </FavoritesProvider>
                </SongsProvider>
                </ArtistFilterProvider>
              </CreditsProvider>
            </InstitutionalPagesProvider>
          </AuthProvider>
        </NoticesProvider>
      </BrandingProvider>
    </ThemeProvider>
  );
}
