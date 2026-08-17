import ProsePage from "@/components/common/ProsePage";

export const metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return (
    <ProsePage title="Términos y condiciones" subtitle="Texto de ejemplo — pendiente de revisión legal">
      <p>
        <strong>Aviso importante:</strong> el texto de esta página es un borrador de referencia
        pensado para un proyecto de archivo comunitario. No constituye asesoría legal y debe ser
        revisado por un profesional del derecho antes de publicarse de forma definitiva.
      </p>

      <h2>Naturaleza del archivo</h2>
      <p>
        Shinoteca es un archivo musical comunitario. El contenido se publica únicamente
        cuando existe autorización, consentimiento o una base legítima para compartirlo. No se
        presenta el material como &ldquo;libre de derechos&rdquo; salvo que así se indique de
        forma explícita y verificada.
      </p>

      <h2>Uso permitido</h2>
      <p>
        El acceso a las canciones, letras y descargas habilitadas por el administrador es para uso
        personal. La redistribución, venta o uso comercial del contenido no está permitida sin
        autorización expresa del titular correspondiente.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        Esta plataforma no pretende eximirse de toda responsabilidad mediante esta cláusula. Ante
        cualquier disputa sobre derechos de autor, actuaremos de buena fe y con celeridad para
        aclarar la situación o retirar el contenido cuestionado.
      </p>

      <h2>Retiro de contenido</h2>
      <p>
        Cualquier titular de derechos puede solicitar el retiro o la corrección de un contenido a
        través del formulario de solicitud de retiro.
      </p>
    </ProsePage>
  );
}
