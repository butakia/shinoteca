export type InstitutionalSlug = "biodata" | "mision" | "mensaje-para-el-club" | "derechos";

export type InstitutionalPage = {
  slug: InstitutionalSlug;
  title: string;
  subtitle?: string;
  body: string; // paragraphs separated by blank lines, editable as plain text in this pass
  imageUrl?: string;
  imagePosition: "center" | "top" | "bottom";
  imageMode: "background" | "card";
  imageAlt: string;
  enabled: boolean;
  order: number;
  updatedAt: string;
};

export const institutionalNavLabels: Record<InstitutionalSlug, string> = {
  biodata: "Biodata de Shinoflow",
  mision: "Misión del archivo",
  "mensaje-para-el-club": "Mensaje para el club",
  derechos: "Derechos y solicitudes",
};

// Default editorial content — exactly as provided by the site's editor, kept
// editable from /admin (título, subtítulo, cuerpo, imagen, orden, activo).
export const defaultInstitutionalPages: Record<InstitutionalSlug, InstitutionalPage> = {
  biodata: {
    slug: "biodata",
    title: "Antes de Carlos Sadness: la etapa Shinoflow",
    subtitle: "Biodata de Shinoflow",
    body: "Shinoflow fue el alias artístico utilizado durante una primera etapa musical vinculada a Carlos Sadness, especialmente relacionada con la escena underground, el hip-hop, las maquetas y la circulación independiente de canciones por Internet. Con el tiempo, el proyecto evolucionó hacia una propuesta artística más amplia, que posteriormente se consolidó bajo el nombre de Carlos Sadness.\n\nEsta página busca documentar aquella etapa inicial y facilitar la consulta de información relacionada con sus canciones, maquetas, imágenes y referencias. No pretende reemplazar las fuentes oficiales ni representar al artista, sus representantes o sus sellos discográficos.",
    imagePosition: "center",
    imageMode: "background",
    imageAlt: "Imagen de referencia de la etapa Shinoflow",
    enabled: true,
    order: 1,
    updatedAt: new Date().toISOString(),
  },
  mision: {
    slug: "mision",
    title: "¿Por qué existe este archivo?",
    subtitle: "Misión del archivo",
    body: "SHINOTECA es un proyecto independiente creado por seguidores interesados en preservar y organizar la memoria musical de la etapa de Shinoflow.\n\nCon el paso del tiempo, algunas canciones, maquetas, carátulas, letras y referencias dejaron de encontrarse fácilmente en las plataformas habituales. Por eso decidimos reunir esta información en un solo lugar, de forma ordenada, accesible y sencilla de consultar.\n\nSomos un grupo de fans y este proyecto no tiene fines de lucro. Nuestro objetivo es conservar, catalogar y facilitar el descubrimiento de este material, siempre respetando la autoría y los derechos de sus respectivos titulares.\n\nLa plataforma no pretende reemplazar los canales oficiales ni apropiarse de ninguna canción, imagen, letra o grabación. Todo el material pertenece a sus autores, intérpretes, compositores, productores o titulares correspondientes.\n\nSi algún titular considera que un contenido no debe aparecer en este archivo, puede comunicarse con nosotros mediante la sección de contacto. Revisaremos la solicitud y, cuando corresponda, retiraremos o modificaremos el contenido.",
    imagePosition: "center",
    imageMode: "background",
    imageAlt: "Portada de la misión del archivo",
    enabled: true,
    order: 2,
    updatedAt: new Date().toISOString(),
  },
  "mensaje-para-el-club": {
    slug: "mensaje-para-el-club",
    title: "Mensaje para el club",
    subtitle: "Un mensaje cercano, de fans para fans",
    body: "Si llegaste hasta aquí, probablemente también pasaste demasiado tiempo buscando canciones, maquetas, portadas o archivos perdidos en carpetas con nombres como 0001.mp3, final_final_ahora_si.mp3 o cancion nueva definitiva 3.mp3.\n\nSomos un grupo de fans que aprecia mucho el trabajo de Shinoflow y Carlos Sadness. No somos una empresa, no vendemos este material y no buscamos obtener beneficios económicos. Solo intentamos conservar y ordenar aquello que durante años circuló de manera dispersa entre carpetas, foros, enlaces y recuerdos de otros fans.\n\nEste archivo está hecho con admiración, respeto y un poco de obsesión por encontrar esa canción que alguien mencionó en un foro hace quince años y que parecía haber desaparecido de la faz de Internet.\n\nSi al artista, a sus representantes o a cualquier titular de derechos le molesta la existencia de este proyecto, lo entendemos. Puede comunicarse con nosotros escribiendo al correo de contacto.\n\nRevisaremos la solicitud y, si corresponde, eliminaremos o modificaremos el contenido señalado. No queremos apropiarnos de ningún trabajo: solo conservar una parte de la historia que muchas personas todavía recuerdan con cariño.",
    imagePosition: "center",
    imageMode: "background",
    imageAlt: "Imagen del mensaje para el club",
    enabled: true,
    order: 3,
    updatedAt: new Date().toISOString(),
  },
  derechos: {
    slug: "derechos",
    title: "Derechos, créditos y solicitudes de retiro",
    subtitle: "Derechos y solicitudes",
    body: "SHINOTECA es un proyecto independiente de fans. No reclamamos la propiedad de las canciones, letras, imágenes, grabaciones, composiciones ni demás materiales publicados en la plataforma.\n\nLos derechos corresponden a sus respectivos autores, intérpretes, compositores, productores, fotógrafos, diseñadores, sellos o titulares legítimos.\n\nLa inclusión de un material en este archivo no significa que el proyecto sea su propietario ni que exista una relación oficial con el artista, salvo que se indique expresamente lo contrario.\n\nSi eres titular de derechos o representas a una persona titular de derechos y deseas solicitar el retiro de una canción, el retiro de una imagen, la modificación de un crédito, la corrección de una información, la eliminación de una letra, la revisión de una autorización o la actualización de un enlace, puedes escribirnos mediante el formulario de esta página o por correo.\n\nPara facilitar la revisión, incluye el enlace exacto del contenido, una explicación breve de la solicitud y, cuando sea necesario, información que permita acreditar tu relación con el material.\n\nLas solicitudes serán revisadas por el equipo del archivo y responderemos dentro de un plazo razonable.",
    imagePosition: "center",
    imageMode: "background",
    imageAlt: "Imagen de la página de derechos y solicitudes",
    enabled: true,
    order: 4,
    updatedAt: new Date().toISOString(),
  },
};

export const contactEmail = "contacto@shinoteca.example";
