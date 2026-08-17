import { EyeOff } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";

export default function PageDisabledNotice() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <EmptyState
        icon={EyeOff}
        title="Esta página no está disponible por ahora"
        description="El administrador la ha ocultado temporalmente."
        actionLabel="Volver al inicio"
        actionHref="/"
      />
    </div>
  );
}
