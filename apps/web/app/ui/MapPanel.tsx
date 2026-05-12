"use client";

import { Building2, ShieldAlert } from "lucide-react";
import {
  Map,
  MapControls,
  MapBoundary,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
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
  onSelectReport: (id: string) => void;
};

const demoRoute: [number, number][] = [
  [-75.5488, 10.4262],
  [-75.5451, 10.4222],
  [-75.5418, 10.4182],
  [-75.5362, 10.4109],
];

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
  onSelectReport,
}: MapPanelProps) {
  return (
    <Map
      center={CARTAGENA_CENTER}
      zoom={13.45}
      minZoom={12.8}
      maxZoom={18}
      maxBounds={CARTAGENA_BOUNDS}
      dragRotate={false}
      pitchWithRotate={false}
      renderWorldCopies={false}
      className="mapCanvas"
    >
      <MapControls allowedBounds={CARTAGENA_BOUNDS} />
      <MapBoundary bounds={CARTAGENA_BOUNDS} />
      {showRoute ? <MapRoute coordinates={demoRoute} color="#255c99" /> : null}

      {showReports
        ? reports.map((report) => (
            <MapMarker
              key={report.id}
              longitude={report.lng}
              latitude={report.lat}
              onClick={() => onSelectReport(report.id)}
            >
              <MarkerContent>
                <span className={`mapPin incident ${report.status === "VERIFICADO" ? "verified" : ""}`}>
                  <ShieldAlert size={16} />
                </span>
              </MarkerContent>
              <MarkerTooltip>
                <div className="mapTooltip">{report.title}</div>
              </MarkerTooltip>
              <MarkerPopup>
                <div className="mapPopup">
                  <strong>{report.title}</strong>
                  <span>{report.category}</span>
                  <small>{statusLabel(report.status)}</small>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))
        : null}

      {showBusinesses
        ? businesses.map((business) => (
            <MapMarker key={business.id} longitude={business.lng} latitude={business.lat}>
              <MarkerContent>
                <span className={`mapPin business ${business.status === "APROBADO" ? "approved" : ""}`}>
                  <Building2 size={16} />
                </span>
              </MarkerContent>
              <MarkerTooltip>
                <div className="mapTooltip">{business.name}</div>
              </MarkerTooltip>
              <MarkerPopup>
                <div className="mapPopup">
                  <strong>{business.name}</strong>
                  <span>{business.category}</span>
                  <small>{business.status === "APROBADO" ? "Punto seguro" : "En verificacion"}</small>
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
