"use client";
import React, { useEffect, useState, useMemo, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Phone, MapPin, Star, Beaker, Cookie, Flame, Leaf, Snowflake, Droplets, Sparkles } from 'lucide-react';

const CategoryIcon = ({ cat }) => {
    switch (cat) {
      case 'Cremoso': return <Cookie size={12} />;
      case 'Tabaccoso': return <Flame size={12} />;
      case 'Fruttato': return <Leaf size={12} />;
      case 'Ghiacciato': return <Snowflake size={12} />;
      case 'Tabaccoso e Cremoso': return <Droplets size={12} />;
      case 'Balsamici e Speziati': return <Sparkles size={12} />;
      default: return null;
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
    loadData();
  }, [storeSlug]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === "Tutti i Gusti" || p.category === activeCategory;
      const matchFormat = activeFormat === "Tutti i Formati" || p.formato === activeFormat;
      return matchSearch && matchCat && matchFormat;
    });
  }, [searchTerm, activeCategory, activeFormat, allProducts]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-red-600 animate-pulse">SMO-KING</div>;
  if (!store) return <div className="p-20 text-center">Negozio non trovato.</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-10">
      
      {/* HEADER FISSO E COMPATTO */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b p-3 flex flex-col items-center shadow-sm">
        <img src={store.logo_url || "https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg"} className="h-8 mb-1" />
        <h1 className="text-lg font-black italic uppercase text-red-600 leading-none">{store.subtext}</h1>
      </header>

      <div className="h-24"></div> {/* Spaziatore per header fisso */}

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input type="text" placeholder="Cerca marca o aroma..." className="w-full pl-12 pr-4 py-3 rounded-full shadow-sm border-none outline-none font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* FILTRI SCROLLABILI */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["Tutti i Gusti", "Cremoso", "Fruttato", "Ghiacciato", "Tabaccoso", "Tabaccoso e Cremoso", "Balsamici e Speziati"].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full whitespace-nowrap font-black text-[10px] uppercase italic border ${activeCategory === cat ? 'bg-red-600 border-red-600 text-white' : 'bg-white text-slate-500 border-gray-100'}`}>{cat}</button>
          ))}
        </div>

        {/* LISTA PRODOTTI */}
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-[2rem] shadow-sm flex gap-4 items-center relative border border-gray-50">
              {/* PREZZO SPOSTATO IN BASSO A DESTRA PER NON COPRIRE TITOLO */}
              {p.prezzo && <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full font-black italic text-sm shadow-md italic">€{p.prezzo}</div>}
              
              <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-2xl p-2 border border-gray-100">
                <img src={p.image_url} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 pr-10">
                <p className="text-[9px] font-black text-red-600 uppercase italic tracking-widest">{p.brand}</p>
                <h3 className="font-black text-slate-800 text-md uppercase italic leading-tight mb-1">{p.name}</h3>
                {p.description && <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic mb-2 line-clamp-2">{p.description}</p>}
                <div className="flex items-center gap-1 bg-slate-50 w-fit px-2 py-0.5 rounded-full border border-slate-100">
                   <CategoryIcon cat={p.category} /><span className="text-[8px] font-black uppercase text-slate-400">{p.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER LEGGERO */}
      <footer className="bg-white border-t p-8 mt-10 text-center">
        <img src={store.logo_url} className="h-6 mx-auto grayscale opacity-20 mb-3" />
        <h2 className="text-xl font-black italic text-red-600 uppercase mb-1">{store.subtext}</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 tracking-widest">{store.address}</p>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
            <a href={`tel:${store.phone}`} className="flex flex-col items-center p-4 border rounded-2xl shadow-sm bg-gray-50"><Phone size={20} className="text-red-500 mb-1" /><span className="text-[8px] font-black uppercase text-slate-400">Chiama</span></a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || '')}`} className="flex flex-col items-center p-4 border rounded-2xl shadow-sm bg-gray-50"><MapPin size={20} className="text-red-500 mb-1" /><span className="text-[8px] font-black uppercase text-slate-400">Mappa</span></a>
        </div>
        {store.google_review_url && <a href={store.google_review_url} className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-950 px-6 py-3 rounded-full font-black italic text-xs shadow-md">RECENSISCI SU GOOGLE</a>}
      </footer>
    </div>
  );
}