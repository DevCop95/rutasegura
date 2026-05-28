"use client";

import { Building2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import {
  Map,
  MapControls,
  MapBoundary,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  UserMarker,
  HeatmapLayer,
} from "@/components/ui/map";

export type MapReport = {
  id: string;
  title: string;
  status: string;
  category: string;
  lat: number;
  lng: number;
};

export type MapBusiness = {
  id: string;
  name: string;
  status: string;
  category: string;
  lat: number;
  lng: number;
};

type MapPanelProps = {
  reports: MapReport[];
  businesses: MapBusiness[];
  showReports: boolean;
  showBusinesses: boolean;
  showRoute: boolean;
  routeCoordinates?: [number, number][];
  onSelectReport: (id: string) => void;
  center?: [number, number];
  bounds?: [[number, number], [number, number]];
  onLocateUser?: (coords: { longitude: number; latitude: number }) => void;
};

const CARTAGENA_CENTER: [number, number] = [-75.535, 10.405];
const CARTAGENA_BOUNDS: [[number, number], [number, number]] = [
  [-75.59, 10.34],
  [-75.47, 10.45],
];

export default function MapPanel({
  reports,
  businesses,
  showReports,
  showBusinesses,
  showRoute,
  routeCoordinates,
  onSelectReport,
  center = CARTAGENA_CENTER,
  bounds = CARTAGENA_BOUNDS,
  onLocateUser,
}: MapPanelProps) {
  const [userLocation, setUserLocation] = useState<{ longitude: number; latitude: number } | null>(null);

  return (
    <Map
      center={center}
      zoom={13.45}
      minZoom={11.0}
      maxZoom={18}
      maxBounds={bounds}
      dragRotate={false}
      pitchWithRotate={false}
      renderWorldCopies={false}
      className="w-full h-full"
      key={`${center[0]}-${center[1]}`}
    >
      <MapControls 
        allowedBounds={bounds} 
        onLocate={(coords) => {
          setUserLocation(coords);
          onLocateUser?.(coords);
        }}
      />
      <MapBoundary bounds={bounds} />
      {showRoute && routeCoordinates ? <MapRoute coordinates={routeCoordinates} color="#006d43" /> : null}

      {userLocation ? (
        <UserMarker longitude={userLocation.longitude} latitude={userLocation.latitude} />
      ) : null}

      {showReports ? <HeatmapLayer points={reports.map(r => ({ lng: r.lng, lat: r.lat }))} /> : null}

      {showReports
        ? reports.map((report) => (
            <MapMarker
              key={report.id}
              longitude={report.lng}
              latitude={report.lat}
              onClick={() => onSelectReport(report.id)}
            >
              <MarkerContent>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 ${
                  report.status === "VERIFICADO" ? "bg-secondary text-white" : "bg-error text-white"
                }`}>
                  <ShieldAlert size={16} />
                </span>
              </MarkerContent>
              <MarkerTooltip>
                <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  {report.title}
                </div>
              </MarkerTooltip>
              <MarkerPopup>
                <div className="bg-surface p-3 rounded-xl shadow-2xl border border-outline-variant min-w-[180px]">
                  <strong className="block text-sm font-headline font-bold text-on-surface leading-tight mb-1">{report.title}</strong>
                  <span className="block text-xs text-outline mb-2">{report.category}</span>
                  <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    report.status === "VERIFICADO" ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"
                  }`}>
                    {statusLabel(report.status)}
                  </div>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))
        : null}

      {showBusinesses
        ? businesses.map((business) => (
            <MapMarker key={business.id} longitude={business.lng} latitude={business.lat}>
              <MarkerContent>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 ${
                  business.status === "APROBADO" ? "bg-primary text-white" : "bg-outline text-white"
                }`}>
                  <Building2 size={16} />
                </span>
              </MarkerContent>
              <MarkerTooltip>
                <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  {business.name}
                </div>
              </MarkerTooltip>
              <MarkerPopup>
                <div className="bg-surface p-3 rounded-xl shadow-2xl border border-outline-variant min-w-[180px]">
                  <strong className="block text-sm font-headline font-bold text-on-surface leading-tight mb-1">{business.name}</strong>
                  <span className="block text-xs text-outline mb-2">{business.category}</span>
                  <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    business.status === "APROBADO" ? "bg-secondary/10 text-secondary" : "bg-outline/10 text-outline"
                  }`}>
                    {business.status === "APROBADO" ? "Punto seguro" : "En verificacion"}
                  </div>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))
        : null}
    </Map>
  );
}

function statusLabel(status: string) {
  if (status === "VERIFICADO") return "Verificado por fuente";
  if (status === "COMUNITARIAMENTE_CONFIABLE") return "Confiable por comunidad";
  return "No verificado";
}
