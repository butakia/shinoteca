import { redirect } from "next/navigation";

// La solicitud de retiro ahora vive dentro de la página más completa "Derechos
// y solicitudes" (incluye el mismo formulario, además del texto de contexto).
export default function SolicitarRetiroRedirect() {
  redirect("/derechos");
}
