export type NoticeKey =
  | "rights"
  | "authorization"
  | "independentContent"
  | "download"
  | "personalUse"
  | "takedownRequest"
  | "cookies"
  | "privacy"
  | "comments"
  | "externalSongs"
  | "externalCovers"
  | "lyrics"
  | "contentUnavailable"
  | "welcome"
  | "donations"
  | "footer"
  | "credits"
  | "playerMessages"
  | "downloadMessages"
  | "adminMessages";

export type NoticeVisibility = "always" | "once" | "unregistered" | "admin";

export type Notice = {
  key: NoticeKey;
  label: string; // internal name shown in the admin list
  text: string;
  location: string; // human-readable "where this appears", for the admin table
  enabled: boolean;
  priority: number;
  visibility: NoticeVisibility;
  title?: string;
  imageUrl?: string;
  buttonLabel?: string;
  delaySeconds?: number;
  createdAt: string;
  updatedAt: string;
};

export const noticeLabels: Record<NoticeKey, string> = {
  rights: "Aviso de derechos",
  authorization: "Aviso de autorización",
  independentContent: "Aviso de contenido independiente",
  download: "Aviso de descarga",
  personalUse: "Aviso de uso personal",
  takedownRequest: "Aviso de solicitud de retiro",
  cookies: "Aviso de cookies",
  privacy: "Aviso de privacidad",
  comments: "Aviso de comentarios",
  externalSongs: "Aviso de canciones externas",
  externalCovers: "Aviso de carátulas externas",
  lyrics: "Aviso de letras",
  contentUnavailable: "Aviso de contenido no disponible",
  welcome: "Mensaje de bienvenida",
  donations: "Mensaje de donaciones",
  footer: "Texto del pie de página",
  credits: "Texto de créditos",
  playerMessages: "Mensajes del reproductor",
  downloadMessages: "Mensajes al descargar",
  adminMessages: "Mensajes del panel de administración",
};

function make(key: NoticeKey, text: string, location: string, opts?: Partial<Notice>): Notice {
  const now = new Date().toISOString();
  return {
    key,
    label: noticeLabels[key],
    text,
    location,
    enabled: true,
    priority: 0,
    visibility: "always",
    createdAt: now,
    updatedAt: now,
    ...opts,
  };
}

export const defaultNotices: Record<NoticeKey, Notice> = {
  rights: make(
    "rights",
    "Los derechos de autoría pertenecen a sus respectivos titulares.",
    "Página de derechos, créditos"
  ),
  authorization: make(
    "authorization",
    "Contenido compartido con autorización",
    "Portada de inicio",
    { enabled: true }
  ),
  independentContent: make(
    "independentContent",
    "Este proyecto es independiente y no representa oficialmente al artista.",
    "Mensaje para el club, créditos"
  ),
  download: make(
    "download",
    "Descarga disponible únicamente para uso personal. El origen del archivo es este archivo musical comunitario; consulta los términos antes de redistribuir.",
    "Panel de descarga"
  ),
  personalUse: make(
    "personalUse",
    "El acceso a las canciones, letras y descargas habilitadas por el administrador es para uso personal.",
    "Términos"
  ),
  takedownRequest: make(
    "takedownRequest",
    "Si eres titular de derechos, puedes solicitar el retiro de un contenido desde la página de Derechos y solicitudes.",
    "Créditos, página de canción"
  ),
  cookies: make(
    "cookies",
    "Este sitio usa almacenamiento local del navegador para recordar tus preferencias — no cookies de rastreo de terceros.",
    "Banner de bienvenida",
    { enabled: false, visibility: "once" }
  ),
  privacy: make(
    "privacy",
    "Tus favoritos, historial y playlists se guardan únicamente en este navegador.",
    "Política de privacidad"
  ),
  comments: make(
    "comments",
    "Los comentarios están desactivados para esta canción.",
    "Sección de comentarios (cuando están desactivados)"
  ),
  externalSongs: make(
    "externalSongs",
    "Este archivo de audio proviene de una fuente externa y podría dejar de estar disponible.",
    "Reproductor (fuentes externas)",
    { enabled: false }
  ),
  externalCovers: make(
    "externalCovers",
    "Esta carátula proviene de una URL externa y podría dejar de estar disponible.",
    "Panel admin (carátulas externas)",
    { enabled: false }
  ),
  lyrics: make(
    "lyrics",
    "Letra compartida con autorización dentro del archivo comunitario. Los derechos de autoría pertenecen a sus respectivos titulares.",
    "Vista de letra"
  ),
  contentUnavailable: make(
    "contentUnavailable",
    "Este contenido ya no está disponible.",
    "Canción retirada o no encontrada"
  ),
  welcome: make(
    "welcome",
    "Este proyecto es sin fines de lucro. Todo nació aquí, en este grupo de WhatsApp. Un agradecimiento especial para ~Bhlue🐺, Manu♡, Arturo BG y ~Ivy MH. Atentamente, el creador A. Oliden. Shinoflow, si lees esto, te extrañamos. Vuelve al rap.",
    "Anuncio emergente al entrar en la web",
    {
      enabled: true,
      visibility: "always",
      title: "Gracias por ser parte de este archivo",
      imageUrl: "/agradecimiento.jpg",
      buttonLabel: "Continuar en SHINOTECA",
      delaySeconds: 10,
    }
  ),
  donations: make(
    "donations",
    "Las donaciones ayudan a mantener este archivo musical comunitario en línea — no se solicitan datos bancarios directamente en esta plataforma.",
    "Página de donaciones"
  ),
  footer: make(
    "footer",
    "SHINOTECA es un proyecto independiente de fans. No representa oficialmente al artista.",
    "Pie de página global"
  ),
  credits: make(
    "credits",
    "El contenido musical se comparte únicamente cuando existe autorización, consentimiento o una base legítima para hacerlo.",
    "Página de créditos"
  ),
  playerMessages: make("playerMessages", "", "Reproductor expandido", { enabled: false }),
  downloadMessages: make("downloadMessages", "", "Modal de descarga", { enabled: false }),
  adminMessages: make("adminMessages", "", "Panel de administración", { enabled: false }),
};
