"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center font-sans">
      {/* LOGO */}
      <img 
        src="https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg" 
        alt="Logo" 
        className="h-20 mb-12 object-contain" 
      />
      
      {/* TITOLO */}
      <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 mb-4 leading-tight">
        Benvenuto nel Menù <br/> Digitale <span className="text-red-600 font-black">Smo-King</span>
      </h1>
      
      <p className="text-slate-400 font-medium mb-12 max-w-xs mx-auto text-sm uppercase tracking-widest">
        Inquadra il QR Code del tuo negozio per visualizzare i prodotti disponibili.
      </p>

      {/* TASTO ADMIN BLINDATO */}
      <a 
        href="/admin" 
        className="bg-red-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase italic shadow-2xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all tracking-widest text-sm"
      >
        Accedi Admin
      </a>
      
      <div className="mt-20 opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Digital Experience</p>
      </div>
    </div>
  );
}