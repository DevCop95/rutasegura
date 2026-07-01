"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BellRing,
  Building2,
  Check,
  Clock3,
  CreditCard,
  EyeOff,
  Filter,
  Flag,
  GitMerge,
  Heart,
  HelpCircle,
  Layers,
  Link,
  LogIn,
  MapPin,
  Navigation,
  Newspaper,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  User,
  UserPlus,
  Users,
  X,
  MoreVertical,
  Menu,
  Search,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import MapShell from "./MapShell";
import AuthModal from "./AuthModal";
import ReportFormModal from "./ReportFormModal";
import BusinessFormModal from "./BusinessFormModal";
import ReportSourcesModal, { type ReportSourceItem } from "./ReportSourcesModal";
import * as turf from "@turf/turf";

// Configuración de Ciudades de Colombia (Centros, límites geográficos y semillas terrestres de alta delincuencia)
type CityConfig = {
  name: string;
  country: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  seeds: { name: string; lat: number; lng: number }[];
  demoBusinesses: { name: string; category: string; lat: number; lng: number }[];
};

const CITIES_CONFIG: Record<string, CityConfig> = {
  Cartagena: {
    name: "Cartagena",
    country: "Colombia",
    center: [-75.535, 10.405],
    bounds: [
      [-75.59, 10.34],
      [-75.47, 10.45],
    ],
    seeds: [
      { name: "El Pozón", lat: 10.4020, lng: -75.4780 },
      { name: "Olaya Herrera", lat: 10.3950, lng: -75.4950 },
      { name: "Boston", lat: 10.4230, lng: -75.5200 },
      { name: "El Líbano", lat: 10.4120, lng: -75.5120 },
      { name: "Torices", lat: 10.4320, lng: -75.5280 },
      { name: "Chambacú", lat: 10.4250, lng: -75.5370 },
      { name: "Marbella", lat: 10.4390, lng: -75.5290 },
      { name: "Crespo", lat: 10.4445, lng: -75.5180 },
      { name: "Manga", lat: 10.4132, lng: -75.5342 },
      { name: "Bocagrande", lat: 10.4075, lng: -75.5555 },
      { name: "San Fernando", lat: 10.3870, lng: -75.4880 },
      { name: "La Esperanza", lat: 10.4010, lng: -75.5030 },
      { name: "Las Gaviotas", lat: 10.3880, lng: -75.4790 },
      { name: "Los Ejecutivos", lat: 10.3950, lng: -75.4850 },
      { name: "Ternera", lat: 10.3700, lng: -75.4750 },
      { name: "Socorro", lat: 10.3760, lng: -75.4820 },
      { name: "Cabrero", lat: 10.4345, lng: -75.5360 },
      { name: "Lo Amador", lat: 10.4245, lng: -75.5305 },
      { name: "Bruselas", lat: 10.4050, lng: -75.5220 },
      { name: "Zaragocilla", lat: 10.3990, lng: -75.5160 },
      { name: "Blas de Lezo", lat: 10.3890, lng: -75.4980 },
      { name: "Nelson Mandela", lat: 10.3620, lng: -75.5050 },
      { name: "Chile", lat: 10.4080, lng: -75.5250 },
      { name: "Amberes", lat: 10.4100, lng: -75.5280 },
      { name: "San Francisco", lat: 10.4360, lng: -75.5200 },
    ],
    demoBusinesses: [
      { name: "Cafeteria Baluarte", category: "Cafe", lat: 10.4252, lng: -75.5487 },
      { name: "Farmacia Manga 24h", category: "Farmacia", lat: 10.4109, lng: -75.5362 },
    ]
  },
  Bogotá: {
    name: "Bogotá",
    country: "Colombia",
    center: [-74.0721, 4.6097],
    bounds: [
      [-74.25, 4.45],
      [-73.98, 4.83],
    ],
    seeds: [
      { name: "Kennedy", lat: 4.6300, lng: -74.1500 },
      { name: "Chapinero", lat: 4.6480, lng: -74.0600 },
      { name: "Bosa", lat: 4.6000, lng: -74.1800 },
      { name: "Ciudad Bolívar", lat: 4.5700, lng: -74.1400 },
      { name: "Suba", lat: 4.7400, lng: -74.0900 },
      { name: "San Victorino", lat: 4.6020, lng: -74.0780 },
      { name: "Teusaquillo", lat: 4.6350, lng: -74.0850 },
      { name: "Engativá", lat: 4.7000, lng: -74.1100 },
      { name: "Usaquén", lat: 4.7050, lng: -74.0300 },
      { name: "Santa Fe", lat: 4.6050, lng: -74.0700 },
      { name: "Fontibón", lat: 4.6750, lng: -74.1450 },
      { name: "San Cristóbal", lat: 4.5750, lng: -74.0900 },
      { name: "Usme", lat: 4.5100, lng: -74.1200 },
      { name: "Tunjuelito", lat: 4.5850, lng: -74.1350 },
      { name: "Puente Aranda", lat: 4.6200, lng: -74.1150 },
      { name: "Antonio Nariño", lat: 4.5900, lng: -74.1000 },
      { name: "Rafael Uribe Uribe", lat: 4.5650, lng: -74.1100 },
      { name: "Barrios Unidos", lat: 4.6650, lng: -74.0750 },
      { name: "Mártires", lat: 4.6080, lng: -74.0900 },
    ],
    demoBusinesses: [
      { name: "Punto Seguro Chapinero", category: "Cafe", lat: 4.6495, lng: -74.0620 },
      { name: "Farmacia Bosa 24h", category: "Farmacia", lat: 4.6015, lng: -74.1780 },
    ]
  },
  Medellín: {
    name: "Medellín",
    country: "Colombia",
    center: [-75.5670, 6.2518],
    bounds: [
      [-75.68, 6.13],
      [-75.50, 6.35],
    ],
    seeds: [
      { name: "El Poblado", lat: 6.2100, lng: -75.5650 },
      { name: "Laureles", lat: 6.2450, lng: -75.5900 },
      { name: "Belén", lat: 6.2250, lng: -75.5950 },
      { name: "Aranjuez", lat: 6.2750, lng: -75.5600 },
      { name: "San Javier (Comuna 13)", lat: 6.2500, lng: -75.6150 },
      { name: "Candelaria (Centro)", lat: 6.2480, lng: -75.5680 },
      { name: "Manrique", lat: 6.2720, lng: -75.5450 },
      { name: "Robledo", lat: 6.2780, lng: -75.5950 },
      { name: "Guayabal", lat: 6.2080, lng: -75.5800 },
      { name: "La América", lat: 6.2530, lng: -75.6020 },
      { name: "Castilla", lat: 6.2950, lng: -75.5750 },
      { name: "Doce de Octubre", lat: 6.3050, lng: -75.5850 },
      { name: "Villa Hermosa", lat: 6.2580, lng: -75.5450 },
      { name: "Buenos Aires", lat: 6.2380, lng: -75.5480 },
      { name: "Santa Cruz", lat: 6.2980, lng: -75.5520 },
      { name: "Popular", lat: 6.3020, lng: -75.5450 },
    ],
    demoBusinesses: [
      { name: "Estación Segura Poblado", category: "Cafe", lat: 6.2120, lng: -75.5670 },
      { name: "Droguería Laureles", category: "Farmacia", lat: 6.2440, lng: -75.5880 },
    ]
  },
  Cali: {
    name: "Cali",
    country: "Colombia",
    center: [-76.5225, 3.4372],
    bounds: [
      [-76.60, 3.32],
      [-76.45, 3.50],
    ],
    seeds: [
      { name: "Aguablanca", lat: 3.4200, lng: -76.4800 },
      { name: "Siloé", lat: 3.4250, lng: -76.5600 },
      { name: "Ciudad Jardín", lat: 3.3700, lng: -76.5300 },
      { name: "El Limonar", lat: 3.4000, lng: -76.5355 },
      { name: "Centro", lat: 3.4450, lng: -76.5250 },
      { name: "San Fernando", lat: 3.4300, lng: -76.5400 },
      { name: "Alameda", lat: 3.4380, lng: -76.5300 },
      { name: "Menga", lat: 3.4850, lng: -76.5200 },
      { name: "Lido", lat: 3.4260, lng: -76.5480 },
      { name: "Tequendama", lat: 3.4280, lng: -76.5410 },
      { name: "Prados del Norte", lat: 3.4680, lng: -76.5180 },
      { name: "El Peñón", lat: 3.4480, lng: -76.5420 },
      { name: "San Antonio", lat: 3.4440, lng: -76.5400 },
      { name: "Terrón Colorado", lat: 3.4550, lng: -76.5650 },
    ],
    demoBusinesses: [
      { name: "Boulevard del Río Safe", category: "Cafe", lat: 3.4460, lng: -76.5260 },
      { name: "Farmacia San Fernando", category: "Farmacia", lat: 3.4310, lng: -76.5390 },
    ]
  },
  Barranquilla: {
    name: "Barranquilla",
    country: "Colombia",
    center: [-74.8050, 10.9850],
    bounds: [
      [-74.88, 10.90],
      [-74.75, 11.05],
    ],
    seeds: [
      { name: "Centro", lat: 10.9800, lng: -74.7800 },
      { name: "Soledad", lat: 10.9200, lng: -74.7600 },
      { name: "Alto Prado", lat: 11.0050, lng: -74.8100 },
      { name: "Boston", lat: 10.9900, lng: -74.7950 },
      { name: "Rebolo", lat: 10.9650, lng: -74.7800 },
      { name: "El Prado", lat: 10.9980, lng: -74.8050 },
      { name: "Miramar", lat: 11.0200, lng: -74.8250 },
      { name: "Las Nieves", lat: 10.9550, lng: -74.7850 },
      { name: "Chiquinquirá", lat: 10.9750, lng: -74.7900 },
      { name: "San Felipe", lat: 10.9880, lng: -74.8220 },
      { name: "El Silencio", lat: 10.9920, lng: -74.8150 },
      { name: "Riomar", lat: 11.0180, lng: -74.8150 },
      { name: "El Golf", lat: 11.0100, lng: -74.8180 },
    ],
    demoBusinesses: [
      { name: "Cafe Prado Seguro", category: "Cafe", lat: 11.0060, lng: -74.8080 },
      { name: "Farmacia Alto Prado", category: "Farmacia", lat: 11.0040, lng: -74.8120 },
    ]
  },
  Madrid: {
    name: "Madrid",
    country: "España",
    center: [-3.70379, 40.41678],
    bounds: [
      [-3.85, 40.3],
      [-3.55, 40.5],
    ],
    seeds: [
      { name: "Carabanchel", lat: 40.3800, lng: -3.7300 },
      { name: "Puente de Vallecas", lat: 40.3950, lng: -3.6650 },
      { name: "Tetuán", lat: 40.4600, lng: -3.7000 },
      { name: "Usera", lat: 40.3850, lng: -3.7000 },
      { name: "Centro", lat: 40.4150, lng: -3.7050 },
    ],
    demoBusinesses: [
      { name: "Café Seguro Puerta del Sol", category: "Cafe", lat: 40.4170, lng: -3.7030 },
      { name: "Farmacia Carabanchel 24h", category: "Farmacia", lat: 40.3820, lng: -3.7280 },
    ]
  },
  Barcelona: {
    name: "Barcelona",
    country: "España",
    center: [2.1734, 41.3851],
    bounds: [
      [2.05, 41.3],
      [2.3, 41.45],
    ],
    seeds: [
      { name: "El Raval", lat: 41.3780, lng: 2.1680 },
      { name: "Gòtic", lat: 41.3820, lng: 2.1770 },
      { name: "Nou Barris", lat: 41.4420, lng: 2.1780 },
      { name: "Sants-Montjuïc", lat: 41.3700, lng: 2.1400 },
      { name: "Ciutat Vella", lat: 41.3800, lng: 2.1730 },
    ],
    demoBusinesses: [
      { name: "Punt Segur Raval", category: "Cafe", lat: 41.3790, lng: 2.1690 },
      { name: "Farmàcia Gòtic 24h", category: "Farmacia", lat: 41.3815, lng: 2.1760 },
    ]
  },
  "Buenos Aires": {
    name: "Buenos Aires",
    country: "Argentina",
    center: [-58.3816, -34.6037],
    bounds: [
      [-58.55, -34.7],
      [-58.33, -34.5],
    ],
    seeds: [
      { name: "Constitución", lat: -34.6270, lng: -58.3800 },
      { name: "La Boca", lat: -34.6350, lng: -58.3600 },
      { name: "San Telmo", lat: -34.6210, lng: -58.3720 },
      { name: "Palermo", lat: -34.5850, lng: -58.4200 },
      { name: "Recoleta", lat: -34.5900, lng: -58.3950 },
    ],
    demoBusinesses: [
      { name: "Café Seguro San Telmo", category: "Cafe", lat: -34.6205, lng: -58.3715 },
      { name: "Farmacia Constitución 24h", category: "Farmacia", lat: -34.6265, lng: -58.3790 },
    ]
  },
  Santiago: {
    name: "Santiago",
    country: "Chile",
    center: [-70.6483, -33.4489],
    bounds: [
      [-70.8, -33.6],
      [-70.5, -33.35],
    ],
    seeds: [
      { name: "Estación Central", lat: -33.4550, lng: -70.7000 },
      { name: "Santiago Centro", lat: -33.4450, lng: -70.6550 },
      { name: "La Florida", lat: -33.5200, lng: -70.5800 },
      { name: "Maipú", lat: -33.5100, lng: -70.7600 },
      { name: "Providencia", lat: -33.4280, lng: -70.6150 },
    ],
    demoBusinesses: [
      { name: "Punto Seguro Providencia", category: "Cafe", lat: -33.4290, lng: -70.6140 },
      { name: "Farmacia Estación Central", category: "Farmacia", lat: -33.4560, lng: -70.6990 },
    ]
  },
  Lima: {
    name: "Lima",
    country: "Perú",
    center: [-77.0428, -12.0464],
    bounds: [
      [-77.2, -12.2],
      [-76.9, -11.9],
    ],
    seeds: [
      { name: "La Victoria", lat: -12.0650, lng: -77.0180 },
      { name: "Centro Histórico", lat: -12.0450, lng: -77.0300 },
      { name: "Miraflores", lat: -12.1200, lng: -77.0300 },
      { name: "Barranco", lat: -12.1450, lng: -77.0220 },
      { name: "San Juan de Lurigancho", lat: -12.0000, lng: -76.9900 },
    ],
    demoBusinesses: [
      { name: "Café Miraflores Seguro", category: "Cafe", lat: -12.1190, lng: -77.0295 },
      { name: "Farmacia La Victoria 24h", category: "Farmacia", lat: -12.0645, lng: -77.0175 },
    ]
  },
  Quito: {
    name: "Quito",
    country: "Ecuador",
    center: [-78.4678, -0.1807],
    bounds: [
      [-78.6, -0.3],
      [-78.3, -0.05],
    ],
    seeds: [
      { name: "La Mariscal", lat: -0.2030, lng: -78.4900 },
      { name: "Centro Histórico", lat: -0.2200, lng: -78.5120 },
      { name: "Guamaní", lat: -0.2950, lng: -78.5550 },
      { name: "Carcelén", lat: -0.0950, lng: -78.4800 },
      { name: "Iñaquito", lat: -0.1750, lng: -78.4850 },
    ],
    demoBusinesses: [
      { name: "Estación Segura Carolina", category: "Cafe", lat: -0.1760, lng: -78.4840 },
      { name: "Farmacia La Mariscal 24h", category: "Farmacia", lat: -0.2025, lng: -78.4895 },
    ]
  },
  Caracas: {
    name: "Caracas",
    country: "Venezuela",
    center: [-66.9036, 10.4806],
    bounds: [
      [-67.05, 10.4],
      [-66.75, 10.55],
    ],
    seeds: [
      { name: "Libertador (El Silencio)", lat: 10.5050, lng: -66.9180 },
      { name: "Chacao", lat: 10.4900, lng: -66.8550 },
      { name: "Sucre (Petare)", lat: 10.4780, lng: -66.8000 },
      { name: "Catia", lat: 10.5200, lng: -66.9500 },
      { name: "Sabana Grande", lat: 10.4950, lng: -66.8800 },
    ],
    demoBusinesses: [
      { name: "Local Seguro Chacao", category: "Cafe", lat: 10.4895, lng: -66.8545 },
      { name: "Farmacia Sabana Grande 24h", category: "Farmacia", lat: 10.4945, lng: -66.8790 },
    ]
  },
  Montevideo: {
    name: "Montevideo",
    country: "Uruguay",
    center: [-56.1645, -34.9011],
    bounds: [
      [-56.3, -35.0],
      [-56.0, -34.8],
    ],
    seeds: [
      { name: "Ciudad Vieja", lat: -34.9060, lng: -56.2000 },
      { name: "Tres Cruces", lat: -34.8930, lng: -56.1650 },
      { name: "Pocitos", lat: -34.9120, lng: -56.1500 },
      { name: "Centro", lat: -34.9020, lng: -56.1900 },
      { name: "Carrasco", lat: -34.8880, lng: -56.0550 },
    ],
    demoBusinesses: [
      { name: "Café Tres Cruces Seguro", category: "Cafe", lat: -34.8925, lng: -56.1640 },
      { name: "Farmacia Pocitos 24h", category: "Farmacia", lat: -34.9115, lng: -56.1490 },
    ]
  },
  Asuncion: {
    name: "Asunción",
    country: "Paraguay",
    center: [-57.5759, -25.2637],
    bounds: [
      [-57.7, -25.35],
      [-57.45, -25.18],
    ],
    seeds: [
      { name: "La Catedral (Centro)", lat: -25.2810, lng: -57.6350 },
      { name: "Villa Morra", lat: -25.2950, lng: -57.5800 },
      { name: "Sajonia", lat: -25.2850, lng: -57.6550 },
      { name: "Trinidad", lat: -25.2550, lng: -57.5750 },
      { name: "San Pablo", lat: -25.3200, lng: -57.5850 },
    ],
    demoBusinesses: [
      { name: "Punto Seguro Villa Morra", category: "Cafe", lat: -25.2945, lng: -57.5790 },
      { name: "Farmacia Centro 24h", category: "Farmacia", lat: -25.2805, lng: -57.6340 },
    ]
  },
  "La Paz": {
    name: "La Paz",
    country: "Bolivia",
    center: [-68.1193, -16.4897],
    bounds: [
      [-68.2, -16.55],
      [-68.0, -16.4],
    ],
    seeds: [
      { name: "Sopocachi", lat: -16.5100, lng: -68.1250 },
      { name: "San Pedro", lat: -16.4980, lng: -68.1400 },
      { name: "Miraflores", lat: -16.4920, lng: -68.1150 },
      { name: "Zona Sur (Calacoto)", lat: -16.5400, lng: -68.0850 },
      { name: "El Alto (Ceja)", lat: -16.5050, lng: -68.1600 },
    ],
    demoBusinesses: [
      { name: "Café Sopocachi Seguro", category: "Cafe", lat: -16.5095, lng: -68.1245 },
      { name: "Droguería Zona Sur", category: "Farmacia", lat: -16.5395, lng: -68.0845 },
    ]
  },
  "Rio de Janeiro": {
    name: "Rio de Janeiro",
    country: "Brasil",
    center: [-43.1729, -22.9068],
    bounds: [
      [-43.4, -23.05],
      [-43.1, -22.8],
    ],
    seeds: [
      { name: "Centro", lat: -22.9020, lng: -43.1800 },
      { name: "Lapa", lat: -22.9130, lng: -43.1820 },
      { name: "Copacabana", lat: -22.9700, lng: -43.1850 },
      { name: "Ipanema", lat: -22.9840, lng: -43.2050 },
      { name: "Rocinha", lat: -22.9880, lng: -43.2450 },
    ],
    demoBusinesses: [
      { name: "Ponto Seguro Copacabana", category: "Cafe", lat: -22.9695, lng: -43.1840 },
      { name: "Drogaria Lapa 24h", category: "Farmacia", lat: -22.9125, lng: -43.1810 },
    ]
  },
  "São Paulo": {
    name: "São Paulo",
    country: "Brasil",
    center: [-46.6333, -23.5505],
    bounds: [
      [-46.85, -23.7],
      [-46.45, -23.4],
    ],
    seeds: [
      { name: "Sé (Centro)", lat: -23.5500, lng: -46.6340 },
      { name: "Pinheiros", lat: -23.5650, lng: -46.6850 },
      { name: "Jardins", lat: -23.5680, lng: -46.6600 },
      { name: "República", lat: -23.5430, lng: -46.6420 },
      { name: "Capão Redondo", lat: -23.6600, lng: -46.7800 },
    ],
    demoBusinesses: [
      { name: "Café Seguro Pinheiros", category: "Cafe", lat: -23.5645, lng: -46.6840 },
      { name: "Drogaria Jardins 24h", category: "Farmacia", lat: -23.5675, lng: -46.6590 },
    ]
  },
  Georgetown: {
    name: "Georgetown",
    country: "Guyana",
    center: [-58.1551, 6.8013],
    bounds: [
      [-58.2, 6.75],
      [-58.1, 6.85],
    ],
    seeds: [
      { name: "Bourda", lat: 6.8050, lng: -58.1500 },
      { name: "Charlestown", lat: 6.7980, lng: -58.1620 },
      { name: "Kitty", lat: 6.8200, lng: -58.1400 },
      { name: "Lacytown", lat: 6.8080, lng: -58.1550 },
      { name: "Kingston", lat: 6.8180, lng: -58.1600 },
    ],
    demoBusinesses: [
      { name: "Safe Haven Kingston", category: "Cafe", lat: 6.8175, lng: -58.1590 },
      { name: "Pharmacy Kitty 24h", category: "Farmacia", lat: 6.8195, lng: -58.1390 },
    ]
  },
  Paramaribo: {
    name: "Paramaribo",
    country: "Surinam",
    center: [-55.1668, 5.8520],
    bounds: [
      [-55.25, 5.8],
      [-55.1, 5.9],
    ],
    seeds: [
      { name: "Centrum", lat: 5.8250, lng: -55.1600 },
      { name: "Rainville", lat: 5.8500, lng: -55.1500 },
      { name: "Blauwgrond", lat: 5.8750, lng: -55.1450 },
      { name: "Beekhuizen", lat: 5.8050, lng: -55.1800 },
      { name: "Weg naar Zee", lat: 5.8650, lng: -55.2200 },
    ],
    demoBusinesses: [
      { name: "Safe Spot Rainville", category: "Cafe", lat: 5.8495, lng: -55.1490 },
      { name: "Apotheek Centrum 24h", category: "Farmacia", lat: 5.8245, lng: -55.1590 },
    ]
  },
  CDMX: {
    name: "CDMX",
    country: "México",
    center: [-99.1332, 19.4326],
    bounds: [
      [-99.3, 19.25],
      [-99.0, 19.55],
    ],
    seeds: [
      { name: "Tepito", lat: 19.4440, lng: -99.1270 },
      { name: "Doctores", lat: 19.4220, lng: -99.1450 },
      { name: "Roma Norte", lat: 19.4180, lng: -99.1620 },
      { name: "Polanco", lat: 19.4330, lng: -99.2000 },
      { name: "Iztapalapa", lat: 19.3550, lng: -99.0600 },
    ],
    demoBusinesses: [
      { name: "Café Seguro Roma", category: "Cafe", lat: 19.4175, lng: -99.1615 },
      { name: "Farmacia Doctores 24h", category: "Farmacia", lat: 19.4215, lng: -99.1440 },
    ]
  },
  "New York": {
    name: "New York",
    country: "Estados Unidos",
    center: [-74.0060, 40.7128],
    bounds: [
      [-74.25, 40.5],
      [-73.7, 40.9],
    ],
    seeds: [
      { name: "Times Square", lat: 40.7580, lng: -74.0060 },
      { name: "Mott Haven (Bronx)", lat: 40.8080, lng: -73.9280 },
      { name: "Williamsburg (Brooklyn)", lat: 40.7080, lng: -73.9570 },
      { name: "Harlem", lat: 40.8080, lng: -73.9480 },
      { name: "Astoria (Queens)", lat: 40.7650, lng: -73.9250 },
    ],
    demoBusinesses: [
      { name: "Midtown Safe Café", category: "Cafe", lat: 40.7575, lng: -74.0050 },
      { name: "Brooklyn Pharmacy 24h", category: "Farmacia", lat: 40.7075, lng: -73.9560 },
    ]
  },
  Toronto: {
    name: "Toronto",
    country: "Canadá",
    center: [-79.3832, 43.6532],
    bounds: [
      [-79.6, 43.55],
      [-79.15, 43.85],
    ],
    seeds: [
      { name: "Downtown", lat: 43.6540, lng: -79.3830 },
      { name: "Scarborough", lat: 43.7730, lng: -79.2580 },
      { name: "Etobicoke", lat: 43.6440, lng: -79.5430 },
      { name: "North York", lat: 43.7610, lng: -79.4110 },
      { name: "Queen West", lat: 43.6480, lng: -79.4000 },
    ],
    demoBusinesses: [
      { name: "Queen West Safe Haven", category: "Cafe", lat: 43.6475, lng: -79.3990 },
      { name: "Downtown Pharma 24h", category: "Farmacia", lat: 43.6535, lng: -79.3820 },
    ]
  },
  "Ciudad de Panama": {
    name: "Ciudad de Panamá",
    country: "Panamá",
    center: [-79.5198, 8.9824],
    bounds: [
      [-79.65, 8.9],
      [-79.35, 9.1],
    ],
    seeds: [
      { name: "Casco Viejo", lat: 8.9520, lng: -79.5340 },
      { name: "El Chorrillo", lat: 8.9540, lng: -79.5440 },
      { name: "Bella Vista", lat: 8.9780, lng: -79.5250 },
      { name: "San Francisco", lat: 8.9880, lng: -79.5020 },
      { name: "Calidonia", lat: 8.9680, lng: -79.5380 },
    ],
    demoBusinesses: [
      { name: "Café Seguro Bella Vista", category: "Cafe", lat: 8.9775, lng: -79.5240 },
      { name: "Farmacia El Chorrillo 24h", category: "Farmacia", lat: 8.9535, lng: -79.5430 },
    ]
  },
  "San Jose": {
    name: "San José",
    country: "Costa Rica",
    center: [-84.0907, 9.9281],
    bounds: [
      [-84.2, 9.85],
      [-84.0, 10.0],
    ],
    seeds: [
      { name: "Centro", lat: 9.9330, lng: -84.0800 },
      { name: "San Pedro", lat: 9.9320, lng: -84.0500 },
      { name: "Escazú", lat: 9.9200, lng: -84.1400 },
      { name: "La Carpio", lat: 9.9600, lng: -84.1200 },
      { name: "Desamparados", lat: 9.8980, lng: -84.0650 },
    ],
    demoBusinesses: [
      { name: "Punto Seguro Escazú", category: "Cafe", lat: 9.9195, lng: -84.1390 },
      { name: "Farmacia Centro 24h", category: "Farmacia", lat: 9.9325, lng: -84.0790 },
    ]
  },
  Managua: {
    name: "Managua",
    country: "Nicaragua",
    center: [-86.2362, 12.1150],
    bounds: [
      [-86.35, 12.05],
      [-86.15, 12.2],
    ],
    seeds: [
      { name: "Mercado Oriental", lat: 12.1450, lng: -86.2650 },
      { name: "Centro Histórico", lat: 12.1550, lng: -86.2750 },
      { name: "Altamira", lat: 12.1220, lng: -86.2500 },
      { name: "Linda Vista", lat: 12.1500, lng: -86.3000 },
      { name: "Bello Horizonte", lat: 12.1400, lng: -86.2300 },
    ],
    demoBusinesses: [
      { name: "Local Seguro Altamira", category: "Cafe", lat: 12.1215, lng: -86.2490 },
      { name: "Farmacia Linda Vista 24h", category: "Farmacia", lat: 12.1495, lng: -86.2990 },
    ]
  },
  Tegucigalpa: {
    name: "Tegucigalialpa",
    country: "Honduras",
    center: [-87.2068, 14.0723],
    bounds: [
      [-87.3, 13.98],
      [-87.1, 14.15],
    ],
    seeds: [
      { name: "Centro", lat: 14.1020, lng: -87.2060 },
      { name: "Comayagüela", lat: 14.0950, lng: -87.2200 },
      { name: "Colonia Palmira", lat: 14.1000, lng: -87.1850 },
      { name: "Suyapa", lat: 14.0820, lng: -87.1650 },
      { name: "El Pedregal", lat: 14.0680, lng: -87.2350 },
    ],
    demoBusinesses: [
      { name: "Café Seguro Palmira", category: "Cafe", lat: 14.0995, lng: -87.1840 },
      { name: "Farmacia Comayagüela 24h", category: "Farmacia", lat: 14.0945, lng: -87.2190 },
    ]
  },
  "San Salvador": {
    name: "San Salvador",
    country: "El Salvador",
    center: [-89.2182, 13.6929],
    bounds: [
      [-89.3, 13.62],
      [-89.1, 13.75],
    ],
    seeds: [
      { name: "Centro Histórico", lat: 13.6980, lng: -89.1900 },
      { name: "San Benito", lat: 13.6920, lng: -89.2380 },
      { name: "Soyapango", lat: 13.7150, lng: -89.1400 },
      { name: "Mejicanos", lat: 13.7300, lng: -89.2100 },
      { name: "Santa Tecla", lat: 13.6780, lng: -89.2880 },
    ],
    demoBusinesses: [
      { name: "Punto Seguro San Benito", category: "Cafe", lat: 13.6915, lng: -89.2370 },
      { name: "Farmacia Soyapango 24h", category: "Farmacia", lat: 13.7145, lng: -89.1390 },
    ]
  },
  Guatemala: {
    name: "Ciudad de Guatemala",
    country: "Guatemala",
    center: [-90.5069, 14.6349],
    bounds: [
      [-90.6, 14.5],
      [-90.4, 14.7],
    ],
    seeds: [
      { name: "Zona 1 (Centro)", lat: 14.6400, lng: -90.5120 },
      { name: "Zona 10 (Viva)", lat: 14.6000, lng: -90.5050 },
      { name: "Zona 3 (El Gallito)", lat: 14.6320, lng: -90.5300 },
      { name: "Zona 18", lat: 14.6800, lng: -90.4700 },
      { name: "Zona 4 (Cuatro Grados)", lat: 14.6220, lng: -90.5150 },
    ],
    demoBusinesses: [
      { name: "Café Seguro Zona 4", category: "Cafe", lat: 14.6215, lng: -90.5140 },
      { name: "Farmacia Zona 10 24h", category: "Farmacia", lat: 14.5995, lng: -90.5040 },
    ]
  },
  Belmopan: {
    name: "Belmopán",
    country: "Belice",
    center: [-88.7735, 17.2510],
    bounds: [
      [-88.85, 17.2],
      [-88.7, 17.3],
    ],
    seeds: [
      { name: "City Center", lat: 17.2520, lng: -88.7730 },
      { name: "Salvapan", lat: 17.2450, lng: -88.7880 },
      { name: "Las Flores", lat: 17.2600, lng: -88.7900 },
      { name: "Ring Road", lat: 17.2550, lng: -88.7650 },
      { name: "Mountain View", lat: 17.2400, lng: -88.7600 },
    ],
    demoBusinesses: [
      { name: "Belmopan Safe Haven", category: "Cafe", lat: 17.2515, lng: -88.7720 },
      { name: "Central Pharmacy 24h", category: "Farmacia", lat: 17.2545, lng: -88.7640 },
    ]
  }
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

// Distribución realista del ciclo de vida de un reporte: la mayoría queda
// sin verificar, una minoría es verificada por fuente y menos aún alcanza
// confianza comunitaria por votos.
const DEMO_STATUS_WEIGHTS: [string, number][] = [
  ["NO_VERIFICADO", 0.55],
  ["VERIFICADO", 0.25],
  ["COMUNITARIAMENTE_CONFIABLE", 0.20],
];

const DEMO_CATEGORY_WEIGHTS: [string, number][] = [
  ["Hurto", 0.4],
  ["Acoso", 0.25],
  ["Iluminacion", 0.2],
  ["Alerta", 0.15],
];

function weightedRandom(weights: [string, number][]): string {
  const roll = Math.random();
  let acc = 0;
  for (const [value, weight] of weights) {
    acc += weight;
    if (roll <= acc) return value;
  }
  return weights[weights.length - 1][0];
}

function generateDemoReports(cityKey: string, citiesObj: Record<string, CityConfig> = CITIES_CONFIG): ReportItem[] {
  const config = citiesObj[cityKey] || citiesObj["Cartagena"];
  if (!config.seeds || config.seeds.length === 0) return [];
  return Array.from({ length: 25 }, (_, i) => {
    const seed = config.seeds[i % config.seeds.length];
    // Perturbación muy pequeña (máx ~150 metros) para garantizar caer en tierra firme
    const lat = seed.lat + (Math.random() - 0.5) * 0.003;
    const lng = seed.lng + (Math.random() - 0.5) * 0.003;
    return {
      id: `demo-r-${cityKey}-${i}`,
      title: `Incidente ${i + 1}`,
      description: `Reporte automático de prueba en ${seed.name}`,
      type: "INSTANTANEO" as const,
      status: weightedRandom(DEMO_STATUS_WEIGHTS),
      category: weightedRandom(DEMO_CATEGORY_WEIGHTS),
      zone: seed.name,
      time: "12:00 PM",
      author: "User",
      authorRank: "Ciudadano",
      children: 0,
      votes: { yes: 0, no: 0, unknown: 0 },
      lat: lat,
      lng: lng,
      isWomensModeRelevant: Math.random() < 0.25,
    };
  });
}

function generateDemoBusinesses(cityKey: string, citiesObj: Record<string, CityConfig> = CITIES_CONFIG): BusinessItem[] {
  const config = citiesObj[cityKey] || citiesObj["Cartagena"];
  if (!config.demoBusinesses || config.demoBusinesses.length === 0) return [];
  return config.demoBusinesses.map((b, i) => ({
    id: `demo-b-${cityKey}-${i}`,
    name: b.name,
    category: b.category,
    status: "APROBADO",
    label: "Punto seguro patrocinado",
    zone: b.name.split(" ").slice(-1)[0],
    score: 10 + i * 5,
    lat: b.lat,
    lng: b.lng,
  }));
}

function getRankProgress(reputation: number) {
  if (reputation < 10) {
    return {
      nextRank: "Colaborador",
      threshold: 10,
      progress: (reputation / 10) * 100,
      pointsNeeded: 10 - reputation,
    };
  } else if (reputation < 30) {
    return {
      nextRank: "Verificador",
      threshold: 30,
      progress: ((reputation - 10) / (30 - 10)) * 100,
      pointsNeeded: 30 - reputation,
    };
  } else if (reputation < 100) {
    return {
      nextRank: "Embajador",
      threshold: 100,
      progress: ((reputation - 30) / (100 - 30)) * 100,
      pointsNeeded: 100 - reputation,
    };
  } else {
    return {
      nextRank: "Máximo Rango",
      threshold: 100,
      progress: 100,
      pointsNeeded: 0,
    };
  }
}

type UserPublic = {
  id: string;
  alias: string;
  user_type: "CITIZEN" | "BUSINESS" | "ADMIN";
  rank: string;
  reputation_score: number;
  reports_verified_count: number;
  reports_unverified_count: number;
  reports_rejected_count: number;
  votes_cast_count: number;
};

type ReportItem = {
  id: string;
  title: string;
  description: string;
  type: "INSTANTANEO" | "OFICIAL";
  status: string;
  category: string;
  zone: string;
  time: string;
  author: string;
  authorRank: string;
  children: number;
  votes: { yes: number; no: number; unknown: number };
  lat: number;
  lng: number;
  apiBacked?: boolean;
  isWomensModeRelevant?: boolean;
};

type BusinessItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  label: string;
  zone: string;
  score: number;
  lat: number;
  lng: number;
  apiBacked?: boolean;
};

type GeocodeSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

async function geocodeNominatim(query: string, city: string = "Cartagena"): Promise<GeocodeSuggestion[]> {
  if (query.trim().length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", " + city + ", Colombia")}&format=json&limit=5`;
    const res = await fetch(url, { headers: { "Accept-Language": "es" } });
    return (await res.json()) as GeocodeSuggestion[];
  } catch {
    return [];
  }
}

function roleLabel(role: string) {
  if (role === "BUSINESS") return "Empresa";
  if (role === "ADMIN") return "Admin";
  return "Ciudadano";
}

function rankLabel(rank: string) {
  if (rank === "EMBAJADOR") return "Embajador";
  if (rank === "VERIFICADOR") return "Verificador";
  if (rank === "COLABORADOR") return "Colaborador";
  return "Ciudadano";
}

function statusLabel(status: string) {
  if (status === "VERIFICADO") return "Verificado";
  if (status === "COMUNITARIAMENTE_CONFIABLE") return "Confiable";
  if (status === "RECHAZADO") return "Rechazado";
  if (status === "OCULTO") return "Oculto";
  return "No verificado";
}

function mergeById<T extends { id: string }>(demo: T[], mapped: T[], extra: T[]) {
  const map = new Map<string, T>();
  [...demo, ...extra, ...mapped].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function mapApiReport(report: Record<string, unknown>): ReportItem {
  const date = report.occurred_at ? new Date(String(report.occurred_at)) : new Date();
  const timeStr = date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });

  return {
    id: String(report.id),
    title: String(report.title),
    description: String(report.description),
    type: String(report.report_type) === "OFICIAL" ? "OFICIAL" : "INSTANTANEO",
    status: String(report.status),
    category: String(report.incident_category),
    zone: String(report.neighborhood ?? "Cartagena"),
    time: timeStr,
    author: "Usuario",
    authorRank: "Ciudadano",
    children: Number(report.duplicate_group_count ?? 0),
    votes: {
      yes: Number(report.community_yes_count ?? 0),
      no: Number(report.community_no_count ?? 0),
      unknown: Number(report.community_unknown_count ?? 0),
    },
    lat: Number(report.lat),
    lng: Number(report.lng),
    apiBacked: true,
    isWomensModeRelevant: Boolean(report.is_womens_mode_relevant),
  };
}

function mapApiBusiness(business: Record<string, unknown>): BusinessItem {
  return {
    id: String(business.id),
    name: String(business.name),
    category: String(business.category),
    status: String(business.status),
    label: String(business.sponsor_label ?? "Sin campana"),
    zone: String(business.address_text ?? "Cartagena"),
    score: Number(business.reputation_score ?? 0),
    lat: Number(business.lat),
    lng: Number(business.lng),
    apiBacked: true,
  };
}

function getDefaultRouteCoords(cityKey: string, citiesObj: Record<string, CityConfig> = CITIES_CONFIG): { from: [number, number]; to: [number, number] } {
  const config = citiesObj[cityKey] || citiesObj["Cartagena"];
  let from: [number, number] = [config.center[0] - 0.01, config.center[1] - 0.01];
  let to: [number, number] = [config.center[0] + 0.01, config.center[1] + 0.01];
  if (config.demoBusinesses && config.demoBusinesses.length > 1) {
    from = [config.demoBusinesses[0].lng, config.demoBusinesses[0].lat];
    to = [config.demoBusinesses[1].lng, config.demoBusinesses[1].lat];
  } else if (config.seeds && config.seeds.length > 1) {
    from = [config.seeds[0].lng, config.seeds[0].lat];
    to = [config.seeds[1].lng, config.seeds[1].lat];
  }
  return { from, to };
}

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [dynamicCities, setDynamicCities] = useState<Record<string, CityConfig>>({});
  const cities = useMemo(() => ({ ...CITIES_CONFIG, ...dynamicCities }), [dynamicCities]);
  const [reports, setReports] = useState<ReportItem[]>(() => generateDemoReports("Cartagena"));
  const [businesses, setBusinesses] = useState<BusinessItem[]>(() => generateDemoBusinesses("Cartagena"));
  const [userVotes, setUserVotes] = useState<Record<string, "SI" | "NO" | "NO_SE">>({});
  const [voteHistory, setVoteHistory] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"map" | "business" | "admin">("map");
  const [activeRole, setActiveRole] = useState<"CITIZEN" | "BUSINESS" | "ADMIN">("CITIZEN");
  const [authMode, setAuthMode] = useState<"login" | "register" | "verify_email" | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const [sourceReportId, setSourceReportId] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editAlias, setEditAlias] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isSubmittingBusiness, setIsSubmittingBusiness] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isSubmittingSource, setIsSubmittingSource] = useState(false);
  const [reportSources, setReportSources] = useState<ReportSourceItem[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWomensModeConfirm, setShowWomensModeConfirm] = useState(false);
  const [showVoteForm, setShowVoteForm] = useState<{ id: string; type: "report" | "business"; vote: "SI" | "NO" | "NO_SE" } | null>(null);
  const [showReports, setShowReports] = useState(true);
  const [showBusinesses, setShowBusinesses] = useState(true);
  const [showRoute, setShowRoute] = useState(false);
  const [showWomensMode, setShowWomensMode] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [dateFilter, setDateFilter] = useState("24h");
  const [verificationFilter, setVerificationFilter] = useState("todos");
  const [routeFrom, setRouteFrom] = useState("");
  const [routeFromCoords, setRouteFromCoords] = useState<[number, number] | null>(null);
  const [routeTo, setRouteTo] = useState("");
  const [routeToCoords, setRouteToCoords] = useState<[number, number] | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentCity, setCurrentCity] = useState("Cartagena");
  const [reportZone, setReportZone] = useState("");
  const [reportSuggestions, setReportSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [selectedReportCoords, setSelectedReportCoords] = useState<{ lat: number; lng: number } | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleZoneChange(val: string) {
    setReportZone(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length < 3) {
      setReportSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await geocodeNominatim(val, currentCity);
        setReportSuggestions(suggestions);
      } catch {
        setReportSuggestions([]);
      }
    }, 400);
  }

  function handleSelectSuggestion(suggestion: GeocodeSuggestion) {
    const shortName = suggestion.display_name.split(",")[0];
    setReportZone(shortName);
    setSelectedReportCoords({
      lat: Number(suggestion.lat),
      lng: Number(suggestion.lon),
    });
    setReportSuggestions([]);
  }

  function handleCheckAlerts() {
    if (!userCoords) {
      setToast("Activa tu ubicación para detectar alertas cercanas.");
      return;
    }
    const userPoint = turf.point([userCoords.lng, userCoords.lat]);
    let count = 0;
    reports.forEach((report) => {
      const reportPoint = turf.point([report.lng, report.lat]);
      const distance = turf.distance(userPoint, reportPoint, { units: "kilometers" });
      if (distance <= 1.0) { // 1 km radius
        count++;
      }
    });

    if (count === 0) {
      setToast("No hay alertas nuevas cerca de tu ubicación actual (1 km).");
    } else if (count === 1) {
      setToast("Tienes 1 alerta nueva cerca de tu ubicación actual (1 km).");
    } else {
      setToast(`Tienes ${count} alertas nuevas cerca de tu ubicación (1 km).`);
    }
  }

  const [toast, setToastRaw] = useState("");
  const [toastKey, setToastKey] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [auditLog, setAuditLog] = useState<string[]>([
    "AdminRuta fusiono 2 reportes de Centro",
    "Moderacion oculto un reporte con datos personales",
    "Farmacia Manga paso a APROBADO",
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setToast = useCallback((msg: string) => {
    setToastRaw(msg);
    setToastKey((k) => k + 1);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastRaw(""), 5000);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("rs_dark_mode");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("rs_dark_mode", String(darkMode));
  }, [darkMode]);

  // Los reportes demo (semillas de ejemplo) solo se muestran como respaldo
  // ilustrativo cuando todavia no hay datos reales del backend para esta
  // ciudad, para no mezclar incidentes falsos con reportes reales.
  const hasRealReports = useMemo(() => reports.some((report) => report.apiBacked), [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (hasRealReports && !report.apiBacked) return false;
      if (showWomensMode && !report.isWomensModeRelevant) return false;
      const categoryOk = categoryFilter === "todas" || report.category.toLowerCase().includes(categoryFilter);
      const verificationOk =
        verificationFilter === "todos" ||
        (verificationFilter === "verificado" && report.status === "VERIFICADO") ||
        (verificationFilter === "comunidad" && report.status === "COMUNITARIAMENTE_CONFIABLE") ||
        (verificationFilter === "no-verificado" && report.status === "NO_VERIFICADO");
      
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        report.title.toLowerCase().includes(query) || 
        report.description.toLowerCase().includes(query) || 
        report.category.toLowerCase().includes(query) || 
        report.zone.toLowerCase().includes(query);

      return categoryOk && verificationOk && matchesSearch;
    });
  }, [reports, hasRealReports, categoryFilter, verificationFilter, showWomensMode, searchQuery]);

  // Mismo criterio para negocios: ocultar los de ejemplo apenas exista al
  // menos uno real proveniente de la API.
  const visibleBusinesses = useMemo(() => {
    const hasRealBusinesses = businesses.some((business) => business.apiBacked);
    return hasRealBusinesses ? businesses.filter((business) => business.apiBacked) : businesses;
  }, [businesses]);

  const profile = user
    ? {
        alias: user.alias,
        role: roleLabel(user.user_type),
        rank: rankLabel(user.rank),
        reputation: user.reputation_score,
        verified: user.reports_verified_count,
        unverified: user.reports_unverified_count,
        rejected: user.reports_rejected_count,
        votes: user.votes_cast_count ?? 0,
      }
    : {
        alias: "Invitado",
        role: "Sin sesion",
        rank: "Ciudadano",
        reputation: 0,
        verified: 0,
        unverified: 0,
        rejected: 0,
        votes: 0,
      };
  const isAdmin = user?.user_type === "ADMIN";

  async function api<T>(path: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    try {
      const headers = new Headers(options.headers);
      headers.set("Content-Type", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      const body = response.status === 204 ? null : await response.json().catch(() => null);
      if (!response.ok) {
        let errorMsg = "La API rechazo la operacion.";
        if (body?.detail) {
          if (Array.isArray(body.detail)) {
            errorMsg = body.detail
              .map((d: any) => {
                const msg = d.msg || "";
                return msg.startsWith("Value error, ") ? msg.substring(13) : msg;
              })
              .join(", ");
          } else {
            errorMsg = String(body.detail);
          }
        }
        throw new Error(errorMsg);
      }
      return body as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function loadReports(cityKey: string = currentCity) {
    try {
      const apiReports = await api<Array<Record<string, unknown>>>(`/api/v1/reports?city=${encodeURIComponent(cityKey)}&limit=100`);
      const mapped = apiReports.map(mapApiReport);
      setReports((current) => mergeById(generateDemoReports(cityKey), mapped, current.filter((item) => item.apiBacked)));
    } catch {
      // API no disponible (CORS, timeout, servidor caído) — usar datos demo silenciosamente
    }
  }

  async function loadBusinesses(cityKey: string = currentCity) {
    try {
      const apiBusinesses = await api<Array<Record<string, unknown>>>("/api/v1/businesses");
      const mapped = apiBusinesses.map(mapApiBusiness);
      const config = cities[cityKey] || cities["Cartagena"];
      const filteredMapped = mapped.filter(b => {
        const [[west, south], [east, north]] = config.bounds;
        return b.lng >= west && b.lng <= east && b.lat >= south && b.lat <= north;
      });
      setBusinesses((current) => mergeById(generateDemoBusinesses(cityKey, cities), filteredMapped, current.filter((item) => item.apiBacked)));
    } catch {
      // API no disponible (CORS, timeout, servidor caído) — usar datos demo silenciosamente
    }
  }

  function handleUserLocated(coords: { longitude: number; latitude: number }) {
    setUserCoords({ lat: coords.latitude, lng: coords.longitude });

    // Buscar si las coordenadas corresponden a alguna de las ciudades configuradas
    const matchedCityKey = Object.keys(cities).find((cityKey) => {
      const config = cities[cityKey];
      const [[west, south], [east, north]] = config.bounds;
      return coords.longitude >= west && coords.longitude <= east && coords.latitude >= south && coords.latitude <= north;
    });

    if (matchedCityKey) {
      if (matchedCityKey !== currentCity) {
        void handleCityChange(matchedCityKey);
        setToast(`Ubicación detectada: Cambiando a la vista de ${matchedCityKey}.`);
      }
    } else {
      // Intentar geocodificar reversa mediante Nominatim para detectar si es otra ciudad principal
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=es`)
        .then((res) => res.json())
        .then((data) => {
          const cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.state;
          if (cityName) {
            const matched = Object.keys(cities).find(
              c => c.toLowerCase() === cityName.toLowerCase() || cityName.toLowerCase().includes(c.toLowerCase())
            );
            if (matched) {
              if (matched !== currentCity) {
                void handleCityChange(matched);
                setToast(`Ciudad detectada: Cambiando a ${matched}.`);
              }
            } else {
              // Generar un entorno dinámico para esta nueva ciudad/entorno
              const newCityKey = cityName;
              const newCityConfig: CityConfig = {
                name: newCityKey,
                country: data.address?.country || "Desconocido",
                center: [coords.longitude, coords.latitude],
                bounds: [
                  [coords.longitude - 0.15, coords.latitude - 0.15],
                  [coords.longitude + 0.15, coords.latitude + 0.15],
                ],
                seeds: [],
                demoBusinesses: []
              };
              setDynamicCities(prev => ({ ...prev, [newCityKey]: newCityConfig }));
              setToast(`¡Nueva ubicación detectada! Entorno generado para ${newCityKey}.`);
              setTimeout(() => {
                void handleCityChange(newCityKey);
              }, 100);
            }
          }
        })
        .catch(() => {
          /* ignore */
        });
    }
  }

  async function handleCityChange(newCity: string) {
    setCurrentCity(newCity);
    setRouteFrom("");
    setRouteFromCoords(null);
    setRouteTo("");
    setRouteToCoords(null);

    if (showRoute) {
      const defaults = getDefaultRouteCoords(newCity, cities);
      void fetchRoute(defaults.from, defaults.to);
    } else {
      setRouteCoordinates([]);
    }

    const newDemoReports = generateDemoReports(newCity, cities);
    const newDemoBusinesses = generateDemoBusinesses(newCity, cities);
    setReports(newDemoReports);
    setBusinesses(newDemoBusinesses);

    try {
      const apiReports = await api<Array<Record<string, unknown>>>(`/api/v1/reports?city=${encodeURIComponent(newCity)}&limit=100`);
      const mapped = apiReports.map(mapApiReport);
      setReports((current) => mergeById(newDemoReports, mapped, current.filter((item) => item.apiBacked)));
    } catch {
      // ignore
    }

    try {
      const apiBusinesses = await api<Array<Record<string, unknown>>>("/api/v1/businesses");
      const mapped = apiBusinesses.map(mapApiBusiness);
      const config = cities[newCity] || cities["Cartagena"];
      const filteredMapped = mapped.filter(b => {
        const [[west, south], [east, north]] = config.bounds;
        return b.lng >= west && b.lng <= east && b.lat >= south && b.lat <= north;
      });
      setBusinesses((current) => mergeById(newDemoBusinesses, filteredMapped, current.filter((item) => item.apiBacked)));
    } catch {
      // ignore
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      alias: String(form.get("alias") ?? "UsuarioRuta"),
      password: String(form.get("password") ?? ""),
      user_type: activeRole,
    };
    setIsSubmittingAuth(true);
    try {
      if (authMode === "login") {
        const response = await api<{ access_token: string; user: UserPublic }>(
          `/api/v1/auth/login`,
          {
            method: "POST",
            body: JSON.stringify({ email: payload.email, password: payload.password }),
          },
        );
        setToken(response.access_token);
        setUser(response.user);
        localStorage.setItem("rs_token", response.access_token);
        localStorage.setItem("rs_user", JSON.stringify(response.user));
        setAuthMode(null);
        setToast(`Sesión iniciada: ${response.user.alias}`);
      } else {
        const response = await api<{ status: string; email: string }>(
          `/api/v1/auth/register`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        if (response.status === "verification_required") {
          setVerificationEmail(response.email);
          setAuthMode("verify_email");
          setToast("Se ha enviado un código de verificación a tu correo.");
        }
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo autenticar.");
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "");
    setIsSubmittingAuth(true);
    try {
      const response = await api<{ access_token: string; user: UserPublic }>(
        `/api/v1/auth/verify`,
        {
          method: "POST",
          body: JSON.stringify({ email: verificationEmail, code }),
        },
      );
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem("rs_token", response.access_token);
      localStorage.setItem("rs_user", JSON.stringify(response.user));
      setAuthMode(null);
      setToast(`Cuenta verificada y sesión iniciada: ${response.user.alias}`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Código inválido o expirado.");
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleResendCode() {
    try {
      await api<{ status: string; email: string }>(
        `/api/v1/auth/resend-code`,
        {
          method: "POST",
          body: JSON.stringify({ email: verificationEmail }),
        },
      );
      setToast("Nuevo código de verificación enviado.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo reenviar el código.");
    }
  }


  function handleLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("rs_token");
    localStorage.removeItem("rs_user");
    setToast("Sesion cerrada correctamente.");
    setShowAccountModal(false);
    setActiveTab("map");
  }

  async function handleUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setIsSavingProfile(true);
    const payload: { alias: string; password?: string } = { alias: editAlias };
    if (editPassword.trim() !== "") {
      if (editPassword.length < 8) {
        setToast("La contraseña debe tener al menos 8 caracteres.");
        setIsSavingProfile(false);
        return;
      }
      payload.password = editPassword;
    }
    try {
      const updatedUser = await api<UserPublic>(`/api/v1/users/me`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setUser(updatedUser);
      localStorage.setItem("rs_user", JSON.stringify(updatedUser));
      setToast("Perfil actualizado correctamente.");
      setIsEditingProfile(false);
      setEditPassword("");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Error al actualizar perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function createReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setAuthMode("register");
      setToast("Primero crea una cuenta o inicia sesion para reportar.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const zoneName = reportZone.trim();
    if (!zoneName) {
      setToast("Por favor, ingresa una zona o barrio.");
      return;
    }

    let lat = selectedReportCoords?.lat;
    let lng = selectedReportCoords?.lng;

    // Si el usuario no seleccionó de la lista, intentar geocodificar el texto libre
    if (!lat || !lng) {
      try {
        const suggestions = await geocodeNominatim(zoneName, currentCity);
        if (suggestions && suggestions.length > 0) {
          lat = Number(suggestions[0].lat);
          lng = Number(suggestions[0].lon);
        } else {
          setToast("No se pudo encontrar la ubicación de esa zona. Por favor, selecciona un barrio de la lista de sugerencias.");
          return;
        }
      } catch (err) {
        setToast("Error al geocodificar la zona. Por favor, selecciona una sugerencia.");
        return;
      }
    }

    // Validar límites de la ciudad piloto activa (para evitar registrar fuera de la zona piloto o en el agua)
    const config = cities[currentCity] || cities["Cartagena"];
    const [[west, south], [east, north]] = config.bounds;

    if (lat < south || lat > north || lng < west || lng > east) {
      setToast(`La ubicación seleccionada está fuera de la zona piloto de ${currentCity} o en el agua. Por favor, elige un barrio válido.`);
      return;
    }

    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      incident_category: String(form.get("category") ?? "Hurto"),
      occurred_at: new Date().toISOString(),
      lat,
      lng,
      city: currentCity,
      neighborhood: zoneName,
      is_womens_mode_relevant: form.get("is_womens_mode_relevant") === "on",
    };

    setIsSubmittingReport(true);
    try {
      const report = await api<Record<string, unknown>>("/api/v1/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setReports((current) => [mapApiReport(report), ...current]);
      event.currentTarget.reset();
      setReportZone("");
      setSelectedReportCoords(null);
      setReportSuggestions([]);
      setShowReportForm(false);
      setToast("Reporte creado y guardado en SQLite.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo crear el reporte.");
    } finally {
      setIsSubmittingReport(false);
    }
  }

  async function loadReportSources(reportId: string) {
    if (reportId.startsWith("demo-")) {
      setReportSources([]);
      return;
    }
    setLoadingSources(true);
    try {
      const sources = await api<ReportSourceItem[]>(`/api/v1/reports/${reportId}/sources`);
      setReportSources(sources);
    } catch {
      setReportSources([]);
    } finally {
      setLoadingSources(false);
    }
  }

  function openReportDetail(reportId: string) {
    setSourceReportId(reportId);
    void loadReportSources(reportId);
  }

  async function submitSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceReportId) return;
    if (!token) {
      setAuthMode("register");
      setToast("Necesitas sesion para aportar una fuente.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const url = String(form.get("url") ?? "");
    setIsSubmittingSource(true);
    try {
      if (!sourceReportId.startsWith("demo-")) {
        await api(`/api/v1/reports/${sourceReportId}/sources`, {
          method: "POST",
          body: JSON.stringify({ url }),
        });
        await loadReportSources(sourceReportId);
      }
      event.currentTarget.reset();
      setToast("Fuente enviada. Queda en revision por un admin.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo enviar la fuente.");
    } finally {
      setIsSubmittingSource(false);
    }
  }

  async function acceptSource(sourceId: string) {
    if (!sourceReportId) return;
    try {
      await api(`/api/v1/admin/sources/${sourceId}/accept`, { method: "POST", body: JSON.stringify({}) });
      await loadReportSources(sourceReportId);
      const reportId = sourceReportId;
      setReports((current) =>
        current.map((report) =>
          report.id === reportId ? { ...report, status: "VERIFICADO", type: "OFICIAL" } : report,
        ),
      );
      setToast("Fuente aceptada. El reporte quedo verificado.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo aceptar la fuente.");
    }
  }

  async function rejectSource(sourceId: string, reason: string) {
    if (!sourceReportId) return;
    try {
      await api(`/api/v1/admin/sources/${sourceId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      await loadReportSources(sourceReportId);
      setToast("Fuente rechazada.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo rechazar la fuente.");
    }
  }

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setAuthMode("register");
      setToast("Necesitas sesion para registrar una empresa.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      category: String(form.get("category") ?? "Comercio"),
      description: String(form.get("description") ?? ""),
      address_text: String(form.get("zone") ?? "Cartagena"),
      lat: Number(form.get("lat") || 10.4252),
      lng: Number(form.get("lng") || -75.5487),
    };
    setIsSubmittingBusiness(true);
    try {
      const business = await api<Record<string, unknown>>("/api/v1/businesses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setBusinesses((current) => [mapApiBusiness(business), ...current]);
      setShowBusinessForm(false);
      setToast("Empresa registrada en SQLite.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo registrar la empresa.");
    } finally {
      setIsSubmittingBusiness(false);
    }
  }

  async function voteReport(reportId: string, vote: "SI" | "NO" | "NO_SE") {
    if (!token) return;
    const currentVote = userVotes[reportId];
    if (currentVote === vote) return;

    const changes = voteHistory[reportId] || 0;
    if (changes >= 2) {
      setShowVoteForm({ id: reportId, type: "report", vote });
      return;
    }

    const field = vote === "SI" ? "yes" : vote === "NO" ? "no" : "unknown";
    const oldField = currentVote === "SI" ? "yes" : currentVote === "NO" ? "no" : currentVote === "NO_SE" ? "unknown" : null;

    if (!reportId.startsWith("demo-")) {
      try {
        const summary = await api<{ yes: number; no: number; unknown: number; score: string }>(
          `/api/v1/reports/${reportId}/votes`,
          { method: "POST", body: JSON.stringify({ vote_value: vote }) },
        );
        setReports((curr) => curr.map((r) => r.id === reportId ? { ...r, votes: { yes: summary.yes, no: summary.no, unknown: summary.unknown } } : r));
      } catch {
        setToast("Error al sincronizar voto.");
      }
    } else {
      setReports((curr) => curr.map((r) => {
        if (r.id !== reportId) return r;
        const newVotes = { ...r.votes, [field]: r.votes[field] + 1 };
        if (oldField) newVotes[oldField] = Math.max(0, newVotes[oldField] - 1);
        return { ...r, votes: newVotes };
      }));
    }

    const newVotes = { ...userVotes, [reportId]: vote };
    const newHistory = { ...voteHistory, [reportId]: changes + 1 };
    setUserVotes(newVotes);
    setVoteHistory(newHistory);
    localStorage.setItem("rs_user_votes", JSON.stringify(newVotes));
    localStorage.setItem("rs_vote_history", JSON.stringify(newHistory));
    
    if (changes === 1) setToast("Voto cambiado. Ultimo cambio permitido antes de revision.");
    else setToast("Voto registrado.");
  }

  async function voteBusiness(businessId: string, vote: "SI" | "NO" | "NO_SE") {
    if (!token) return;
    const currentVote = userVotes[businessId];
    if (currentVote === vote) return;

    const changes = voteHistory[businessId] || 0;
    if (changes >= 2) {
      setShowVoteForm({ id: businessId, type: "business", vote });
      return;
    }

    if (!businessId.startsWith("demo-")) {
      try {
        const business = await api<Record<string, unknown>>(`/api/v1/businesses/${businessId}/votes`, {
          method: "POST",
          body: JSON.stringify({ vote_value: vote }),
        });
        setBusinesses((current) => current.map((item) => (item.id === businessId ? mapApiBusiness(business) : item)));
      } catch {
        setToast("Error al votar empresa.");
      }
    } else {
      setBusinesses((current) =>
        current.map((b) => {
          if (b.id !== businessId) return b;
          let diff = 0;
          if (vote === "SI") diff = 1;
          else if (vote === "NO") diff = -1;
          if (currentVote === "SI") diff -= 1;
          else if (currentVote === "NO") diff += 1;
          return { ...b, score: b.score + diff };
        }),
      );
    }

    const newVotes = { ...userVotes, [businessId]: vote };
    const newHistory = { ...voteHistory, [businessId]: changes + 1 };
    setUserVotes(newVotes);
    setVoteHistory(newHistory);
    localStorage.setItem("rs_user_votes", JSON.stringify(newVotes));
    localStorage.setItem("rs_vote_history", JSON.stringify(newHistory));

    if (changes === 1) setToast("Voto cambiado. Ultimo cambio permitido antes de revision.");
    else setToast("Voto de empresa registrado.");
  }

  async function startCampaign(businessId: string) {
    if (!businessId.startsWith("demo-") && token) {
      try {
        const business = await api<Record<string, unknown>>(`/api/v1/businesses/${businessId}/campaign`, {
          method: "POST",
          body: JSON.stringify({ sponsor_label: "Punto seguro patrocinado" }),
        });
        setBusinesses((current) => current.map((item) => (item.id === businessId ? mapApiBusiness(business) : item)));
        setToast("Campana creada. Stripe real queda pendiente.");
        return;
      } catch (error) {
        setToast(error instanceof Error ? error.message : "No se pudo crear campana.");
        return;
      }
    }
    setBusinesses((current) =>
      current.map((business) =>
        business.id === businessId
          ? { ...business, status: "PENDIENTE_VERIFICACION", label: "Campana pendiente de pago/verificacion" }
          : business,
      ),
    );
    setToast("Campana simulada. Stripe real queda pendiente.");
  }

  async function fetchRoute(fromLngLat: [number, number], toLngLat: [number, number]) {
    const ORS_TOKEN = process.env.NEXT_PUBLIC_ORS_TOKEN || "";
    if (ORS_TOKEN) {
      try {
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_TOKEN}&start=${fromLngLat.join(",")}&end=${toLngLat.join(",")}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.features?.[0]?.geometry?.coordinates) {
          setRouteCoordinates(data.features[0].geometry.coordinates);
          return;
        }
      } catch {
        console.warn("ORS fallo, usando OSRM.");
      }
    }
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLngLat.join(",")};${toLngLat.join(",")}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      const d = await res.json();
      if (d.code === "Ok") setRouteCoordinates(d.routes[0].geometry.coordinates);
    } catch {
      setToast("No se pudo trazar la ruta con ninguno de los servicios.");
    }
  }

  function toggleRoute() {
    const nextState = !showRoute;
    setShowRoute(nextState);
    if (nextState) {
      const defaults = getDefaultRouteCoords(currentCity);
      const from: [number, number] = routeFromCoords ?? defaults.from;
      const to: [number, number] = routeToCoords ?? defaults.to;
      void fetchRoute(from, to);
      setToast("Ruta Segura: Calculando trayecto optimo por calles reales.");
    } else {
      setRouteCoordinates([]);
      setShowWomensMode(false);
      setToast("Mapa estandar: Ruta desactivada.");
    }
  }

  function toggleWomensMode() {
    if (showWomensMode) {
      setShowWomensMode(false);
      setCategoryFilter("todas");
      setToast("Modo estandar: Manteniendo ruta pero con todos los incidentes.");
      return;
    }
    setShowWomensModeConfirm(true);
  }

  async function confirmWomensMode() {
    setShowWomensModeConfirm(false);
    if (token && user) {
      try {
        const updatedUser = await api<UserPublic>(`/api/v1/users/me`, {
          method: "PATCH",
          body: JSON.stringify({ alias: user.alias }),
        });
        setUser(updatedUser);
        localStorage.setItem("rs_user", JSON.stringify(updatedUser));
      } catch {
        /* ignore */
      }
    }

    if (!showRoute) {
      setShowRoute(true);
      const defaults = getDefaultRouteCoords(currentCity);
      void fetchRoute(defaults.from, defaults.to);
    }
    setShowWomensMode(true);
    setCategoryFilter("todas");
    setToast("MODO MUJERES ACTIVO: Filtrando puntos relevantes para mujeres en tu ruta.");
  }

  function adminAction(action: "merge" | "hide" | "approve" | "fake") {
    if (!isAdmin) {
      setToast("El panel admin requiere una cuenta con rol admin.");
      return;
    }
    if (action === "merge") {
      setReports((current) => current.map((report, index) => (index === 0 ? { ...report, children: report.children + 1 } : report)));
      pushAudit("Se marco un reporte como duplicado.");
    }
    if (action === "hide") {
      setReports((current) => current.map((report, index) => (index === 0 ? { ...report, status: "OCULTO" } : report)));
      pushAudit("Se oculto el reporte mas reciente.");
    }
    if (action === "approve") {
      setBusinesses((current) =>
        current.map((business, index) =>
          index === 0 ? { ...business, status: "APROBADO", label: "Punto seguro patrocinado" } : business,
        ),
      );
      pushAudit("Se aprobo la primera empresa pendiente.");
    }
    if (action === "fake") {
      setReports((current) => current.map((report, index) => (index === 0 ? { ...report, status: "RECHAZADO" } : report)));
      pushAudit("Se descarto un reporte como bulo.");
    }
  }

  function pushAudit(message: string) {
    setAuditLog((current) => [message, ...current]);
    setToast(message);
  }

  function submitVoteRequest(reason: string) {
    if (!showVoteForm) return;
    pushAudit(`Solicitud de cambio de voto (${showVoteForm.type}): ${reason}`);
    setToast("Solicitud enviada al administrador.");
    setShowVoteForm(null);
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("rs_token");
    if (storedToken) setToken(storedToken);

    const storedUser = localStorage.getItem("rs_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        /* ignore */
      }
    }

    const storedVotes = localStorage.getItem("rs_user_votes");
    if (storedVotes) {
      try {
        setUserVotes(JSON.parse(storedVotes));
      } catch {
        /* ignore */
      }
    }

    const storedHistory = localStorage.getItem("rs_vote_history");
    if (storedHistory) {
      try {
        setVoteHistory(JSON.parse(storedHistory));
      } catch {
        /* ignore */
      }
    }

    void loadReports();
    void loadBusinesses();

    // Auto-locate user on startup
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`)
          .then((res) => res.json())
          .then((data) => {
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state;
            if (city) {
              const matchedCity = Object.keys(cities).find(
                c => c.toLowerCase() === city.toLowerCase() || city.toLowerCase().includes(c.toLowerCase())
              );
              if (matchedCity) {
                handleCityChange(matchedCity);
                setToast(`Ubicación detectada: Cambiando a ${matchedCity}.`);
              } else {
                const newCityConfig: CityConfig = {
                  name: city,
                  country: data.address?.country || "Desconocido",
                  center: [longitude, latitude],
                  bounds: [
                    [longitude - 0.15, latitude - 0.15],
                    [longitude + 0.15, latitude + 0.15],
                  ],
                  seeds: [],
                  demoBusinesses: []
                };
                setDynamicCities(prev => ({ ...prev, [city]: newCityConfig }));
                setToast(`¡Nueva ubicación detectada! Entorno generado para ${city}.`);
                setTimeout(() => {
                  void handleCityChange(city);
                }, 100);
              }
            }
          })
          .catch(() => {
            /* ignore fallback to Cartagena */
          });
      }, () => {
        console.log("Geolocation permission denied or error.");
      });
    }
  }, []);

  return (
    <div className="flex h-screen bg-background text-on-background font-body overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-on-background/40 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-primary text-on-primary flex flex-col z-30 transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-on-primary/10">
          <div className="flex items-center">
            <BrandLogo size={42} />
            <span className="ml-3 font-headline font-bold text-xl tracking-tight">RutaSegura</span>
          </div>
          <button className="md:hidden text-on-primary/60 hover:text-on-primary" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <SidebarNavItem 
            icon={<MapPin size={20} />} 
            label="Mapa en Vivo" 
            active={activeTab === "map"} 
            onClick={() => { setActiveTab("map"); setSidebarOpen(false); }}
            badge={filteredReports.length > 0 ? filteredReports.length : undefined}
          />
          <SidebarNavItem 
            icon={<Store size={20} />} 
            label="Puntos Seguros" 
            active={activeTab === "business"} 
            onClick={() => { setActiveTab("business"); setSidebarOpen(false); }} 
          />
          {isAdmin && (
            <SidebarNavItem 
              icon={<ShieldCheck size={20} />} 
              label="Administración" 
              active={activeTab === "admin"} 
              onClick={() => { setActiveTab("admin"); setSidebarOpen(false); }} 
            />
          )}
          
          <div className="pt-8 pb-2 px-3 text-xs font-bold text-on-primary/40 uppercase tracking-widest">Herramientas</div>
          <SidebarNavItem 
            icon={<Navigation size={20} />} 
            label="Trazar Ruta" 
            onClick={toggleRoute}
            active={showRoute}
          />
          <SidebarNavItem 
            icon={<Heart size={20} />} 
            label="Modo Mujeres" 
            onClick={toggleWomensMode}
            active={showWomensMode}
            highlight={showWomensMode}
          />
          <SidebarNavItem 
            icon={<Layers size={20} />} 
            label="Capas de Mapa" 
            onClick={() => setToast("Capas: incidentes, puntos seguros e historico.")}
          />
        </nav>

        <div className="p-4 border-t border-on-primary/10">
          <div className="bg-primary/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile.alias}</p>
              <p className="text-xs text-on-primary/60 truncate">{profile.rank}</p>
            </div>
            <button onClick={() => { setShowAccountModal(true); setEditAlias(user?.alias || ""); setEditPassword(""); setIsEditingProfile(false); }} className="text-on-primary/40 hover:text-on-primary transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="md:hidden text-on-surface p-1" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar incidentes o zonas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            {/* Selector de Ciudad */}
            <div className="relative flex items-center gap-1 bg-surface-container-low border border-outline-variant/50 rounded-full px-3 py-1.5 shadow-sm text-on-surface hover:border-primary/30 transition-all">
              <MapPin size={13} className="text-primary shrink-0" />
              <select 
                value={currentCity} 
                onChange={(e) => handleCityChange(e.target.value)} 
                className="bg-transparent border-none outline-none text-xs font-bold text-on-surface cursor-pointer pr-1 py-0.5 focus:ring-0 focus:outline-none"
              >
                {Object.keys(cities).map((city) => (
                  <option key={city} value={city} className="bg-surface font-semibold text-on-surface">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            {toast && (
              <div key={toastKey} className={`hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium animate-fadeInUp ${showWomensMode ? "bg-pink-100 text-pink-700 border border-pink-200" : "bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim"}`}>
                <BellRing size={14} />
                {toast}
              </div>
            )}
            
            <button className="p-1.5 sm:p-2 text-outline hover:text-primary transition-colors relative" onClick={handleCheckAlerts}>
              <Bell className="w-5 h-5 sm:w-[20px] sm:h-[20px]" />
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>
            
            <button className="p-1.5 sm:p-2 text-outline hover:text-primary transition-colors" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="w-5 h-5 sm:w-[20px] sm:h-[20px]" /> : <Moon className="w-5 h-5 sm:w-[20px] sm:h-[20px]" />}
            </button>

            <button 
              className="ml-1 sm:ml-2 flex items-center gap-1.5 sm:gap-2 bg-primary text-on-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              onClick={() => setShowReportForm(true)}
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Nuevo Reporte</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background custom-scrollbar">
          {/* Hero Grid: Stats & Map */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <StatCard icon={<Newspaper size={18} className="sm:w-5 sm:h-5" />} label="Alertas" value={filteredReports.length} color="bg-error/10 text-error" />
            <StatCard icon={<ShieldCheck size={18} className="sm:w-5 sm:h-5" />} label="Puntos" value={visibleBusinesses.length} color="bg-secondary/10 text-secondary" />
            <StatCard icon={<Users size={18} className="sm:w-5 sm:h-5" />} label="Reputación" value={profile.reputation} color="bg-primary/10 text-primary" />
            <StatCard icon={<Clock3 size={18} className="sm:w-5 sm:h-5" />} label="Ruta" value={showRoute ? "Activa" : "Desviada"} color="bg-on-tertiary-container/10 text-on-tertiary-container" />
            
            <div className="col-span-2 lg:col-span-4 bg-surface rounded-2xl border border-outline-variant/50 overflow-hidden h-[450px] sm:h-[550px] shadow-sm relative group">
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex gap-1.5 sm:gap-2">
                <button className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-md ${showReports ? "bg-primary text-on-primary" : "bg-surface text-on-surface border border-outline-variant"}`} onClick={() => setShowReports(!showReports)}>
                  <SlidersHorizontal size={12} className="sm:w-3.5 sm:h-3.5" /> Incidentes
                </button>
                <button className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-md ${showBusinesses ? "bg-primary text-on-primary" : "bg-surface text-on-surface border border-outline-variant"}`} onClick={() => setShowBusinesses(!showBusinesses)}>
                  <Building2 size={12} className="sm:w-3.5 sm:h-3.5" /> Puntos Seguros
                </button>
              </div>
              <MapShell
                reports={filteredReports}
                businesses={visibleBusinesses}
                showReports={showReports}
                showBusinesses={showBusinesses}
                showRoute={showRoute}
                routeCoordinates={routeCoordinates}
                onSelectReport={(id) => openReportDetail(id)}
                center={cities[currentCity]?.center}
                bounds={cities[currentCity]?.bounds}
                onLocateUser={handleUserLocated}
              />
            </div>
          </div>

          {/* Admin Panel Controls */}
          {activeTab === "admin" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 animate-fadeInUp">
              {/* Admin Actions */}
              <div className="md:col-span-2 bg-surface p-6 rounded-2xl border border-outline-variant/50 shadow-sm">
                <h3 className="font-headline font-bold text-base text-on-surface mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" /> Acciones de Administración
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={() => adminAction("merge")}
                    className="flex items-center gap-3 p-3 bg-surface-container-low hover:bg-primary/5 hover:border-primary/30 border border-outline-variant/50 rounded-xl text-xs font-bold transition-all text-left text-on-surface cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <GitMerge size={16} />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">Fusionar Duplicados</p>
                      <p className="text-[10px] text-outline font-medium">Une reportes similares</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => adminAction("hide")}
                    className="flex items-center gap-3 p-3 bg-surface-container-low hover:bg-error/5 hover:border-error/30 border border-outline-variant/50 rounded-xl text-xs font-bold transition-all text-left text-on-surface cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0">
                      <EyeOff size={16} />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">Ocultar Reporte</p>
                      <p className="text-[10px] text-outline font-medium">Oculta el más reciente</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => adminAction("approve")}
                    className="flex items-center gap-3 p-3 bg-surface-container-low hover:bg-secondary/5 hover:border-secondary/30 border border-outline-variant/50 rounded-xl text-xs font-bold transition-all text-left text-on-surface cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <BadgeCheck size={16} />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">Aprobar Empresa</p>
                      <p className="text-[10px] text-outline font-medium">Verifica punto seguro</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => adminAction("fake")}
                    className="flex items-center gap-3 p-3 bg-surface-container-low hover:bg-error/5 hover:border-error/30 border border-outline-variant/50 rounded-xl text-xs font-bold transition-all text-left text-on-surface cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0">
                      <Flag size={16} />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">Descartar Bulo</p>
                      <p className="text-[10px] text-outline font-medium">Marca como no verídico</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Audit Log */}
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant/50 shadow-sm flex flex-col h-[200px] md:h-auto overflow-hidden">
                <h3 className="font-headline font-bold text-base text-on-surface mb-3 flex items-center gap-2 shrink-0">
                  <Users size={18} className="text-outline" /> Log de Auditoría
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {auditLog.map((log, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/20 text-[11px] font-medium leading-normal text-on-surface">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manifest Section */}
          <div className="bg-surface rounded-2xl border border-outline-variant/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline font-bold text-lg text-on-surface">
                  {activeTab === "map" ? "Manifiesto de Incidentes" : activeTab === "business" ? "Directorio de Puntos Seguros" : "Log de Auditoría"}
                </h2>
                <p className="text-xs text-outline">Listado completo basado en filtros actuales</p>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {activeTab === "business" && (
                  <button 
                    onClick={() => setShowBusinessForm(true)}
                    className="flex items-center gap-1.5 bg-secondary text-on-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-[0.98] mr-2"
                  >
                    <Plus size={14} />
                    <span>Registrar Establecimiento</span>
                  </button>
                )}
                <FilterSelect icon={<Filter size={14} />} value={categoryFilter} onChange={setCategoryFilter} options={["todas", "hurto", "acoso", "iluminacion"]} />
                <FilterSelect icon={<Clock3 size={14} />} value={dateFilter} onChange={setDateFilter} options={["24h", "7d", "30d"]} />
                <FilterSelect icon={<ShieldCheck size={14} />} value={verificationFilter} onChange={setVerificationFilter} options={["todos", "verificado", "comunidad", "no-verificado"]} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest text-outline font-medium">
                    <th className="px-6 py-3 border-b border-outline-variant/50">ID / Título</th>
                    <th className="px-6 py-3 border-b border-outline-variant/50">Categoría & Zona</th>
                    <th className="px-6 py-3 border-b border-outline-variant/50">Estado</th>
                    <th className="px-6 py-3 border-b border-outline-variant/50">Votos</th>
                    <th className="px-6 py-3 border-b border-outline-variant/50 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {(activeTab === "map" || activeTab === "admin") && filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-outline">
                        No hay reportes que coincidan con los filtros actuales.
                      </td>
                    </tr>
                  ) : activeTab === "business" && visibleBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-outline">
                        Todavía no hay puntos seguros registrados en esta ciudad.
                      </td>
                    </tr>
                  ) : null}
                  {activeTab === "map" || activeTab === "admin" ? filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-primary opacity-60 uppercase tracking-tighter">#{report.id.slice(-4)}</span>
                            {!report.apiBacked && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-outline/15 text-outline">Demo</span>
                            )}
                          </div>
                          <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{report.title}</span>
                          <span className="text-xs text-outline line-clamp-1">{report.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">{report.category}</span>
                          <span className="text-xs text-outline">{report.zone} · {report.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          report.status === "VERIFICADO" ? "bg-secondary/10 text-secondary" : 
                          report.status === "COMUNITARIAMENTE_CONFIABLE" ? "bg-primary/10 text-primary" : 
                          "bg-error/10 text-error"
                        }`}>
                          {statusLabel(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <VoteBadge icon={<Check size={10} />} value={report.votes.yes} active={userVotes[report.id] === "SI"} onClick={() => voteReport(report.id, "SI")} color="green" />
                          <VoteBadge icon={<X size={10} />} value={report.votes.no} active={userVotes[report.id] === "NO"} onClick={() => voteReport(report.id, "NO")} color="red" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openReportDetail(report.id)}
                          className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-outline"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : visibleBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4 font-bold text-on-surface">
                        <div className="flex items-center gap-1.5">
                          {business.name}
                          {!business.apiBacked && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-outline/15 text-outline">Demo</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-outline">{business.category} · {business.zone}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${business.status === "APROBADO" ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>
                          {business.status === "APROBADO" ? "Seguro" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-on-surface font-bold">Score: {business.score}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary font-bold text-xs hover:underline" onClick={() => startCampaign(business.id)}>Contratar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modals - Preserving functionality with new styles */}
      {authMode && (
        <AuthModal
          authMode={authMode}
          setAuthMode={setAuthMode}
          verificationEmail={verificationEmail}
          activeRole={activeRole}
          handleAuth={handleAuth}
          handleVerify={handleVerify}
          handleResendCode={handleResendCode}
          roleLabel={roleLabel}
          isSubmitting={isSubmittingAuth}
        />
      )}

      {showReportForm && (
        <ReportFormModal
          onClose={() => setShowReportForm(false)}
          createReport={createReport}
          reportZone={reportZone}
          handleZoneChange={handleZoneChange}
          reportSuggestions={reportSuggestions}
          handleSelectSuggestion={handleSelectSuggestion}
          isSubmitting={isSubmittingReport}
        />
      )}

      {showBusinessForm && (
        <BusinessFormModal
          onClose={() => setShowBusinessForm(false)}
          createBusiness={createBusiness}
          defaultLat={cities[currentCity]?.center[1]}
          defaultLng={cities[currentCity]?.center[0]}
          isSubmitting={isSubmittingBusiness}
        />
      )}

      {sourceReportId && (() => {
        const selectedReport = reports.find((r) => r.id === sourceReportId);
        if (!selectedReport) return null;
        return (
          <ReportSourcesModal
            report={selectedReport}
            sources={reportSources}
            loadingSources={loadingSources}
            isLoggedIn={!!token}
            isAdmin={isAdmin}
            isSubmitting={isSubmittingSource}
            onClose={() => { setSourceReportId(null); setReportSources([]); }}
            onSubmitSource={submitSource}
            onAcceptSource={acceptSource}
            onRejectSource={rejectSource}
          />
        );
      })()}

      {showAccountModal && (
        <NewModal title="Perfil de Usuario" onClose={() => setShowAccountModal(false)}>
          <div className="space-y-5">
            {/* User Header Card with subtle gradient */}
            <div className="relative overflow-hidden p-4 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-2xl border border-outline-variant/30 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-on-primary text-xl font-black shadow-lg">
                {profile.alias[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline font-extrabold text-base text-on-surface truncate">{profile.alias}</h3>
                <p className="text-[11px] text-outline font-semibold mb-1">{profile.role}</p>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[9px] font-black rounded-full uppercase tracking-wider">
                  <BadgeCheck size={9} />
                  {profile.rank}
                </div>
              </div>
            </div>

            {token ? (
              isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface/70 ml-1">Alias Público</label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={80}
                      value={editAlias}
                      onChange={(e) => setEditAlias(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface/70 ml-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      minLength={8}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Dejar en blanco para no cambiar"
                      className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-on-surface"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-lg shadow-primary/10 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-3 bg-surface border border-outline-variant text-on-surface rounded-xl font-bold text-xs transition-all active:scale-[0.98]"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Rank Progression */}
                  <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-outline">Rango: {profile.rank}</span>
                      <span className="text-primary font-black">
                        {getRankProgress(profile.reputation).nextRank !== "Máximo Rango" 
                          ? `Próximo: ${getRankProgress(profile.reputation).nextRank}` 
                          : "Nivel Máximo"}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/20">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${getRankProgress(profile.reputation).progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[9px] text-outline font-bold">
                      <span>{profile.reputation} pts</span>
                      {getRankProgress(profile.reputation).nextRank !== "Máximo Rango" ? (
                        <span>Faltan {getRankProgress(profile.reputation).pointsNeeded} pts para el siguiente rango</span>
                      ) : (
                        <span>¡Felicidades, eres Embajador!</span>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl">
                      <p className="text-[9px] font-extrabold text-outline uppercase tracking-wider">Puntos / Reputación</p>
                      <p className="text-sm font-headline font-black text-primary mt-0.5">{profile.reputation} pts</p>
                    </div>
                    <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl">
                      <p className="text-[9px] font-extrabold text-outline uppercase tracking-wider">Votos Emitidos</p>
                      <p className="text-sm font-headline font-black text-on-surface mt-0.5">{profile.votes} votos</p>
                    </div>
                    <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl col-span-2">
                      <p className="text-[9px] font-extrabold text-outline uppercase tracking-wider mb-2">Desglose de Reportes</p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-1.5">
                          <span className="block font-black text-secondary">{profile.verified}</span>
                          <span className="text-[8px] text-outline font-bold uppercase">Verificados</span>
                        </div>
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-1.5">
                          <span className="block font-black text-amber-600">{profile.unverified}</span>
                          <span className="text-[8px] text-outline font-bold uppercase">Pendientes</span>
                        </div>
                        <div className="bg-error/5 border border-error/20 rounded-lg p-1.5">
                          <span className="block font-black text-error">{profile.rejected}</span>
                          <span className="text-[8px] text-outline font-bold uppercase">Rechazados</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="flex-1 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl font-bold text-xs transition-all active:scale-[0.98] mt-2"
                    >
                      Editar Perfil
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="flex-1 py-2.5 bg-error/5 hover:bg-error/10 border border-error/20 text-error rounded-xl font-bold text-xs transition-all active:scale-[0.98] mt-2"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )
            ) : (
              <div className="space-y-3">
                <button onClick={() => { setAuthMode("login"); setShowAccountModal(false); }} className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold">Login</button>
                <button onClick={() => { setAuthMode("register"); setShowAccountModal(false); }} className="w-full bg-surface border border-outline-variant py-3 rounded-xl font-bold">Crear Cuenta</button>
              </div>
            )}
          </div>
        </NewModal>
      )}

      {showWomensModeConfirm && (
        <NewModal title="Confirmar Acceso Seguro" onClose={() => setShowWomensModeConfirm(false)}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse-pink">
              <Heart size={32} fill="currentColor" />
            </div>
            <p className="text-on-surface font-medium leading-relaxed">
              El <strong>Modo Mujeres</strong> prioriza zonas con mejor iluminación y reportes de seguridad femenina.
            </p>
            <p className="text-sm text-outline italic">¿Confirmas que este modo es adecuado para tu viaje?</p>
            <div className="pt-4 space-y-2">
              <button onClick={confirmWomensMode} className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 transition-all">Confirmar identidad</button>
              <button onClick={() => setShowWomensModeConfirm(false)} className="w-full py-3 text-outline font-bold">Cancelar</button>
            </div>
          </div>
        </NewModal>
      )}
      
      {showVoteForm && (
        <VoteForm 
          data={showVoteForm} 
          onSubmit={submitVoteRequest} 
          onClose={() => setShowVoteForm(null)} 
        />
      )}

      {/* Toast Overlay for Mobile */}
      {toast && (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[60] animate-fadeInUp">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border ${showWomensMode ? "bg-pink-500 text-white border-pink-400" : "bg-primary text-on-primary border-primary-container"}`}>
            <span className="text-sm font-bold truncate">{toast}</span>
            <button onClick={() => setToastRaw("")}><X size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components
function VoteForm({ data, onSubmit, onClose }: { data: { id: string; type: "report" | "business"; vote: "SI" | "NO" | "NO_SE" }; onSubmit: (reason: string) => void; onClose: () => void }) {
  return (
    <NewModal title="Solicitud de Cambio de Voto" onClose={onClose}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget).get("reason") as string); }}>
        <p className="text-sm text-outline leading-relaxed">Has superado el límite de cambios permitidos para este item. Por favor, explica el motivo para revisión del administrador.</p>
        <div className="space-y-1">
          <label className="text-sm font-bold text-on-surface/70 ml-1">Motivo del cambio</label>
          <textarea name="reason" placeholder="Explica por qué deseas cambiar tu voto nuevamente..." required minLength={10} className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all h-32" />
        </div>
        <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold">Enviar solicitud</button>
      </form>
    </NewModal>
  );
}

function SidebarNavItem({ icon, label, active, onClick, badge, highlight }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; badge?: number; highlight?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm group ${
        active 
          ? "bg-primary-container text-on-primary-container shadow-inner" 
          : highlight 
            ? "text-pink-300 hover:bg-pink-500/10"
            : "text-on-primary/60 hover:bg-on-primary/5 hover:text-on-primary"
      }`}
    >
      <span className={active ? "text-on-primary-container" : "text-on-primary/40 group-hover:text-on-primary"}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-surface p-3 rounded-xl border border-outline-variant/50 shadow-sm flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-outline uppercase tracking-wider truncate">{label}</p>
        <p className="text-lg font-headline font-extrabold text-on-surface truncate">{value}</p>
      </div>
    </div>
  );
}

function FilterSelect({ icon, value, onChange, options }: { icon: React.ReactNode; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/50 rounded-lg px-2 py-1">
      <span className="text-outline">{icon}</span>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="bg-transparent border-none outline-none text-xs font-bold text-on-surface py-0.5 pr-2"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
      </select>
    </div>
  );
}

function VoteBadge({ icon, value, active, onClick, color }: { icon: React.ReactNode; value: number; active: boolean; onClick: () => void; color: "green" | "red" }) {
  const colorClass = color === "green" ? "hover:bg-green-100 text-green-600" : "hover:bg-red-100 text-red-600";
  const activeClass = active ? (color === "green" ? "bg-green-100 ring-1 ring-green-600" : "bg-red-100 ring-1 ring-red-600") : "bg-surface-container-low";
  
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${colorClass} ${activeClass}`}>
      {icon}
      <span className="text-xs font-bold">{value}</span>
    </button>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 text-center">
      <p className="text-[10px] font-bold text-outline uppercase">{label}</p>
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function NewModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant animate-fadeInUp">
        <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low">
          <h2 className="font-headline font-extrabold text-on-surface">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-outline-variant/30 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
