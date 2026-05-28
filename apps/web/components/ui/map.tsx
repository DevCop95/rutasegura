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

export function Map({ children, className, style, center, zoom = 12, ...options }: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<MapLibreGL.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  const mapStyle = useMemo(() => {
    if (style) return style;
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (maptilerKey) {
      return `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`;
    }
    return osmStyle;
  }, [style]);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new MapLibreGL.Map({
      container: containerRef.current,
      style: mapStyle,
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

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!map) return;
    const element = marker.getElement();
    element.setAttribute("type", "button");
    element.classList.add("mapcnMarkerButton");
    const handleClick = () => {
      onClickRef.current?.();
    };
    element.addEventListener("click", handleClick);
    marker.addTo(map);
    return () => {
      element.removeEventListener("click", handleClick);
      marker.remove();
    };
  }, [map, marker]);

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
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);

  const popup = useMemo(
    () =>
      new MapLibreGL.Popup({
        closeButton: false,
        offset: 18,
        maxWidth: "300px",
      }).setHTML("<div></div>"),
    [],
  );

  useEffect(() => {
    if (!map) return;

    const handleOpen = () => {
      const el = popup.getElement();
      if (!el) return;
      const contentEl = el.querySelector(".maplibregl-popup-content") as HTMLDivElement;
      if (contentEl) {
        contentEl.innerHTML = "";
        setContentElement(contentEl);
      }
    };

    const handleClose = () => {
      setContentElement(null);
    };

    popup.on("open", handleOpen);
    popup.on("close", handleClose);

    marker.setPopup(popup);

    return () => {
      popup.off("open", handleOpen);
      popup.off("close", handleClose);
      marker.setPopup(null);
      popup.remove();
    };
  }, [map, marker, popup]);

  return contentElement ? createPortal(children, contentElement) : null;
}

export function MarkerTooltip({ children }: { children: ReactNode }) {
  const { map, marker } = useMarker();
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);

  const popup = useMemo(
    () =>
      new MapLibreGL.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 18,
        maxWidth: "220px",
      }).setHTML("<div></div>"),
    [],
  );

  useEffect(() => {
    if (!map) return;

    const handleOpen = () => {
      const el = popup.getElement();
      if (!el) return;
      const contentEl = el.querySelector(".maplibregl-popup-content") as HTMLDivElement;
      if (contentEl) {
        contentEl.innerHTML = "";
        setContentElement(contentEl);
      }
    };

    const handleClose = () => {
      setContentElement(null);
    };

    popup.on("open", handleOpen);
    popup.on("close", handleClose);

    const element = marker.getElement();
    const show = () => popup.setLngLat(marker.getLngLat()).addTo(map);
    const hide = () => popup.remove();
    element.addEventListener("mouseenter", show);
    element.addEventListener("mouseleave", hide);

    return () => {
      popup.off("open", handleOpen);
      popup.off("close", handleClose);
      element.removeEventListener("mouseenter", show);
      element.removeEventListener("mouseleave", hide);
      popup.remove();
    };
  }, [map, marker, popup]);

  return contentElement ? createPortal(children, contentElement) : null;
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
      if (map) {
        try {
          if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
          if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        } catch (e) {
          // Map or style already destroyed
        }
      }
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
      if (map) {
        try {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        } catch (e) {
          // Map or style already destroyed
        }
      }
    };
  }, [map, loaded, coordinates, color, id]);

  return null;
}

export function HeatmapLayer({
  points,
}: {
  points: { lng: number; lat: number }[];
}) {
  const { map, loaded } = useMap();
  const reactId = useId();
  const id = useMemo(() => `heatmap-${reactId.replaceAll(":", "")}`, [reactId]);

  useEffect(() => {
    if (!map || !loaded) return;
    const sourceId = `${id}-source`;
    const layerId = `${id}-layer`;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: points.map((p) => ({
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [p.lng, p.lat] },
        })),
      },
    });

    map.addLayer({
      id: layerId,
      type: "heatmap",
      source: sourceId,
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0, "rgba(0, 109, 67, 0)",
          0.2, "#75f8b3",
          0.5, "#fbbc00",
          0.8, "#ba1a1a",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
        "heatmap-opacity": 0.6,
      },
    });

    return () => {
      if (map) {
        try {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        } catch (e) {
          // Map or style already destroyed
        }
      }
    };
  }, [map, loaded, points, id]);

  return null;
}

export function UserMarker({ 
  longitude, 
  latitude 
}: { 
  longitude: number; 
  latitude: number 
}) {
  return (
    <MapMarker longitude={longitude} latitude={latitude}>
      <MarkerContent>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-8 h-8 bg-primary/30 rounded-full animate-ping" />
          <div className="relative w-4 h-4 bg-primary border-2 border-white rounded-full shadow-lg" />
        </div>
      </MarkerContent>
      <MarkerTooltip>
        <div className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
          Tu ubicación
        </div>
      </MarkerTooltip>
    </MapMarker>
  );
}
