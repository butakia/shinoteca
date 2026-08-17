export type CollaboratorCategory =
  | "coordinacion"
  | "investigacion"
  | "catalogacion"
  | "audio"
  | "caratulas"
  | "letras"
  | "desarrollo"
  | "moderacion"
  | "comunidad";

export const collaboratorCategoryLabels: Record<CollaboratorCategory, string> = {
  coordinacion: "Coordinación",
  investigacion: "Investigación",
  catalogacion: "Catalogación",
  audio: "Audio",
  caratulas: "Carátulas",
  letras: "Letras",
  desarrollo: "Desarrollo",
  moderacion: "Moderación",
  comunidad: "Comunidad",
};

export type Collaborator = {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  description?: string;
  category: CollaboratorCategory;
  socialUrl?: string;
  joinedAt?: string;
  order: number;
  visible: boolean;
};

export const defaultCollaborators: Collaborator[] = [
  {
    id: "c-coord-1",
    name: "Equipo Shinoteca",
    category: "coordinacion",
    description: "Coordinación general del archivo.",
    order: 1,
    visible: true,
  },
  {
    id: "c-dev-1",
    name: "Desarrollo y diseño de la web",
    category: "desarrollo",
    description: "Construcción de la plataforma.",
    order: 1,
    visible: true,
  },
];
