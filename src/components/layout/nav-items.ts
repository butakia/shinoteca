import { Home, Compass, ListMusic, Heart, Disc3, HeartHandshake, Search } from "lucide-react";

export const primaryNavItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/canciones", label: "Canciones", icon: ListMusic },
  { href: "/albumes", label: "Álbumes", icon: Disc3 },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
];

export const mobileNavItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Compass },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/playlists", label: "Playlists", icon: ListMusic },
];

export const donationNavItem = { href: "/donaciones", label: "Apoyar el proyecto", icon: HeartHandshake };
