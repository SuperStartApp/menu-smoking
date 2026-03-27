"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Store, Package, CheckCircle2, XCircle, Search, Edit3, X, Beaker, Euro, Tag } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [searchDistri, setSearchDistri] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStore, setEditingStore] = useState(null);

  const [newProduct, setNewProduct] = useState({ name: '', brand: '', category: '', image_url: '', description: '', formato: '', nicotina_input: '', prezzo: '' });
  const [newStore, setNewStore] = useState({ name: '', subtext: '', slug: '', address: '', phone: '', google_review_url: '', logo_url: '' });

  const categorieList = ["Cremoso", "Fruttato", "Ghiacciato", "Tabaccoso", "Tabaccoso e Cremoso", "Balsamici e Speziati"];
  const formatiList = ["10ml Pronto", "Shot 10+10", "Shot 20+40", "Aroma 10ml", "Sali di Nicotina", "Disposable"];

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: p } = await supabase.from('vape_products').select('*').order('brand');
    const { data: s } = await supabase.from('vape_stores').select('*').order('name');
    const { data: i } = await supabase.from('vape_inventory').select('*');
    setProducts(p || []); setStores(s || []); setInventory(i || []);
    if (s?.length > 0 && !selectedStore) setSelectedStore(s[0].id);
    setLoading(false);
  }

  const formatNicotine = (str) => (typeof str === 'string' ? str.split(',').map(s => s.trim()).filter(s => s !== "") : str);

  async function handleAddProduct() {
    const payload = { ...newProduct, nicotina: formatNicotine(newProduct.nicotina_input), prezzo: newProduct.prezzo || null };
    delete payload.nicotina_input;
    await supabase.from('vape_products').insert([payload]);
    setNewProduct({ name: '', brand: '', category: '', image_url: '', description: '', formato: '', nicotina_input: '', prezzo: '' });
    fetchData();
  }

  async function handleUpdateProduct() {
    const payload = { ...editingProduct, nicotina: typeof editingProduct.nicotina === 'string' ? formatNicotine(editingProduct.nicotina) : editingProduct.nicotina };
    await supabase.from('vape_products').update(payload).eq('id', editingProduct.id);
    setEditingProduct(null); fetchData();
  }

  async function handleAddStore() {
    await supabase.from('vape_stores').insert([newStore]);
    setNewStore({ name: '', subtext: '', slug: '', address: '', phone: '', google_review_url: '', logo_url: '' });
    fetchData();
  }

  async function toggleAvailability(prodId, storeId) {
    const existing = inventory.find(item => item.product_id === prodId && item.store_id === storeId);
    if (existing) {
      await supabase.from('vape_inventory').update({ is_active: !existing.is_active }).match({ product_id: prodId, store_id: storeId });
    } else {
      await supabase.from('vape_inventory').insert([{ product_id: prodId, store_id: storeId, is_active: true }]);
    }
    fetchData();
  }

  if (loading) return <div className="p-20 text-center font-black text-red-600 animate-bounce">CARICAMENTO ADMIN...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <nav className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-4 shadow-2xl">
        <h2 className="text-xl font-black text-red-500 italic uppercase mb-10 tracking-tighter">Smo-King Admin</h2>
        <button onClick={() => setActiveTab('products')} className={`p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'products' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>📦 Catalogo</button>
        <button onClick={() => setActiveTab('inventory')} className={`p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'inventory' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>🔄 Distribuzione</button>
        <button onClick={() => setActiveTab('stores')} className={`p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'stores' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>🏪 Negozi</button>
      </nav>

      <main className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'products' && (
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-red-100 grid grid-cols-2 gap-4 relative">
              <h2 className="col-span-2 font-black text-red-600 uppercase italic">Nuovo Prodotto</h2>
              <input type="text" placeholder="Nome Liquido" className="border-2 border-slate-100 p-4 rounded-2xl focus:border-red-500 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input type="text" placeholder="Marca" className="border-2 border-slate-100 p-4 rounded-2xl" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
              <select className="border-2 border-slate-100 p-4 rounded-2xl" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option value="">Scegli Gusto</option>{categorieList.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <select className="border-2 border-slate-100 p-4 rounded-2xl" value={newProduct.formato} onChange={e => setNewProduct({...newProduct, formato: e.target.value})}><option value="">Scegli Formato</option>{formatiList.map(f => <option key={f} value={f}>{f}</option>)}</select>
              <input type="text" placeholder="Nicotina (es: 0, 4, 8)" className="border-2 border-slate-100 p-4 rounded-2xl" value={newProduct.nicotina_input} onChange={e => setNewProduct({...newProduct, nicotina_input: e.target.value})} />
              <input type="number" placeholder="Prezzo (€)" className="border-2 border-slate-100 p-4 rounded-2xl" value={newProduct.prezzo} onChange={e => setNewProduct({...newProduct, prezzo: e.target.value})} />
              <input type="text" placeholder="URL Immagine" className="border-2 border-slate-100 p-4 rounded-2xl col-span-2" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
              <textarea placeholder="Descrizione" className="border-2 border-slate-100 p-4 rounded-2xl col-span-2 h-24" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              <button onClick={handleAddProduct} className="col-span-2 bg-red-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl hover:bg-red-700 transition-all">Aggiungi al Catalogo</button>
            </div>
            {/* LISTA PRODOTTI */}
            <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden border border-slate-200">
                <div className="p-6 bg-slate-50 border-b flex items-center gap-4"><Search className="text-slate-400" /><input type="text" placeholder="Cerca nel catalogo..." className="bg-transparent w-full outline-none font-bold" onChange={e => setSearch(e.target.value)} /></div>
                <div className="max-h-[500px] overflow-y-auto">
                    {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                        <div key={p.id} className="p-4 border-b flex justify-between items-center hover:bg-slate-50">
                            <div className="flex items-center gap-4"><img src={p.image_url} className="w-12 h-12 rounded-lg border object-contain bg-white" /><div><p className="font-black uppercase italic text-sm">{p.name}</p><p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{p.brand}</p></div></div>
                            <button onClick={async () => {if(confirm('Eliminare?')){await supabase.from('vape_products').delete().eq('id', p.id); fetchData();}}} className="text-red-300 hover:text-red-600 p-2"><Trash2 size={20}/></button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-red-100 grid grid-cols-2 gap-4">
              <h2 className="col-span-2 font-black text-red-600 uppercase italic">Nuovo Negozio</h2>
              <input type="text" placeholder="Nome Store (es. Smo-King)" className="border-2 border-slate-100 p-4 rounded-2xl" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} />
              <input type="text" placeholder="Luogo (es. Gelsi)" className="border-2 border-slate-100 p-4 rounded-2xl" value={newStore.subtext} onChange={e => setNewStore({...newStore, subtext: e.target.value})} />
              <input type="text" placeholder="Slug URL (es. gelsi)" className="border-2 border-slate-100 p-4 rounded-2xl" value={newStore.slug} onChange={e => setNewStore({...newStore, slug: e.target.value})} />
              <input type="text" placeholder="URL Logo" className="border-2 border-slate-100 p-4 rounded-2xl" value={newStore.logo_url} onChange={e => setNewStore({...newStore, logo_url: e.target.value})} />
              <input type="text" placeholder="Telefono" className="border-2 border-slate-100 p-4 rounded-2xl" value={newStore.phone} onChange={e => setNewStore({...newStore, phone: e.target.value})} />
              <input type="text" placeholder="Indirizzo" className="border-2 border-slate-100 p-4 rounded-2xl" value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} />
              <button onClick={handleAddStore} className="col-span-2 bg-slate-900 text-white p-5 rounded-2xl font-black uppercase shadow-xl hover:bg-black transition-all italic">Crea Negozio</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stores.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-3xl shadow-md border-2 border-white flex justify-between items-center group hover:border-red-500 transition-all">
                  <div className="flex items-center gap-4"><img src={s.logo_url || 'https://via.placeholder.com/50'} className="w-14 h-14 rounded-full border p-1 object-contain" /><div><p className="font-black uppercase italic text-lg">{s.subtext}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{s.address}</p></div></div>
                  <button onClick={async () => {if(confirm('Eliminare negozio?')){await supabase.from('vape_stores').delete().eq('id', s.id); fetchData();}}} className="text-red-400 hover:text-red-700 p-2 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

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