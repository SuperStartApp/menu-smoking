export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center font-sans">
      <img src="https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg" alt="Logo" className="h-16 mb-8" />
      <h1 className="text-2xl font-black uppercase text-slate-800 mb-8">Menù Digitale <span className="text-red-600">Smo-King</span></h1>
      <a href="/admin" className="bg-red-600 text-white px-10 py-4 rounded-full font-black uppercase italic shadow-lg">Accedi Admin</a>
    </div>
  );
}