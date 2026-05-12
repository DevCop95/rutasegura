"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import MapShell from "./MapShell";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

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
  source: { status: string; label: string; media: string };
  votes: { yes: number; no: number; unknown: number };
  lat: number;
  lng: number;
  apiBacked?: boolean;
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

const demoReports: ReportItem[] = [
  {
    id: "demo-r1",
    title: "Hurto reportado cerca de parada",
    description: "Reporte inicial del piloto en Centro.",
    type: "INSTANTANEO",
    status: "NO_VERIFICADO",
    category: "Hurto",
    zone: "Centro",
    time: "Hace 18 min",
    author: "LuzNorte",
    authorRank: "Colaborador",
    children: 2,
    source: { status: "PENDIENTE", label: "en revision", media: "El Universal" },
    votes: { yes: 2, no: 0, unknown: 1 },
    lat: 10.4236,
    lng: -75.5478,
  },
  {
    id: "demo-r2",
    title: "Intento de atraco confirmado por medio local",
    description: "Verificado con una noticia local.",
    type: "OFICIAL",
    status: "VERIFICADO",
    category: "Alerta",
    zone: "Manga",
    time: "Ayer",
    author: "AdminRuta",
    authorRank: "Embajador",
    children: 0,
    source: { status: "ACEPTADO", label: "El Universal / 10 mayo 2026", media: "El Universal" },
    votes: { yes: 11, no: 1, unknown: 0 },
    lat: 10.4097,
    lng: -75.5338,
  },
  {
    id: "demo-r3",
    title: "Zona con poca iluminacion",
    description: "Tramo reportado por usuarios frecuentes.",
    type: "INSTANTANEO",
    status: "COMUNITARIAMENTE_CONFIABLE",
    category: "Iluminacion",
    zone: "Getsemani",
    time: "Hace 1 h",
    author: "PatioClaro",
    authorRank: "Verificador",
    children: 4,
    source: { status: "RECHAZADO", label: "fuente no coincide", media: "Blog anonimo" },
    votes: { yes: 7, no: 1, unknown: 0 },
    lat: 10.4211,
    lng: -75.5442,
  },
];

const demoBusinesses: BusinessItem[] = [
  {
    id: "demo-b1",
    name: "Cafeteria Baluarte",
    category: "Cafe",
    status: "PENDIENTE_VERIFICACION",
    label: "Campana pagada pendiente",
    zone: "Centro",
    score: 6,
    lat: 10.4252,
    lng: -75.5487,
  },
  {
    id: "demo-b2",
    name: "Farmacia Manga 24h",
    category: "Farmacia",
    status: "APROBADO",
    label: "Punto seguro patrocinado",
    zone: "Manga",
    score: 14,
    lat: 10.4109,
    lng: -75.5362,
  },
];

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("rs_token"),
  );
  const [user, setUser] = useState<UserPublic | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("rs_user");
    return stored ? (JSON.parse(stored) as UserPublic) : null;
  });
  const [reports, setReports] = useState<ReportItem[]>(demoReports);
  const [businesses, setBusinesses] = useState<BusinessItem[]>(demoBusinesses);
  const [activeTab, setActiveTab] = useState<"map" | "business" | "admin">("map");
  const [activeRole, setActiveRole] = useState<"CITIZEN" | "BUSINESS" | "ADMIN">("CITIZEN");
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [sourceReportId, setSourceReportId] = useState<string | null>(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showReports, setShowReports] = useState(true);
  const [showBusinesses, setShowBusinesses] = useState(true);
  const [showRoute, setShowRoute] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [dateFilter, setDateFilter] = useState("24h");
  const [verificationFilter, setVerificationFilter] = useState("todos");
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [toast, setToast] = useState("Listo para registrar usuarios y crear datos reales en SQLite.");
  const [auditLog, setAuditLog] = useState<string[]>([
    "AdminRuta fusiono 2 reportes de Centro",
    "Moderacion oculto un reporte con datos personales",
    "Farmacia Manga paso a APROBADO",
  ]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const categoryOk = categoryFilter === "todas" || report.category.toLowerCase().includes(categoryFilter);
      const verificationOk =
        verificationFilter === "todos" ||
        (verificationFilter === "verificado" && report.status === "VERIFICADO") ||
        (verificationFilter === "comunidad" && report.status === "COMUNITARIAMENTE_CONFIABLE") ||
        (verificationFilter === "no-verificado" && report.status === "NO_VERIFICADO");
      return categoryOk && verificationOk;
    });
  }, [reports, categoryFilter, verificationFilter]);

  const profile = user
    ? {
        alias: user.alias,
        role: roleLabel(user.user_type),
        rank: rankLabel(user.rank),
        reputation: user.reputation_score,
        verified: user.reports_verified_count,
        unverified: user.reports_unverified_count,
        rejected: user.reports_rejected_count,
      }
    : {
        alias: "Invitado",
        role: "Sin sesion",
        rank: "Ciudadano",
        reputation: 0,
        verified: 0,
        unverified: 0,
        rejected: 0,
      };
  const isAdmin = user?.user_type === "ADMIN";

  async function api<T>(path: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(body?.detail ?? "La API rechazo la operacion.");
    }
    return body as T;
  }

  async function loadReports() {
    try {
      const apiReports = await api<Array<Record<string, unknown>>>("/api/v1/reports?city=Cartagena&limit=100");
      const mapped = apiReports.map(mapApiReport);
      setReports((current) => mergeById(demoReports, mapped, current.filter((item) => item.apiBacked)));
    } catch {
      setToast("API no disponible para reportes; sigo con datos demo.");
    }
  }

  async function loadBusinesses() {
    try {
      const apiBusinesses = await api<Array<Record<string, unknown>>>("/api/v1/businesses");
      const mapped = apiBusinesses.map(mapApiBusiness);
      setBusinesses((current) => mergeById(demoBusinesses, mapped, current.filter((item) => item.apiBacked)));
    } catch {
      setToast("API no disponible para empresas; sigo con datos demo.");
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
    try {
      const response = await api<{ access_token: string; user: UserPublic }>(
        `/api/v1/auth/${authMode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          body: JSON.stringify(
            authMode === "login" ? { email: payload.email, password: payload.password } : payload,
          ),
        },
      );
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem("rs_token", response.access_token);
      localStorage.setItem("rs_user", JSON.stringify(response.user));
      setAuthMode(null);
      setToast(`${authMode === "login" ? "Sesion iniciada" : "Registro creado"}: ${response.user.alias}`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo autenticar.");
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
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      incident_category: String(form.get("category") ?? "Hurto"),
      occurred_at: new Date().toISOString(),
      lat: Number(form.get("lat") || 10.4236),
      lng: Number(form.get("lng") || -75.5478),
      city: "Cartagena",
      neighborhood: String(form.get("zone") ?? "Centro"),
    };
    try {
      const report = await api<Record<string, unknown>>("/api/v1/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setReports((current) => [mapApiReport(report), ...current]);
      event.currentTarget.reset();
      setToast("Reporte creado y guardado en SQLite.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo crear el reporte.");
    }
  }

  async function submitSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceReportId) return;
    if (!isAdmin) {
      setSourceReportId(null);
      setToast("Solo un usuario admin puede aportar o gestionar noticias.");
      return;
    }
    if (!token) {
      setAuthMode("register");
      setToast("Necesitas sesion para aportar una noticia.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const url = String(form.get("url") ?? "");
    try {
      if (!sourceReportId.startsWith("demo-")) {
        await api(`/api/v1/reports/${sourceReportId}/sources`, {
          method: "POST",
          body: JSON.stringify({ url }),
        });
      }
      setReports((current) =>
        current.map((report) =>
          report.id === sourceReportId
            ? { ...report, source: { status: "PENDIENTE", label: "en revision", media: hostFromUrl(url) } }
            : report,
        ),
      );
      setSourceReportId(null);
      setToast("Noticia enviada. Quedo en revision.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "No se pudo enviar la noticia.");
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
    }
  }

  async function voteReport(reportId: string, vote: "SI" | "NO" | "NO_SE") {
    const field = vote === "SI" ? "yes" : vote === "NO" ? "no" : "unknown";
    if (!reportId.startsWith("demo-") && token) {
      try {
        const summary = await api<{ yes: number; no: number; unknown: number; score: string }>(
          `/api/v1/reports/${reportId}/votes`,
          {
            method: "POST",
            body: JSON.stringify({ vote_value: vote }),
          },
        );
        setReports((current) =>
          current.map((report) =>
            report.id === reportId
              ? { ...report, votes: { yes: summary.yes, no: summary.no, unknown: summary.unknown } }
              : report,
          ),
        );
        setToast("Voto guardado en SQLite.");
        return;
      } catch (error) {
        setToast(error instanceof Error ? error.message : "No se pudo votar.");
        return;
      }
    }
    setReports((current) =>
      current.map((report) =>
        report.id === reportId ? { ...report, votes: { ...report.votes, [field]: report.votes[field] + 1 } } : report,
      ),
    );
    setToast("Voto aplicado localmente.");
  }

  async function voteBusiness(businessId: string, vote: "SI" | "NO" | "NO_SE") {
    if (!businessId.startsWith("demo-") && token) {
      try {
        const business = await api<Record<string, unknown>>(`/api/v1/businesses/${businessId}/votes`, {
          method: "POST",
          body: JSON.stringify({ vote_value: vote }),
        });
        setBusinesses((current) => current.map((item) => (item.id === businessId ? mapApiBusiness(business) : item)));
        setToast("Voto de empresa guardado.");
        return;
      } catch (error) {
        setToast(error instanceof Error ? error.message : "No se pudo votar la empresa.");
        return;
      }
    }
    setBusinesses((current) =>
      current.map((business) =>
        business.id === businessId
          ? { ...business, score: business.score + (vote === "SI" ? 1 : vote === "NO" ? -1 : 0) }
          : business,
      ),
    );
    setToast("Voto de empresa aplicado localmente.");
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

  function runRoute() {
    setShowRoute(true);
    setToast(`Ruta activa: ${routeFrom || "origen"} a ${routeTo || "destino"}.`);
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReports();
    void loadBusinesses();
    // Initial hydration only. Subsequent changes are handled by actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="appShell">
      <header className="topbar">
        <div className="brand" aria-label="RutaSegura">
          <BrandLogo size={38} />
          <div className="brandText">
            <strong>RutaSegura</strong>
            <span>Cartagena / MapLibre mapcn / SQLite</span>
          </div>
        </div>

        <nav className="topbarActions" aria-label="Navegacion principal">
          <button className={`navButton ${activeTab === "map" ? "active" : ""}`} type="button" onClick={() => setActiveTab("map")}>
            <MapPin size={17} />
            Mapa
          </button>
          <button className={`navButton ${activeTab === "business" ? "active" : ""}`} type="button" onClick={() => setActiveTab("business")}>
            <Store size={17} />
            Empresas
          </button>
          <button
            className={`navButton ${activeTab === "admin" ? "active" : ""}`}
            type="button"
            onClick={() => {
              if (!isAdmin) {
                setToast("El panel admin solo esta disponible para usuarios admin.");
                return;
              }
              setActiveTab("admin");
            }}
          >
            <ShieldCheck size={17} />
            Admin
          </button>
          <button className="iconButton" title="Notificaciones" aria-label="Notificaciones" onClick={() => setToast("Tienes 3 pendientes de validacion.")}>
            <Bell size={18} />
          </button>
          <button className="primaryButton" type="button" onClick={() => document.getElementById("title")?.focus()}>
            <Plus size={18} />
            Reportar
          </button>
        </nav>
      </header>

      <div className="toastBar" role="status">{toast}</div>

      <section className="mainGrid">
        <aside className="sidebar" aria-label="Cuenta, filtros y notificaciones">
          <section className="panelBlock">
            <h2 className="sectionTitle">Cuenta</h2>
            <div className="authGrid">
              <button className="secondaryButton" type="button" onClick={() => setAuthMode("login")}>
                <LogIn size={17} />
                Login
              </button>
              <button className="secondaryButton" type="button" onClick={() => setAuthMode("register")}>
                <UserPlus size={17} />
                Registro
              </button>
            </div>
            <div className="roleSwitch" aria-label="Rol de registro">
              {(["CITIZEN", "BUSINESS", "ADMIN"] as const).map((role) => (
                <button key={role} className={activeRole === role ? "active" : ""} type="button" onClick={() => setActiveRole(role)}>
                  {roleLabel(role)}
                </button>
              ))}
            </div>
          </section>

          <section className="profilePanel" aria-label="Perfil publico">
            <div className="avatar" aria-hidden="true">
              <User size={22} />
            </div>
            <div className="profileText">
              <strong>{profile.alias}</strong>
              <span>{profile.role}</span>
            </div>
            <span className={rankClass(profile.rank)}>{profile.rank}</span>
            <div className="profileStats">
              <div><strong>{profile.reputation}</strong><span>reputacion</span></div>
              <div><strong>{profile.verified}</strong><span>verificados</span></div>
              <div><strong>{profile.unverified}</strong><span>no verificados</span></div>
              <div><strong>{profile.rejected}</strong><span>rechazados</span></div>
            </div>
          </section>

          <section className="panelBlock">
            <h2 className="sectionTitle"><Plus size={15} /> Nuevo reporte</h2>
            <form className="fieldStack compact" onSubmit={createReport}>
              <div className="field">
                <label htmlFor="category">Categoria</label>
                <select id="category" name="category" defaultValue="Hurto">
                  <option>Hurto</option>
                  <option>Acoso</option>
                  <option>Iluminacion</option>
                  <option>Alerta</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="title">Titulo</label>
                <input id="title" name="title" placeholder="Ej. Hurto cerca de parada" required minLength={5} />
              </div>
              <div className="field">
                <label htmlFor="description">Descripcion</label>
                <textarea id="description" name="description" placeholder="Sin nombres, placas ni datos personales." required minLength={10} />
              </div>
              <div className="field">
                <label htmlFor="zone">Zona</label>
                <input id="zone" name="zone" placeholder="Centro, Manga, Getsemani" />
              </div>
              <div className="coordinateGrid">
                <input name="lat" aria-label="Latitud" defaultValue="10.4236" />
                <input name="lng" aria-label="Longitud" defaultValue="-75.5478" />
              </div>
              <button className="primaryButton fullButton" type="submit">Crear reporte</button>
            </form>
          </section>

          <section className="panelBlock">
            <h2 className="sectionTitle"><Filter size={15} /> Filtros</h2>
            <div className="fieldStack compact">
              <div className="field">
                <label htmlFor="categoryFilter">Categoria</label>
                <select id="categoryFilter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  <option value="todas">Todas</option>
                  <option value="hurto">Hurto</option>
                  <option value="acoso">Acoso</option>
                  <option value="iluminacion">Iluminacion</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="dateRange">Fecha</label>
                <select id="dateRange" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setToast(`Filtro de fecha: ${event.target.value}`); }}>
                  <option value="24h">Ultimas 24 h</option>
                  <option value="7d">7 dias</option>
                  <option value="30d">30 dias</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="verification">Verificacion</label>
                <select id="verification" value={verificationFilter} onChange={(event) => setVerificationFilter(event.target.value)}>
                  <option value="todos">Todos</option>
                  <option value="verificado">Oficial</option>
                  <option value="comunidad">Comunidad</option>
                  <option value="no-verificado">No verificado</option>
                </select>
              </div>
            </div>
          </section>

          <section className="panelBlock">
            <h2 className="sectionTitle"><Navigation size={15} /> Mi ruta</h2>
            <div className="fieldStack compact">
              <div className="field">
                <label htmlFor="from">Origen</label>
                <input id="from" value={routeFrom} onChange={(event) => setRouteFrom(event.target.value)} placeholder="Casa, colegio, trabajo" />
              </div>
              <div className="field">
                <label htmlFor="to">Destino</label>
                <input id="to" value={routeTo} onChange={(event) => setRouteTo(event.target.value)} placeholder="Destino frecuente" />
              </div>
              <div className="toggleRow">
                <button className={`toggleButton ${showRoute ? "active" : ""}`} type="button" onClick={runRoute}>
                  <Heart size={16} /> Modo mujeres
                </button>
                <button className="toggleButton" type="button" onClick={() => setToast("Capas: incidentes, puntos seguros e historico.")}>
                  <Layers size={16} /> Capas
                </button>
              </div>
            </div>
          </section>

          <section className="panelBlock">
            <h2 className="sectionTitle"><BellRing size={15} /> Pendientes</h2>
            <div className="notificationList">
              {["Valida una empresa cercana", "Aporta fuente para un reporte", "Revisa posible duplicado"].map((item) => (
                <button className="notificationItem" key={item} type="button" onClick={() => setToast(item)}>
                  {item}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="mapArea" aria-label="Mapa de reportes y puntos seguros">
          <div className="mapToolbar">
            <button className={`chip ${showReports ? "active" : ""}`} type="button" onClick={() => setShowReports((value) => !value)}>
              <SlidersHorizontal size={15} /> Incidentes
            </button>
            <button className={`chip ${showBusinesses ? "active" : ""}`} type="button" onClick={() => setShowBusinesses((value) => !value)}>
              <Building2 size={15} /> Puntos seguros
            </button>
            <button className={`chip ${showRoute ? "active" : ""}`} type="button" onClick={() => setShowRoute((value) => !value)}>
              <Clock3 size={15} /> Ruta
            </button>
          </div>
          <MapShell
            reports={filteredReports}
            businesses={businesses}
            showReports={showReports}
            showBusinesses={showBusinesses}
            showRoute={showRoute}
            onSelectReport={(id) => setToast(reports.find((report) => report.id === id)?.title ?? "Reporte seleccionado")}
          />
        </section>

        <aside className="detailPane" aria-label="Reportes, empresas y administracion">
          {(activeTab === "map" || activeTab === "admin") && (
            <section className="panelBlock">
              <h2 className="sectionTitle"><Newspaper size={15} /> Reportes</h2>
              <div className="reportList">
                {filteredReports.map((report) => (
                  <article className="reportItem" key={report.id}>
                    <div className="reportHeader">
                      <div>
                        <div className="tagRow">
                          <span className={`typeTag ${report.type === "OFICIAL" ? "official" : ""}`}>{report.type === "OFICIAL" ? "Oficial" : "Instantaneo"}</span>
                          <span className={statusClass(report.status)}>{statusLabel(report.status)}</span>
                        </div>
                        <h3>{report.title}</h3>
                        <div className="reportMeta">{report.category} / {report.zone} / {report.time}</div>
                      </div>
                    </div>
                    <p className="itemDescription">{report.description}</p>
                    <div className="authorRow">
                      <span>{report.author}</span>
                      <span className={rankClass(report.authorRank)}>{report.authorRank}</span>
                      {report.children > 0 ? <span className="subtle">+{report.children} duplicados</span> : null}
                    </div>
                    <div className="sourceRow">
                      <Link size={15} />
                      <span className={sourceClass(report.source.status)}>{report.source.label}</span>
                    </div>
                    <div className="voteRow" aria-label="Resumen de votos">
                      <button className="voteButton yes" type="button" title="Votos si" onClick={() => voteReport(report.id, "SI")}><Check size={16} /></button>
                      <span className="reportMeta">{report.votes.yes}</span>
                      <button className="voteButton no" type="button" title="Votos no" onClick={() => voteReport(report.id, "NO")}><X size={16} /></button>
                      <span className="reportMeta">{report.votes.no}</span>
                      <button className="voteButton unknown" type="button" title="No se" onClick={() => voteReport(report.id, "NO_SE")}><HelpCircle size={16} /></button>
                      <span className="reportMeta">{report.votes.unknown}</span>
                      {isAdmin ? (
                        <button className="linkButton" type="button" onClick={() => setSourceReportId(report.id)}>
                          <Newspaper size={16} /> Gestionar noticia
                        </button>
                      ) : (
                        <span className="adminOnlyNote">
                          <ShieldCheck size={15} /> Solo admin
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {(activeTab === "business" || activeTab === "admin") && (
            <section className="panelBlock">
              <h2 className="sectionTitle"><Store size={15} /> Empresas</h2>
              <button className="primaryButton fullButton" type="button" onClick={() => setShowBusinessForm(true)}>
                <Plus size={16} /> Registrar empresa
              </button>
              <div className="businessList withTopGap">
                {businesses.map((business) => (
                  <article className="businessItem" key={business.id}>
                    <div>
                      <h3>{business.name}</h3>
                      <div className="reportMeta">{business.category} / {business.zone} / score {business.score}</div>
                    </div>
                    <span className={business.status === "APROBADO" ? "status trusted" : "status pending"}>{business.status === "APROBADO" ? "Seguro" : "Pendiente"}</span>
                    <div className="sourceRow"><CreditCard size={15} /><span>{business.label}</span></div>
                    <div className="voteRow">
                      <button className="voteButton yes" type="button" title="Es seguro" onClick={() => voteBusiness(business.id, "SI")}><Check size={16} /></button>
                      <button className="voteButton no" type="button" title="No es seguro" onClick={() => voteBusiness(business.id, "NO")}><X size={16} /></button>
                      <button className="voteButton unknown" type="button" title="No se" onClick={() => voteBusiness(business.id, "NO_SE")}><HelpCircle size={16} /></button>
                      <button className="linkButton" type="button" onClick={() => startCampaign(business.id)}>
                        <CreditCard size={16} /> Contratar campana
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === "admin" && (
            <section className="panelBlock adminBlock">
              <h2 className="sectionTitle"><ShieldCheck size={15} /> Admin</h2>
              <div className="adminGrid">
                <button className="adminAction" type="button" onClick={() => adminAction("merge")}><GitMerge size={16} /> Fusionar duplicados</button>
                <button className="adminAction" type="button" onClick={() => adminAction("hide")}><EyeOff size={16} /> Ocultar reporte</button>
                <button className="adminAction" type="button" onClick={() => adminAction("approve")}><BadgeCheck size={16} /> Aprobar empresa</button>
                <button className="adminAction" type="button" onClick={() => adminAction("fake")}><Flag size={16} /> Descartar bulo</button>
              </div>
              <div className="auditList withTopGap">
                {auditLog.map((item) => (
                  <div className="auditItem" key={item}><Users size={14} />{item}</div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </section>

      {authMode ? (
        <Modal title={authMode === "login" ? "Login" : "Registro"} onClose={() => setAuthMode(null)}>
          <form className="fieldStack" onSubmit={handleAuth}>
            <div className="field"><label htmlFor="authEmail">Email</label><input id="authEmail" name="email" inputMode="email" required /></div>
            {authMode === "register" ? <div className="field"><label htmlFor="authAlias">Alias publico</label><input id="authAlias" name="alias" required minLength={3} /></div> : null}
            <div className="field"><label htmlFor="authPassword">Password</label><input id="authPassword" name="password" type="password" required minLength={8} /></div>
            <button className="primaryButton fullButton" type="submit">{authMode === "login" ? "Entrar" : `Crear ${roleLabel(activeRole).toLowerCase()}`}</button>
          </form>
        </Modal>
      ) : null}

      {sourceReportId ? (
        <Modal title="Aportar noticia" onClose={() => setSourceReportId(null)}>
          <form className="fieldStack" onSubmit={submitSource}>
            <div className="field"><label htmlFor="sourceUrl">URL del medio</label><input id="sourceUrl" name="url" inputMode="url" placeholder="https://medio.com/noticia" required /></div>
            <button className="primaryButton fullButton" type="submit">Enviar a revision</button>
          </form>
        </Modal>
      ) : null}

      {showBusinessForm ? (
        <Modal title="Registrar empresa" onClose={() => setShowBusinessForm(false)}>
          <form className="fieldStack" onSubmit={createBusiness}>
            <div className="field"><label htmlFor="businessName">Nombre</label><input id="businessName" name="name" required minLength={3} /></div>
            <div className="field"><label htmlFor="businessCategory">Categoria</label><input id="businessCategory" name="category" defaultValue="Comercio" required /></div>
            <div className="field"><label htmlFor="businessDescription">Descripcion</label><textarea id="businessDescription" name="description" /></div>
            <div className="field"><label htmlFor="businessZone">Zona</label><input id="businessZone" name="zone" defaultValue="Centro" /></div>
            <div className="coordinateGrid">
              <input name="lat" aria-label="Latitud empresa" defaultValue="10.4252" />
              <input name="lng" aria-label="Longitud empresa" defaultValue="-75.5487" />
            </div>
            <button className="primaryButton fullButton" type="submit">Guardar empresa</button>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modalScrim" role="presentation">
      <section className="modalPanel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modalHeader">
          <div className="modalTitle">
            <BrandLogo size={28} />
            <h2>{title}</h2>
          </div>
          <button className="iconButton" type="button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function mapApiReport(report: Record<string, unknown>): ReportItem {
  return {
    id: String(report.id),
    title: String(report.title),
    description: String(report.description),
    type: String(report.report_type) === "OFICIAL" ? "OFICIAL" : "INSTANTANEO",
    status: String(report.status),
    category: String(report.incident_category),
    zone: String(report.neighborhood ?? "Cartagena"),
    time: "SQLite",
    author: "Usuario",
    authorRank: "Ciudadano",
    children: Number(report.duplicate_group_count ?? 0),
    source: { status: "PENDIENTE", label: "sin fuente aceptada", media: "pendiente" },
    votes: {
      yes: Number(report.community_yes_count ?? 0),
      no: Number(report.community_no_count ?? 0),
      unknown: Number(report.community_unknown_count ?? 0),
    },
    lat: Number(report.lat),
    lng: Number(report.lng),
    apiBacked: true,
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

function mergeById<T extends { id: string }>(demo: T[], mapped: T[], extra: T[]) {
  const map = new Map<string, T>();
  [...demo, ...extra, ...mapped].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
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

function statusClass(status: string) {
  if (status === "VERIFICADO") return "status verified";
  if (status === "COMUNITARIAMENTE_CONFIABLE") return "status trusted";
  if (status === "RECHAZADO" || status === "OCULTO") return "status rejected";
  return "status unverified";
}

function rankClass(rank: string) {
  if (rank === "Embajador") return "rankPill rankAmbassador";
  if (rank === "Verificador") return "rankPill rankVerifier";
  if (rank === "Colaborador") return "rankPill rankContributor";
  return "rankPill";
}

function sourceClass(status: string) {
  if (status === "ACEPTADO") return "source accepted";
  if (status === "RECHAZADO") return "source rejected";
  return "source pending";
}

function hostFromUrl(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "fuente externa";
  }
}
