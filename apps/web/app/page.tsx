"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("./ui/Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#fbf9f8] flex flex-col items-center justify-center">
      <div className="font-headline font-extrabold text-2xl text-[#006d43] animate-pulse">
        Cargando RutaSegura...
      </div>
    </div>
  ),
});

export default function Home() {
  return <Dashboard />;
}
