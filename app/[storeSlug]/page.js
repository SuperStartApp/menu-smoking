"use client";
import React, { useEffect, useState, useMemo, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Phone, MapPin, Star, 
  Cookie, Leaf, Flame, Snowflake, Wind, Droplets, Sparkles, Beaker
} from 'lucide-react';

const CategoryIcon = ({ cat }) => {
  switch (cat) {
    case 'Cremoso': return <Cookie size={14} />;
    case 'Tabaccoso': return <Flame size={14} />;
    case 'Fruttato': return <Leaf size={14} />;
    case 'Ghiacciato': return <Snowflake size={14} />;
    case 'Tabaccoso e Cremoso': return <Droplets size={14} />;
    case 'Balsamici e Speziati': return <Sparkles size={14} />;
    default: return <Wind size={14} />;
  }
};

export default function MenuPage({ params }) {
  const resolvedParams = use(params); 
  const storeSlug = resolvedParams.storeSlug;

  const [store, setStore] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tutti i Gusti");
  const [activeBrand, setActiveBrand] = useState("Tutte le Marche");
  const [activeFormat, setActiveFormat] = useState("Tutti i Formati");

  useEffect(() => {
    async function loadData() {
      const { data: storeData } = await supabase.from('vape_stores').select('*').eq('slug', storeSlug).single();
      if (storeData) {
        setStore(storeData);
        const { data: invData } = await supabase.from('vape_inventory').select('vape_products (*)').eq('store_id', storeData.id).eq('is_active', true);
        if (invData) {
          const products = invData.map((item) => item.vape_products).filter((p) => p !== null);
          products.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
          setAllProducts(products);
        }
      }
      setLoading(false);
    }
    if (storeSlug) loadData();
  }, [storeSlug]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === "Tutti i Gusti" || p.category === activeCategory;
      const matchBrand = activeBrand === "Tutte le Marche" || p.brand === activeBrand;
      const matchFormat = activeFormat === "Tutti i Formati" || p.formato === activeFormat;
      return matchSearch && matchCat && matchBrand && matchFormat;
    });
  }, [searchTerm, activeCategory, activeBrand, activeFormat, allProducts]);

  const uniqueBrands = ["Tutte le Marche", ...new Set(allProducts.map(p => p.brand).filter(Boolean))];
  const uniqueFormats = ["Tutti i Formati", ...new Set(allProducts.map(p => p.formato).filter(Boolean))];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white font-black text-red-600 text-3xl italic uppercase animate-pulse">SMO-KING</div>;
  if (!store) return <div className="p-20 text-center font-bold font-sans">Negozio non trovato.</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
      
      {/* HEADER FISSO (STICKY) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex flex-col items-center shadow-sm">
        <img src={store.logo_url || "https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg"} alt="Logo" className="h-10 mb-1 object-contain" />
        <h1 className="text-xl font-black italic uppercase tracking-widest text-red-600 leading-none">{store.subtext}</h1>
      </header>

      {/* SPAZIATORE PER HEADER FISSO */}
      <div className="h-24"></div>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* RICERCA */}
        <div className="relative pt-2">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" placeholder="Cerca marca o aroma..." 
            className="w-full pl-14 pr-6 py-4 rounded-full shadow-lg border-none focus:ring-2 ring-red-500 outline-none text-md font-bold"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTRI (Gusti, Formati, Marche) */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
            {["Tutti i Gusti", "Cremoso", "Fruttato", "Ghiacciato", "Tabaccoso", "Tabaccoso e Cremoso", "Balsamici e Speziati"].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-black text-[10px] uppercase italic transition-all ${activeCategory === cat ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-gray-100'}`}>
                {cat !== "Tutti i Gusti" && <CategoryIcon cat={cat} />} {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
            {uniqueFormats.map(formato => (
              <button key={formato} onClick={() => setActiveFormat(formato)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl whitespace-nowrap font-black text-[9px] uppercase italic transition-all ${activeFormat === formato ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-gray-200'}`}>
                <Beaker size={10} /> {formato}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA PRODOTTI */}
        <div className="grid grid-cols-1 gap-4 pt-4">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-50 flex gap-4 items-start relative overflow-hidden">
              {p.prezzo && (
                <div className="absolute top-0 right-8 bg-red-600 text-white px-5 py-2 rounded-b-3xl font-black italic text-md">
                  €{parseFloat(p.prezzo).toFixed(2)}
                </div>
              )}
              <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border p-1">
                <img src={p.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-contain rounded-xl" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1 italic leading-none">{p.brand}</p>
                <h3 className="font-black text-slate-800 text-lg leading-tight mb-2 italic uppercase">{p.name}</h3>
                {p.description && <p className="text-[11px] text-slate-400 font-medium mb-3 line-clamp-2 leading-relaxed">{p.description}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-slate-500 border border-slate-100">
                    <CategoryIcon cat={p.category} /><span className="text-[8px] font-black uppercase tracking-widest">{p.category}</span>
                  </div>
                  {p.nicotina?.map(n => (
                    <span key={n} className="bg-white text-slate-800 px-2 py-1 rounded-lg text-[9px] font-black border shadow-sm">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER COMPLETO E WOW */}
      <footer className="bg-white border-t border-gray-100 mt-20 p-10 pb-24 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="flex flex-col items-center gap-2">
            <img src={store.logo_url || "https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg"} className="h-8 grayscale opacity-30 mb-2" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-red-600 leading-none">{store.subtext}</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">{store.address}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <a href={`tel:${store.phone}`} className="flex flex-col items-center p-6 border-2 border-gray-50 rounded-[2.5rem] bg-white shadow-sm active:bg-red-50 transition-colors">
              <Phone size={24} className="text-red-500 mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Chiama Ora</span>
            </a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || '')}`} target="_blank" className="flex flex-col items-center p-6 border-2 border-gray-50 rounded-[2.5rem] bg-white shadow-sm active:bg-red-50 transition-colors">
              <MapPin size={24} className="text-red-500 mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Mappa</span>
            </a>
          </div>

          {store.google_review_url && (
            <a href={store.google_review_url} target="_blank" className="flex items-center justify-center gap-4 bg-yellow-400 text-yellow-950 font-black p-6 rounded-[2.5rem] shadow-xl shadow-yellow-100 active:scale-95 transition-all text-xs uppercase tracking-widest italic">
              <Star size={20} fill="currentColor" /> RECENSISCI SU GOOGLE
            </a>
          )}
          
          <p className="text-[8px] text-slate-300 uppercase tracking-[0.5em] font-black italic pt-4">Powered by Smo-King Digital</p>
        </div>
      </footer>
    </div>
  );
}