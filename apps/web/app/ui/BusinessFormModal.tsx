"use client";

import React, { FormEvent, useState } from "react";
import NewModal from "@/components/ui/NewModal";

type BusinessFormModalProps = {
  onClose: () => void;
  createBusiness: (event: FormEvent<HTMLFormElement>) => void;
  defaultLat?: number;
  defaultLng?: number;
};

export default function BusinessFormModal({
  onClose,
  createBusiness,
  defaultLat = 10.4252,
  defaultLng = -75.5487,
}: BusinessFormModalProps) {
  const [lat, setLat] = useState(defaultLat.toString());
  const [lng, setLng] = useState(defaultLng.toString());

  return (
    <NewModal title="Registrar Punto Seguro (Empresa)" onClose={onClose}>
      <form className="space-y-4" onSubmit={createBusiness}>
        <div className="space-y-1">
          <label className="text-sm font-bold text-on-surface/70 ml-1">Nombre del Establecimiento</label>
          <input
            name="name"
            required
            minLength={3}
            placeholder="Ej. Farmacia Manga 24h"
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/70 ml-1">Categoría</label>
            <select
              name="category"
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
            >
              <option value="Cafe">Café / Restaurante</option>
              <option value="Farmacia">Farmacia 24h</option>
              <option value="Comercio">Comercio / Tienda</option>
              <option value="Estacion">Estación de Servicio</option>
              <option value="Otro">Otro Punto Seguro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface/70 ml-1">Dirección / Zona</label>
            <input
              name="zone"
              required
              placeholder="Ej. Manga, Calle 24"
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-on-surface/70 ml-1">Descripción de Seguridad</label>
          <textarea
            name="description"
            required
            minLength={10}
            placeholder="Describe qué facilidades de seguridad ofreces (iluminación, cámaras, personal, refugio en emergencias)..."
            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all h-24 text-on-surface"
          />
        </div>

        <div className="p-3.5 bg-surface-container-low border border-outline-variant/50 rounded-xl space-y-3">
          <p className="text-xs font-bold text-outline uppercase tracking-wider">Ubicación Geográfica (Mapa)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-outline uppercase">Latitud</label>
              <input
                name="lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-outline uppercase">Longitud</label>
              <input
                name="lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-surface border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold text-on-surface"
              />
            </div>
          </div>
          <p className="text-[10px] text-outline font-medium">
            * Se ha pre-seleccionado el centro de la ciudad actual. Ajusta si es necesario.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-bold shadow-lg shadow-secondary/20 hover:shadow-xl transition-all active:scale-[0.98]"
        >
          Registrar Establecimiento
        </button>
      </form>
    </NewModal>
  );
}
