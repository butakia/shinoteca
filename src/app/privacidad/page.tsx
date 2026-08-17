import ProsePage from "@/components/common/ProsePage";

export const metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <ProsePage title="Política de privacidad" subtitle="Texto de ejemplo — pendiente de revisión legal">
      <p>
        Este borrador describe, a nivel general, qué datos maneja la versión de demostración de
        Shinoteca. Debe revisarse con un profesional del derecho antes de publicarse.
      </p>

      <h2>Modo demo (almacenamiento local)</h2>
      <p>
        En esta versión, tus favoritos, historial de reproducción, playlists y preferencias del
        reproductor se guardan únicamente en el almacenamiento local de tu navegador
        (localStorage). No se envían a ningún servidor ni se comparten con terceros. Puedes borrar
        estos datos limpiando los datos del sitio en tu navegador.
      </p>

      <h2>Comentarios</h2>
      <p>
        Si el administrador habilita los comentarios en una canción, el nombre y el texto que
        escribas se guardan de la misma forma, localmente en tu navegador, en esta versión de
        demostración.
      </p>

      <h2>Versión de producción</h2>
      <p>
        Una versión con cuentas de usuario y base de datos requerirá una política de privacidad
        actualizada que detalle qué datos personales se almacenan en el servidor, con qué
        finalidad y durante cuánto tiempo.
      </p>
    </ProsePage>
  );
}
