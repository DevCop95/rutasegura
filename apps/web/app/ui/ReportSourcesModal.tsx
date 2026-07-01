"use client";

import { FormEvent, useState } from "react";
import { Link as LinkIcon, Check, X as XIcon } from "lucide-react";
import NewModal from "@/components/ui/NewModal";

export type ReportSourceItem = {
  id: string;
  url: string;
  source_domain: string | null;
  status: string;
};

type ReportDetailInfo = {
  id: string;
  title: string;
  description: string;
  category: string;
  zone: string;
  time: string;
  status: string;
};

type ReportSourcesModalProps = {
  report: ReportDetailInfo;
  sources: ReportSourceItem[];
  loadingSources: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmitSource: (event: FormEvent<HTMLFormElement>) => void;
  onAcceptSource: (sourceId: string) => void;
  onRejectSource: (sourceId: string, reason: string) => void;
};

function sourceStatusLabel(status: string) {
  if (status === "ACEPTADO") return "Aceptada";
  if (status === "RECHAZADO") return "Rechazada";
  return "En revision";
}

function RejectRow({ onReject }: { onReject: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center gap-1"
      >
        <XIcon size={12} /> Rechazar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 w-full mt-1">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo (min. 8 caracteres)"
        className="flex-1 px-2 py-1 text-[11px] bg-surface-container-low border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="button"
        disabled={reason.trim().length < 8}
        onClick={() => onReject(reason.trim())}
        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-error text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Confirmar
      </button>
    </div>
  );
}

export default function ReportSourcesModal({
  report,
  sources,
  loadingSources,
  isLoggedIn,
  isAdmin,
  isSubmitting,
  onClose,
  onSubmitSource,
  onAcceptSource,
  onRejectSource,
}: ReportSourcesModalProps) {
  return (
    <NewModal title={report.title} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <span className="text-xs text-outline">{report.category} · {report.zone} · {report.time}</span>
          <p className="text-sm text-on-surface mt-1">{report.description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-outline uppercase tracking-wider">Fuentes / noticias</p>

          {loadingSources ? (
            <p className="text-xs text-outline">Cargando fuentes...</p>
          ) : sources.length === 0 ? (
            <p className="text-xs text-outline">Todavia no se ha enviado ninguna fuente para este reporte.</p>
          ) : (
            <ul className="space-y-2">
              {sources.map((source) => (
                <li
                  key={source.id}
                  className="p-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl"
                >
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline truncate"
                    >
                      <LinkIcon size={12} className="shrink-0" />
                      <span className="truncate">{source.source_domain || source.url}</span>
                    </a>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        source.status === "ACEPTADO"
                          ? "bg-secondary/10 text-secondary"
                          : source.status === "RECHAZADO"
                            ? "bg-error/10 text-error"
                            : "bg-outline/15 text-outline"
                      }`}
                    >
                      {sourceStatusLabel(source.status)}
                    </span>
                  </div>
                  {isAdmin && source.status === "PENDIENTE" && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onAcceptSource(source.id)}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors flex items-center gap-1"
                      >
                        <Check size={12} /> Aceptar
                      </button>
                      <RejectRow onReject={(reason) => onRejectSource(source.id, reason)} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {isLoggedIn ? (
          <form className="space-y-2" onSubmit={onSubmitSource}>
            <label className="text-xs font-bold text-on-surface/70 ml-1">Aportar una fuente</label>
            <div className="flex items-center gap-2">
              <input
                name="url"
                type="url"
                required
                minLength={10}
                placeholder="https://noticia.com/articulo"
                className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-outline">Inicia sesion para aportar una fuente de este reporte.</p>
        )}
      </div>
    </NewModal>
  );
}
