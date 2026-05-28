"use client";

import dynamic from "next/dynamic";
import type { MapBusiness, MapReport } from "./MapPanel";

const MapPanel = dynamic(() => import("./MapPanel"), {
  ssr: false,
  loading: () => <div className="mapLoading">Cargando mapa de Cartagena...</div>,
});

type MapShellProps = {
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

export default function MapShell(props: MapShellProps) {
  return <MapPanel {...props} />;
}
