"use client";

import React from "react";
import { X } from "lucide-react";

type NewModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function NewModal({ title, children, onClose }: NewModalProps) {
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
