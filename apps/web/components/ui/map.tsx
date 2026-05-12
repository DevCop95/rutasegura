"use client";

import MapLibreGL, { type MapOptions, type MarkerOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Locate, Minus, Plus } from "lucide-react";

type MapContextValue = {
  map: MapLibreGL.Map | null;
  loaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used inside Map");
  }
  return context;
}

const osmStyle: MapLibreGL.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

type MapProps = Omit<MapOptions, "container" | "style"> & {
  children?: ReactNode;
  className?: string;
  style?: MapLibreGL.StyleSpecification | string;
};

export function Map({ children, className, style = osmStyle, center, zoom = 12, ...options }: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<MapLibreGL.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new MapLibreGL.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      attributionControl: { compact: true },
      ...options,
    });

    const handleLoad = () => setLoaded(true);
    instance.on("load", handleLoad);
    setMap(instance);

    return () => {
      instance.off("load", handleLoad);
      instance.remove();
      setLoaded(false);
      setMap(null);
    };
    // MapLibre owns this instance after mount; prop changes are handled by app state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(() => ({ map, loaded }), [map, loaded]);

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={className} />
      {map ? children : null}
    </MapContext.Provider>
  );
}

type MarkerContextValue = {
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarker() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker subcomponents must be used inside MapMarker");
  }
  return context;
}

type MapMarkerProps = Omit<MarkerOptions, "element"> & {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: () => void;
};

export function MapMarker({ longitude, latitude, children, onClick, ...options }: MapMarkerProps) {
  const { map } = useMap();
  const marker = useMemo(
    () =>
      new MapLibreGL.Marker({
        ...options,
        element: document.createElement("button"),
      }).setLngLat([longitude, latitude]),
    // Marker instance is stable; position updates in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!map) return;
    const element = marker.getElement();
    element.setAttribute("type", "button");
    element.classList.add("mapcnMarkerButton");
    const handleClick = () => onClick?.();
    element.addEventListener("click", handleClick);
    marker.addTo(map);
    return () => {
      element.removeEventListener("click", handleClick);
      marker.remove();
    };
  }, [map, marker, onClick]);

  useEffect(() => {
    marker.setLngLat([longitude, latitude]);
  }, [marker, longitude, latitude]);

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {createPortal(children, marker.getElement())}
    </MarkerContext.Provider>
  );
}

export function MarkerContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function MarkerPopup({ children }: { children: ReactNode }) {
  const { map, marker } = useMarker();
  const container = useMemo(() => document.createElement("div"), []);
  const popup = useMemo(
    () =>
      new MapLibreGL.Popup({
        closeButton: false,
        offset: 18,
        maxWidth: "300px",
      }).setDOMContent(container),
    [container],
  );

  useEffect(() => {
    if (!map) return;
    marker.setPopup(popup);
    return () => {
      marker.setPopup(null);
      popup.remove();
    };
  }, [map, marker, popup]);

  return createPortal(children, container);
}

export function MarkerTooltip({ children }: { children: ReactNode }) {
  const { map, marker } = useMarker();
  const container = useMemo(() => document.createElement("div"), []);
  const popup = useMemo(
    () =>
      new MapLibreGL.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 18,
        maxWidth: "220px",
      }).setDOMContent(container),
    [container],
  );

  useEffect(() => {
    if (!map) return;
    const element = marker.getElement();
    const show = () => popup.setLngLat(marker.getLngLat()).addTo(map);
    const hide = () => popup.remove();
    element.addEventListener("mouseenter", show);
    element.addEventListener("mouseleave", hide);
    return () => {
      element.removeEventListener("mouseenter", show);
      element.removeEventListener("mouseleave", hide);
      popup.remove();
    };
  }, [map, marker, popup]);

  return createPortal(children, container);
}

type MapControlsProps = {
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
  allowedBounds?: [[number, number], [number, number]];
};

export function MapControls({ onLocate, allowedBounds }: MapControlsProps) {
  const { map } = useMap();

  function zoom(delta: number) {
    if (!map) return;
    map.zoomTo(map.getZoom() + delta, { duration: 250 });
  }

  function locate() {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      };
      if (allowedBounds && !isInsideBounds(coords.longitude, coords.latitude, allowedBounds)) {
        return;
      }
      map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 15 });
      onLocate?.(coords);
    });
  }

  return (
    <div className="mapcnControls">
      <button type="button" onClick={() => zoom(1)} aria-label="Acercar">
        <Plus size={16} />
      </button>
      <button type="button" onClick={() => zoom(-1)} aria-label="Alejar">
        <Minus size={16} />
      </button>
      <button type="button" onClick={locate} aria-label="Mi ubicacion">
        <Locate size={16} />
      </button>
    </div>
  );
}

function isInsideBounds(lng: number, lat: number, bounds: [[number, number], [number, number]]) {
  const [[west, south], [east, north]] = bounds;
  return lng >= west && lng <= east && lat >= south && lat <= north;
}

export function MapBoundary({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const { map, loaded } = useMap();
  const reactId = useId();
  const id = useMemo(() => `boundary-${reactId.replaceAll(":", "")}`, [reactId]);

  useEffect(() => {
    if (!map || !loaded) return;
    const sourceId = `${id}-source`;
    const fillLayerId = `${id}-fill`;
    const lineLayerId = `${id}-line`;
    const [[west, south], [east, north]] = bounds;
    const coordinates = [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],
      ],
    ];

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates,
        },
      },
    });
    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": "#1d7a5c",
        "fill-opacity": 0.08,
      },
    });
    map.addLayer({
      id: lineLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "#1d7a5c",
        "line-width": 3,
        "line-opacity": 0.85,
      },
    });

    return () => {
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, loaded, bounds, id]);

  return null;
}

export function MapRoute({
  coordinates,
  color = "#255c99",
}: {
  coordinates: [number, number][];
  color?: string;
}) {
  const { map, loaded } = useMap();
  const reactId = useId();
  const id = useMemo(() => `route-${reactId.replaceAll(":", "")}`, [reactId]);

  useEffect(() => {
    if (!map || !loaded || coordinates.length < 2) return;
    const sourceId = `${id}-source`;
    const layerId = `${id}-layer`;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates as [number, number][],
        },
      },
    });
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": color, "line-width": 4, "line-opacity": 0.72 },
    });

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, loaded, coordinates, color, id]);

  return null;
}
