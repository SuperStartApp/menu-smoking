"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Store, Package, CheckCircle2, 
  XCircle, Search, Edit3, Save, X, Beaker 
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [searchDistri, setSearchDistri] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stati per la MODIFICA
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStore, setEditingStore] = useState(null);

  // Stati per NUOVI INSERIMENTI
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', category: '', image_url: '', description: '', formato: '', nicotina_input: '', prezzo: '' });
  const [newStore, setNewStore] = useState({ name: '', subtext: '', slug: '', address: '', phone: '', google_review_url: '', logo_url: '' });

  const categorieList = ["Cremoso", "Fruttato", "Ghiacciato", "Tabaccoso", "Tabaccoso e Cremoso", "Balsamici e Speziati"];
  const formatiList = ["10ml Pronto", "Shot 10+10", "Shot 20+40", "Aroma 10ml", "Sali di Nicotina", "Disposable (Usa e Getta)"];

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: p } = await supabase.from('vape_products').select('*').order('brand').order('name');
    const { data: s } = await supabase.from('vape_stores').select('*').order('name');
    const { data: i } = await supabase.from('vape_inventory').select('*');
    setProducts(p || []);
    setStores(s || []);
    setInventory(i || []);
    if (s?.length > 0 && !selectedStore) setSelectedStore(s[0].id);
    setLoading(false);
  }

  const formatNicotine = (str) => (typeof str === 'string' ? str.split(',').map(s => s.trim()).filter(s => s !== "") : str);

  // --- AZIONI PRODOTTI ---
  async function handleSaveProduct() {
    if (editingProduct) {
      // LOGICA MODIFICA
      const payload = { 
        ...editingProduct, 
        nicotina: typeof editingProduct.nicotina === 'string' ? formatNicotine(editingProduct.nicotina) : editingProduct.nicotina 
      };
      await supabase.from('vape_products').update(payload).eq('id', editingProduct.id);
      setEditingProduct(null);
    } else {
      // LOGICA AGGIUNTA
      const payload = { ...newProduct, nicotina: formatNicotine(newProduct.nicotina_input), prezzo: newProduct.prezzo || null };
      delete payload.nicotina_input;
      await supabase.from('vape_products').insert([payload]);
      setNewProduct({ name: '', brand: '', category: '', image_url: '', description: '', formato: '', nicotina_input: '', prezzo: '' });
    }
    fetchData();
  }

  // --- AZIONI NEGOZI ---
  async function handleSaveStore() {
    if (editingStore) {
      await supabase.from('vape_stores').update(editingStore).eq('id', editingStore.id);
      setEditingStore(null);
    } else {
      await supabase.from('vape_stores').insert([newStore]);
      setNewStore({ name: '', subtext: '', slug: '', address: '', phone: '', google_review_url: '', logo_url: '' });
    }
    fetchData();
  }

  // --- AZIONI DISTRIBUZIONE ---
  async function toggleAvailability(prodId, storeId) {
    if (!storeId) return;
    const existing = inventory.find(item => item.product_id === prodId && item.store_id === storeId);
    if (existing) {
      await supabase.from('vape_inventory').update({ is_active: !existing.is_active }).match({ product_id: prodId, store_id: storeId });
    } else {
      await supabase.from('vape_inventory').insert([{ product_id: prodId, store_id: storeId, is_active: true }]);
    }
    fetchData();
  }

  if (loading) return <div className="p-20 text-center font-black text-red-600 animate-bounce uppercase">Caricamento Sala Comandi...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <nav className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-4 shadow-2xl flex-shrink-0">
        <h2 className="text-xl font-black text-red-500 italic uppercase mb-10 tracking-tighter">Smo-King Admin</h2>
        <button onClick={() => {setActiveTab('products'); setEditingProduct(null);}} className={`p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'products' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>📦 Catalogo</button>
        <button onClick={() => setActiveTab('inventory')} className={`p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'inventory' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>🔄 Distribuzione</button>
        <button onClick={() => {setActiveTab('stores'); setEditingStore(null);}} className={`p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'stores' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>🏪 Negozi</button>
      </nav>

      {/* MAIN */}
      <main className="flex-1 p-10 overflow-y-auto">

        {/* TAB CATALOGO PRODOTTI */}
        {activeTab === 'products' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-red-100 grid grid-cols-2 gap-4 relative">
              {(editingProduct) && <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><X /></button>}
              <h2 className="col-span-2 font-black text-red-600 uppercase italic">{editingProduct ? 'Modifica Liquido' : 'Nuovo Prodotto'}</h2>
              
              <input type="text" placeholder="Nome Liquido" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} />
              <input type="text" placeholder="Marca" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingProduct ? editingProduct.brand : newProduct.brand} onChange={e => editingProduct ? setEditingProduct({...editingProduct, brand: e.target.value}) : setNewProduct({...newProduct, brand: e.target.value})} />
              
              <select className="border-2 border-slate-100 p-4 rounded-2xl" value={editingProduct ? editingProduct.category : newProduct.category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>
                <option value="">Gusto</option>{categorieList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select className="border-2 border-slate-100 p-4 rounded-2xl" value={editingProduct ? editingProduct.formato : newProduct.formato} onChange={e => editingProduct ? setEditingProduct({...editingProduct, formato: e.target.value}) : setNewProduct({...newProduct, formato: e.target.value})}>
                <option value="">Formato</option>{formatiList.map(f => <option key={f} value={f}>{f}</option>)}
              </select>

              <input type="text" placeholder="Nicotina (es: 0, 4, 8)" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingProduct ? (Array.isArray(editingProduct.nicotina) ? editingProduct.nicotina.join(', ') : editingProduct.nicotina) : newProduct.nicotina_input} onChange={e => editingProduct ? setEditingProduct({...editingProduct, nicotina: e.target.value}) : setNewProduct({...newProduct, nicotina_input: e.target.value})} />
              <input type="number" step="0.01" placeholder="Prezzo (€)" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingProduct ? editingProduct.prezzo : newProduct.prezzo} onChange={e => editingProduct ? setEditingProduct({...editingProduct, prezzo: e.target.value}) : setNewProduct({...newProduct, prezzo: e.target.value})} />
              
              <input type="text" placeholder="URL Immagine" className="border-2 border-slate-100 p-4 rounded-2xl col-span-2" value={editingProduct ? editingProduct.image_url : newProduct.image_url} onChange={e => editingProduct ? setEditingProduct({...editingProduct, image_url: e.target.value}) : setNewProduct({...newProduct, image_url: e.target.value})} />
              <textarea placeholder="Descrizione gusto..." className="border-2 border-slate-100 p-4 rounded-2xl col-span-2 h-24" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />
              
              <button onClick={handleSaveProduct} className="col-span-2 bg-red-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-2">
                {editingProduct ? <><Save size={20}/> Salva Modifiche</> : <><Plus size={20}/> Aggiungi Prodotto</>}
              </button>
            </div>

            {/* LISTA CON MATITA E CESTINO */}
            <div className="bg-white rounded-[2rem] shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b flex items-center gap-4"><Search className="text-slate-400" /><input type="text" placeholder="Cerca nel catalogo..." className="bg-transparent w-full outline-none font-bold" onChange={e => setSearch(e.target.value)} /></div>
                <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-50">
                    {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                        <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <img src={p.image_url} className="w-12 h-12 rounded-xl border object-contain bg-white" />
                                <div><p className="font-black uppercase italic text-sm">{p.name}</p><p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{p.brand} | {p.formato}</p></div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => {setEditingProduct(p); window.scrollTo({top: 0, behavior: 'smooth'});}} className="text-blue-500 p-2 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={20}/></button>
                                <button onClick={async () => {if(confirm('Eliminare definitivamente?')){await supabase.from('vape_products').delete().eq('id', p.id); fetchData();}}} className="text-red-300 hover:text-red-600 p-2"><Trash2 size={20}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* TAB GESTIONE NEGOZI */}
        {activeTab === 'stores' && (
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-red-100 grid grid-cols-2 gap-4 relative">
              {editingStore && <button onClick={() => setEditingStore(null)} className="absolute top-6 right-6 text-slate-400"><X /></button>}
              <h2 className="col-span-2 font-black text-red-600 uppercase italic">{editingStore ? 'Modifica Negozio' : 'Nuovo Negozio'}</h2>
              <input type="text" placeholder="Nome Store" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingStore ? editingStore.name : newStore.name} onChange={e => editingStore ? setEditingStore({...editingStore, name: e.target.value}) : setNewStore({...newStore, name: e.target.value})} />
              <input type="text" placeholder="Luogo (es. Gelsi)" className="border-2 border-slate-100 p-4 rounded-2xl font-bold italic" value={editingStore ? editingStore.subtext : newStore.subtext} onChange={e => editingStore ? setEditingStore({...editingStore, subtext: e.target.value}) : setNewStore({...newStore, subtext: e.target.value})} />
              <input type="text" placeholder="Slug (URL)" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingStore ? editingStore.slug : newStore.slug} onChange={e => editingStore ? setEditingStore({...editingStore, slug: e.target.value}) : setNewStore({...newStore, slug: e.target.value})} />
              <input type="text" placeholder="Logo Link (URL)" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingStore ? editingStore.logo_url : newStore.logo_url} onChange={e => editingStore ? setEditingStore({...editingStore, logo_url: e.target.value}) : setNewStore({...newStore, logo_url: e.target.value})} />
              <input type="text" placeholder="Telefono" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingStore ? editingStore.phone : newStore.phone} onChange={e => editingStore ? setEditingStore({...editingStore, phone: e.target.value}) : setNewStore({...newStore, phone: e.target.value})} />
              <input type="text" placeholder="Indirizzo" className="border-2 border-slate-100 p-4 rounded-2xl" value={editingStore ? editingStore.address : newStore.address} onChange={e => editingStore ? setEditingStore({...editingStore, address: e.target.value}) : setNewStore({...newStore, address: e.target.value})} />
              <input type="text" placeholder="Google Link" className="border-2 border-slate-100 p-4 rounded-2xl col-span-2" value={editingStore ? editingStore.google_review_url : newStore.google_review_url} onChange={e => editingStore ? setEditingStore({...editingStore, google_review_url: e.target.value}) : setNewStore({...newStore, google_review_url: e.target.value})} />
              <button onClick={handleSaveStore} className="col-span-2 bg-slate-900 text-white p-5 rounded-2xl font-black uppercase shadow-xl flex items-center justify-center gap-2">
                {editingStore ? <><Save size={20}/> Salva Modifiche</> : <><Store size={20}/> Crea Negozio</>}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stores.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-3xl shadow-md border-2 border-white flex justify-between items-center group hover:border-red-500 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={s.logo_url || 'https://via.placeholder.com/50'} className="w-14 h-14 rounded-full border object-contain p-1" />
                    <div><h3 className="font-black text-lg italic text-slate-800">{s.subtext}</h3><p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{s.address}</p></div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => {setEditingStore(s); window.scrollTo({top: 0, behavior: 'smooth'});}} className="text-blue-500 p-2 hover:bg-blue-50 rounded-xl"><Edit3 size={20}/></button>
                    <button onClick={async () => {if(confirm('Eliminare negozio?')){await supabase.from('vape_stores').delete().eq('id', s.id); fetchData();}}} className="text-red-400 p-2 hover:bg-red-50 rounded-xl"><Trash2 size={20}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB DISTRIBUZIONE */}
        {activeTab === 'inventory' && (
           <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {stores.map(s => <button key={s.id} onClick={() => setSelectedStore(s.id)} className={`px-8 py-3 rounded-2xl font-black transition-all border-2 uppercase text-xs ${selectedStore === s.id ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-slate-400 border-slate-100'}`}>{s.subtext}</button>)}
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6 flex items-center gap-4"><Search className="text-slate-300"/><input type="text" placeholder="Cerca prodotto da attivare..." className="w-full outline-none font-bold" onChange={e => setSearchDistri(e.target.value)} /></div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.filter(p => p.name.toLowerCase().includes(searchDistri.toLowerCase())).map(p => {
                    const active = inventory.some(item => item.product_id === p.id && item.store_id === selectedStore && item.is_active);
                    return <div key={p.id} onClick={() => toggleAvailability(p.id, selectedStore)} className={`p-4 rounded-[2rem] cursor-pointer border-2 transition-all flex flex-col justify-between h-40 ${active ? 'bg-white border-green-500 ring-4 ring-green-50 shadow-md' : 'bg-white border-slate-100 opacity-50 shadow-sm hover:opacity-100'}`}>
                        <div className="flex justify-between items-start"><img src={p.image_url} className="w-10 h-10 object-contain rounded" />{active ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-slate-200" />}</div>
                        <div><p className="font-black text-xs leading-tight uppercase italic">{p.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{p.brand}</p></div>
                    </div>
                })}
              </div>
           </div>
        )}
      </main>
    </div>
  );
}