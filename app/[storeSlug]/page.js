"use client";
import React, { useEffect, useState, useMemo, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Phone, MapPin, Star, 
  Cookie, Leaf, Flame, Snowflake, Wind, Droplets, Sparkles, Beaker,
  ChevronLeft, ChevronRight
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
  const [activeFormat, setActiveFormat] = useState("Tutti i Formati");
  
  // NUOVO: STATI PER LA PAGINAZIONE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  // Reset della pagina quando cambiano i filtri
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, activeFormat]);

  // 1. Applichiamo i filtri alla lista totale
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === "Tutti i Gusti" || p.category === activeCategory;
      const matchFormat = activeFormat === "Tutti i Formati" || p.formato === activeFormat;
      return matchSearch && matchCat && matchFormat;
    });
  }, [searchTerm, activeCategory, activeFormat, allProducts]);

  // 2. Calcoliamo i prodotti da mostrare per la pagina corrente
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return filteredProducts.slice(firstIndex, lastIndex);
  }, [filteredProducts, currentPage]);

  const uniqueFormats = ["Tutti i Formati", ...new Set(allProducts.map(p => p.formato).filter(Boolean))];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white font-black text-red-600 text-3xl italic uppercase animate-pulse">SMO-KING</div>;
  if (!store) return <div className="p-20 text-center font-bold">Negozio non trovato.</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10 font-sans">
      
      {/* HEADER FISSO */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b p-4 flex flex-col items-center shadow-sm">
        <img src={store.logo_url || "https://www.smo-kingshop.it/img/smo-king-shop-logo-1627311740.jpg"} alt="Logo" className="h-10 mb-1 object-contain" />
        <h1 className="text-xl font-black italic uppercase tracking-widest text-red-600 leading-none">{store.subtext}</h1>
      </header>

      <div className="h-28"></div>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* RICERCA */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" placeholder="Cerca marca o aroma..." 
            className="w-full pl-14 pr-6 py-4 rounded-full shadow-lg border-none focus:ring-2 ring-red-500 outline-none text-md font-bold"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTRI */}
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["Tutti i Gusti", "Cremoso", "Fruttato", "Ghiacciato", "Tabaccoso", "Tabaccoso e Cremoso", "Balsamici e Speziati"].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-black text-[10px] uppercase italic transition-all ${activeCategory === cat ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-gray-100'}`}>
                {cat !== "Tutti i Gusti" && <CategoryIcon cat={cat} />} {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {uniqueFormats.map(formato => (
              <button key={formato} onClick={() => setActiveFormat(formato)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap font-black text-[9px] uppercase italic transition-all ${activeFormat === formato ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-gray-200'}`}>
                <Beaker size={12} /> {formato}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA PRODOTTI (PAGINATA) */}
        <div className="grid grid-cols-1 gap-5">
          {currentItems.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-5 items-start relative overflow-hidden group">
              {p.prezzo && (
                <div className="absolute bottom-4 right-6 bg-red-600 text-white px-4 py-1.5 rounded-full font-black italic text-sm shadow-lg">
                  €{parseFloat(p.prezzo).toFixed(2)}
                </div>
              )}
              <div className="w-24 h-24 bg-gray-50 rounded-3xl overflow-hidden flex-shrink-0 border border-gray-100 p-2">
                <img src={p.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-contain rounded-2xl" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1 italic leading-none">{p.brand}</p>
                <h3 className="font-black text-slate-800 text-lg leading-tight mb-2 uppercase italic">{p.name}</h3>
                {p.description && <p className="text-[12px] text-slate-400 font-medium mb-4 line-clamp-2 leading-relaxed italic">{p.description}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-slate-500 border border-slate-100">
                    <CategoryIcon cat={p.category} /><span className="text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-bold italic">Nessun liquido trovato.</div>
          )}
        </div>

        {/* CONTROLLI PAGINAZIONE */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-8">
            <button 
              onClick={() => {setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({top: 0, behavior: 'smooth'});}}
              disabled={currentPage === 1}
              className={`p-4 rounded-full border-2 transition-all ${currentPage === 1 ? 'text-slate-200 border-slate-100' : 'text-red-600 border-red-100 hover:bg-red-50 active:scale-90'}`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex items-center gap-2 font-black italic text-sm">
              <span className="text-red-600">{currentPage}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">{totalPages}</span>
            </div>

            <button 
              onClick={() => {setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({top: 0, behavior: 'smooth'});}}
              disabled={currentPage === totalPages}
              className={`p-4 rounded-full border-2 transition-all ${currentPage === totalPages ? 'text-slate-200 border-slate-100' : 'text-red-600 border-red-100 hover:bg-red-50 active:scale-90'}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 mt-10 p-10 pb-24 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-black italic uppercase text-red-600 leading-none">{store.subtext}</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">{store.address}</p>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <a href={`tel:${store.phone}`} className="flex flex-col items-center p-6 border-2 border-gray-50 rounded-[2rem] bg-white active:bg-red-50"><Phone size={24} className="text-red-500 mb-2" /><span className="text-[10px] font-black uppercase text-slate-400 italic">Chiama</span></a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || '')}`} target="_blank" className="flex flex-col items-center p-6 border-2 border-gray-50 rounded-[2rem] bg-white active:bg-red-50"><MapPin size={24} className="text-red-500 mb-2" /><span className="text-[10px] font-black uppercase text-slate-400 italic">Mappa</span></a>
          </div>
          {store.google_review_url && (
            <a href={store.google_review_url} target="_blank" className="inline-block bg-yellow-400 text-yellow-950 font-black p-6 rounded-[2rem] shadow-xl text-xs uppercase italic px-10">RECENSISCI SU GOOGLE</a>
          )}
        </div>
      </footer>
    </div>
  );
}