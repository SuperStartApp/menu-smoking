"use client";
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, CheckCircle2, XCircle, Store } from 'lucide-react';

export default function EmployeeAdmin({ params }) {
  const resolvedParams = use(params);
  const storeSlug = resolvedParams.storeIdSlug;

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // NUOVO: Filtro categoria per il manager di negozio
  const [selectedCat, setSelectedCat] = useState("Tutti");
  const categorieList = ["Cremoso", "Fruttato", "Ghiacciato", "Tabaccoso", "Tabaccoso e Cremoso", "Balsamici e Speziati"];

  useEffect(() => {
    async function loadStoreData() {
      const { data: storeData } = await supabase.from('vape_stores').select('*').eq('slug', storeSlug).single();
      if (storeData) {
        setStore(storeData);
        const { data: p } = await supabase.from('vape_products').select('*').order('brand');
        const { data: i } = await supabase.from('vape_inventory').select('*').eq('store_id', storeData.id);
        setProducts(p || []);
        setInventory(i || []);
      }
      setLoading(false);
    }
    loadStoreData();
  }, [storeSlug]);

  async function toggleProduct(prodId) {
    const existing = inventory.find(item => item.product_id === prodId);
    if (existing) {
      const { data: updated } = await supabase.from('vape_inventory').update({ is_active: !existing.is_active }).match({ product_id: prodId, store_id: store.id }).select();
      setInventory(inventory.map(item => item.product_id === prodId ? updated[0] : item));
    } else {
      const { data: inserted } = await supabase.from('vape_inventory').insert([{ product_id: prodId, store_id: store.id, is_active: true }]).select();
      setInventory([...inventory, inserted[0]]);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-red-600 animate-pulse uppercase italic">Caricamento magazzino...</div>;
  if (!store) return <div className="p-20 text-center font-bold font-sans">Negozio non riconosciuto.</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-slate-900 text-white p-6 shadow-xl flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black italic uppercase text-red-500 leading-none">Magazzino</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Smo-King {store.subtext}</p>
        </div>
        <Store className="text-slate-500" size={24} />
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* FILTRO CATEGORIE MANAGER */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {["Tutti", ...categorieList].map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)} className={`px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase transition-all whitespace-nowrap border-2 ${selectedCat === cat ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-slate-400 border-slate-100'}`}>{cat}</button>
          ))}
        </div>

        {/* RICERCA */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border flex items-center gap-4"><Search className="text-slate-300"/><input type="text" placeholder="Cerca prodotto..." className="w-full outline-none font-bold text-lg" onChange={e => setSearch(e.target.value)} /></div>

        {/* GRIGLIA */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products
            .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
            .filter(p => selectedCat === "Tutti" || p.category === selectedCat)
            .map(p => {
              const isVisible = inventory.find(item => item.product_id === p.id)?.is_active;
              return (
                <div key={p.id} onClick={() => toggleProduct(p.id)} className={`p-5 rounded-[2.5rem] cursor-pointer border-2 transition-all flex flex-col justify-between h-44 shadow-sm relative ${isVisible ? 'bg-white border-green-500 ring-4 ring-green-50 shadow-md' : 'bg-white border-slate-100 opacity-50'}`}>
                  <div className="flex justify-between items-start"><div className="h-12 w-12 bg-slate-50 rounded-xl overflow-hidden border p-1"><img src={p.image_url} className="h-full w-full object-contain" /></div>{isVisible ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-slate-200" />}</div>
                  <div>
                    <p className="font-black text-slate-800 text-[11px] leading-tight uppercase italic line-clamp-2">{p.name}</p>
                    <p className="text-[9px] font-bold text-red-600 uppercase mt-1">{p.brand}</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase">{p.category}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around text-[10px] font-black uppercase tracking-widest shadow-2xl">
         <div className="flex items-center gap-2 text-green-600"><CheckCircle2 size={14}/> In Scaffale</div>
         <div className="flex items-center gap-2 text-slate-300"><XCircle size={14}/> Esaurito</div>
      </footer>
    </div>
  );
}