"use client";

import React, { FormEvent } from "react";
import NewModal from "@/components/ui/NewModal";

export type GeocodeSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

type ReportFormModalProps = {
  onClose: () => void;
  createReport: (event: FormEvent<HTMLFormElement>) => void;
  reportZone: string;
  handleZoneChange: (val: string) => void;
  reportSuggestions: GeocodeSuggestion[];
  handleSelectSuggestion: (suggestion: GeocodeSuggestion) => void;
  isSubmitting?: boolean;
};

export default function ReportFormModal({
  onClose,
  createReport,
  reportZone,
  handleZoneChange,
  reportSuggestions,
  handleSelectSuggestion,
  isSubmitting = false,
}: ReportFormModalProps) {
  return (
    <NewModal title="Reportar nuevo incidente" onClose={onClose}>
      <form className="space-y-4" onSubmit={createReport}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/70 ml-1">Categoría</label>
            <select name="category" className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all">
              <option>Hurto</option>
              <option>Acoso</option>
              <option>Iluminacion</option>
              <option>Alerta</option>
            </select>
          </div>
          <div className="space-y-1 relative">
            <label className="text-sm font-bold text-on-surface/70 ml-1">Zona</label>
            <input
              name="zone"
              value={reportZone}
              onChange={(e) => handleZoneChange(e.target.value)}
              placeholder="Ej. Getsemaní"
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              autoComplete="off"
              required
            />
            {reportSuggestions.length > 0 && (
              <ul className="absolute z-[110] left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {reportSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="px-4 py-2.5 hover:bg-surface-container-low cursor-pointer text-xs font-semibold text-on-surface transition-colors border-b border-outline-variant/30 last:border-b-0 text-left"
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-bold text-on-surface/70 ml-1">Título</label>
          <input name="title" required minLength={5} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-bold text-on-surface/70 ml-1">Descripción</label>
          <textarea name="description" required minLength={10} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all h-24" />
        </div>
        <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100">
          <input type="checkbox" id="wm_check" name="is_womens_mode_relevant" className="w-4 h-4 accent-pink-500" />
          <label htmlFor="wm_check" className="text-xs font-medium text-pink-700">Este reporte es relevante para la seguridad de mujeres</label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Enviando..." : "Enviar reporte"}
        </button>
      </form>
    </NewModal>
  );
}
