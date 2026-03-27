"use client";

export default function HomePage() {
  const goToAdmin = () => {
    window.location.href = "/admin"; // Metodo infallibile per cambiare pagina
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <img src="https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg" alt="Logo" className="h-20 mb-10" />
      <h1 className="text-3xl font-black italic uppercase text-slate-800 mb-2">Smo-King Digital</h1>
      <p className="text-slate-400 text-sm mb-12 uppercase tracking-widest">Menù Liquidi Professionale</p>
      
      <button 
        onClick={goToAdmin}
        className="bg-red-600 text-white px-12 py-5 rounded-full font-black uppercase italic shadow-xl shadow-red-200 active:scale-95 transition-all"
      >
        Accedi Admin
      </button>
    </div>
  );
}