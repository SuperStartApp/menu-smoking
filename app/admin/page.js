"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-10 text-center">
      <img src="https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg" alt="Logo" className="h-20 mb-8" />
      <h1 className="text-2xl font-black italic uppercase text-slate-800 mb-4">Benvenuto nel Menù Digitale Smo-King</h1>
      <p className="text-slate-500 mb-8">Inquadra il QR Code del tuo negozio per visualizzare i prodotti disponibili.</p>
      <div className="flex gap-4">
        <a href="/admin" className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic shadow-lg hover:bg-red-700 transition-all">
          Accedi Admin
        </a>
      </div>
    </div>
  );
}