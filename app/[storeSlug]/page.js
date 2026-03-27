"use client";
import React, { useEffect, useState, useMemo, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Phone, MapPin, Star, 
  Cookie, Leaf, Flame, Snowflake, Wind, Droplets, Sparkles, Beaker, Layers
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
  
  // STATI PER I FILTRI
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tutti i Gusti");
  const [activeBrand, setActiveBrand] = useState("Tutte le Marche");
  const [activeFormat, setActiveFormat] = useState("Tutti i Formati");

  const categories = ["Tutti i Gusti", "Cremoso", "Fruttato", "Ghiacciato", "Tabaccoso", "Tabaccoso e Cremoso", "Balsamici e Speziati"];

  useEffect(() => {
    async function loadData() {
      const { data: storeData } = await supabase.from('vape_stores').select('*').eq('slug', storeSlug).single();
      if (storeData) {
        setStore(storeData);
        const { data: invData } = await supabase
          .from('vape_inventory')
          .select('vape_products (*)')
          .eq('store_id', storeData.id)
          .eq('is_active', true);
        
        if (invData) {
          const products = invData.map(item => item.vape_products).filter(p => p !== null);
          // Ordinamento per Marca e poi Nome
          products.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
          setAllProducts(products);
        }
      }
      setLoading(false);
    }
    if (storeSlug) loadData();
  }, [storeSlug]);

  // LOGICA DI FILTRO INCROCIATA (GUSTO + MARCA + FORMATO + RICERCA)
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-pulse font-black text-red-600 text-4xl italic uppercase tracking-tighter">SMO-KING</div></div>;
  if (!store) return <div className="p-20 text-center font-bold">Negozio non trovato.</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-20 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 p-8 shadow-sm flex flex-col items-center">
        <img src={store.logo_url || "https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg"} alt="Logo" className="h-16 mb-6 object-contain" />
        <h1 className="text-3xl font-black italic uppercase tracking-[0.3em] text-red-600 leading-none">{store.subtext}</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* RICERCA */}
        <div className="relative pt-4">
          <Search className="absolute left-6 top-[62%] -translate-y-1/2 text-slate-300" size={24} />
          <input 
            type="text" placeholder="Cerca un marchio o un liquido..." 
            className="w-full pl-16 pr-8 py-6 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border-none focus:ring-2 ring-red-500 outline-none text-lg font-bold"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 1. FILTRO CATEGORIE (GUSTI) */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">1. Scegli il Gusto</p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-6 py-4 rounded-full whitespace-nowrap font-black text-[10px] uppercase tracking-widest italic transition-all ${activeCategory === cat ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-slate-500 border border-gray-100 shadow-sm'}`}>
                {cat !== "Tutti i Gusti" && <CategoryIcon cat={cat} />} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2. FILTRO FORMATI (LA TUA RICHIESTA) */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">2. Scegli il Formato</p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
            {uniqueFormats.map(formato => (
              <button key={formato} onClick={() => setActiveFormat(formato)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap font-black text-[10px] uppercase tracking-widest italic transition-all ${activeFormat === formato ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-gray-200 shadow-sm'}`}>
                <Beaker size={12} /> {formato}
              </button>
            ))}
          </div>
        </div>

        {/* 3. FILTRO MARCHE */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic">3. Filtra per Marca</p>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1">
            {uniqueBrands.map(brand => (
              <button key={brand} onClick={() => setActiveBrand(brand)}
                className={`px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${activeBrand === brand ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-gray-200 text-slate-400'}`}>
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA PRODOTTI */}
        <div className="grid grid-cols-1 gap-6 pt-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[3.5rem] shadow-sm border border-gray-50 flex gap-6 items-start relative overflow-hidden group hover:border-red-100 transition-all">
                
                {/* PREZZO */}
                {p.prezzo && (
                  <div className="absolute top-0 right-10 bg-red-600 text-white px-6 py-2 rounded-b-3xl font-black italic text-xl shadow-lg">
                    €{parseFloat(p.prezzo).toFixed(2)}
                  </div>
                )}

                <div className="w-28 h-28 bg-gray-50 rounded-[2.5rem] overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner p-2 group-hover:scale-105 transition-transform">
                  <img src={p.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-contain rounded-2xl" />
                </div>

                <div className="flex-1 pt-2">
                  <div className="inline-flex items-center gap-1 bg-slate-900 text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest mb-3 italic">
                    <Beaker size={10} /> {p.formato || 'Liquido'}
                  </div>

                  <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1 italic leading-none">{p.brand}</p>
                  <h3 className="font-black text-slate-800 text-xl leading-tight mb-2 tracking-tight italic uppercase">{p.name}</h3>
                  
                  {p.description && <p className="text-[13px] text-slate-400 font-medium mb-4 line-clamp-2 leading-relaxed">{p.description}</p>}

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-500 border border-slate-100 shadow-sm">
                      <CategoryIcon cat={p.category} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                    </div>

                    {p.nicotina && p.nicotina.length > 0 && (
                      <div className="flex gap-1 items-center">
                        <span className="text-[9px] font-bold text-slate-300 uppercase mr-1">Nic:</span>
                        {p.nicotina.map(n => (
                          <span key={n} className="bg-white text-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-black border border-gray-100 shadow-sm">{n}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 opacity-30 italic font-bold">Nessun prodotto corrisponde ai filtri selezionati.</div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-16 p-12 pb-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
             <div className="flex justify-center mb-6 opacity-20"><img src={store.logo_url} className="h-10 grayscale" /></div>
             <h2 className="text-4xl font-black italic uppercase tracking-tighter text-red-600">{store.subtext}</h2>
             <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em]">{store.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <a href={`tel:${store.phone}`} className="flex flex-col items-center p-8 border-2 border-gray-100 rounded-[3rem] hover:border-red-500 transition-all active:scale-95 group bg-white shadow-sm">
              <Phone size={32} className="text-red-500 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold tracking-widest italic">Chiama Ora</span>
            </a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || '')}`} target="_blank" className="flex flex-col items-center p-8 border-2 border-gray-100 rounded-[3rem] hover:border-red-500 transition-all active:scale-95 group bg-white shadow-sm">
              <MapPin size={32} className="text-red-500 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-bold tracking-widest italic">Mappa</span>
            </a>
          </div>
          {store.google_review_url && (
            <a href={store.google_review_url} target="_blank" className="flex items-center justify-center gap-5 bg-yellow-400 text-yellow-950 font-black p-8 rounded-[3.5rem] shadow-2xl shadow-yellow-100 hover:scale-[1.03] active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] italic border-b-4 border-yellow-600">
              <Star size={26} fill="currentColor" /> Lascia 5 Stelle su Google
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}