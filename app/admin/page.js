"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Store, Package, CheckCircle2, 
  XCircle, Search, Edit3, Save, X, ExternalLink, Beaker 
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [searchDistri, setSearchDistri] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);

  // Stati per Edit
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStore, setEditingStore] = useState(null);

  // Stati Nuovi Inserimenti
  const [newProduct, setNewProduct] = useState({ 
    name: '', brand: '', category: '', image_url: '', description: '', formato: '', nicotina_input: '', prezzo: '' 
  });
  const [newStore, setNewStore] = useState({ 
    name: '', subtext: '', slug: '', address: '', phone: '', google_review_url: '', logo_url: '' 
  });

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
  }

  const formatNicotine = (str) => (typeof str === 'string' ? str.split(',').map(s => s.trim()).filter(s => s !== "") : str);

  // --- AZIONI PRODOTTI ---
  async function handleAddProduct() {
    const payload = { 
      ...newProduct, 
      nicotina: formatNicotine(newProduct.nicotina_input),
      prezzo: newProduct.prezzo || null 
    };
    delete payload.nicotina_input;
    await supabase.from('vape_products').insert([payload]);
    setNewProduct({ name: '', brand: '', category: '', image_url: '', description: '', formato: '', nicotina_input: '', prezzo: '' });
    fetchData();
  }

  async function handleUpdateProduct() {
    const payload = { 
      ...editingProduct, 
      nicotina: typeof editingProduct.nicotina === 'string' ? formatNicotine(editingProduct.nicotina) : editingProduct.nicotina 
    };
    await supabase.from('vape_products').update(payload).eq('id', editingProduct.id);
    setEditingProduct(null);
    fetchData();
  }

  // --- AZIONI NEGOZI ---
  async function handleAddStore() {
    await supabase.from('vape_stores').insert([newStore]);
    setNewStore({ name: '', subtext: '', slug: '', address: '', phone: '', google_review_url: '', logo_url: '' });
    fetchData();
  }

  async function handleUpdateStore() {
    await supabase.from('vape_stores').update(editingStore).eq('id', editingStore.id);
    setEditingStore(null);
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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
      {/* SIDEBAR */}
      <nav className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-4 shadow-xl flex-shrink-0">
        <h2 className="text-2xl font-black text-red-500 italic uppercase mb-6">Smo-King Admin</h2>
        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'products' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>
          <Package size={20} /> <span className="font-bold uppercase text-xs">Catalogo</span>
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>
          <CheckCircle2 size={20} /> <span className="font-bold uppercase text-xs">Distribuzione</span>
        </button>
        <button onClick={() => setActiveTab('stores')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'stores' ? 'bg-red-600 shadow-lg' : 'hover:bg-slate-800'}`}>
          <Store size={20} /> <span className="font-bold uppercase text-xs">Negozi</span>
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">

        {/* --- TAB CATALOGO --- */}
        {activeTab === 'products' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 grid grid-cols-2 gap-4 relative">
              {editingProduct && <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 text-slate-400"><X /></button>}
              <h2 className="col-span-2 font-black text-red-600 uppercase italic text-sm mb-2">{editingProduct ? 'Modifica' : 'Nuovo Prodotto'}</h2>
              
              <input type="text" placeholder="Nome Liquido" className="border p-4 rounded-2xl bg-slate-50" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} />
              <input type="text" placeholder="Marca" className="border p-4 rounded-2xl bg-slate-50" value={editingProduct ? editingProduct.brand : newProduct.brand} onChange={e => editingProduct ? setEditingProduct({...editingProduct, brand: e.target.value}) : setNewProduct({...newProduct, brand: e.target.value})} />
              
              <select className="border p-4 rounded-2xl bg-slate-50" value={editingProduct ? editingProduct.category : newProduct.category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>
                <option value="">Gusto (Categoria)</option>
                {categorieList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select className="border p-4 rounded-2xl bg-slate-50" value={editingProduct ? editingProduct.formato : newProduct.formato} onChange={e => editingProduct ? setEditingProduct({...editingProduct, formato: e.target.value}) : setNewProduct({...newProduct, formato: e.target.value})}>
                <option value="">Formato</option>
                {formatiList.map(f => <option key={f} value={f}>{f}</option>)}
              </select>

              <input type="text" placeholder="Nicotina (es: 0, 4, 8)" className="border p-4 rounded-2xl bg-slate-50" value={editingProduct ? (Array.isArray(editingProduct.nicotina) ? editingProduct.nicotina.join(', ') : editingProduct.nicotina) : newProduct.nicotina_input} onChange={e => editingProduct ? setEditingProduct({...editingProduct, nicotina: e.target.value}) : setNewProduct({...newProduct, nicotina_input: e.target.value})} />
              <input type="number" step="0.01" placeholder="Prezzo (€)" className="border p-4 rounded-2xl bg-slate-50" value={editingProduct ? editingProduct.prezzo : newProduct.prezzo} onChange={e => editingProduct ? setEditingProduct({...editingProduct, prezzo: e.target.value}) : setNewProduct({...newProduct, prezzo: e.target.value})} />
              
              <input type="text" placeholder="URL Immagine" className="border p-4 rounded-2xl bg-slate-50 col-span-2" value={editingProduct ? editingProduct.image_url : newProduct.image_url} onChange={e => editingProduct ? setEditingProduct({...editingProduct, image_url: e.target.value}) : setNewProduct({...newProduct, image_url: e.target.value})} />
              <textarea placeholder="Descrizione gusto..." className="border p-4 rounded-2xl bg-slate-50 col-span-2 h-20" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />
              
              <button onClick={editingProduct ? handleUpdateProduct : handleAddProduct} className="col-span-2 bg-red-600 text-white p-5 rounded-2xl font-black uppercase shadow-lg italic">
                {editingProduct ? 'Salva Modifiche' : 'Aggiungi Prodotto'}
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b flex items-center gap-4">
                <Search className="text-slate-400" /><input type="text" placeholder="Cerca..." className="bg-transparent outline-none font-bold w-full" onChange={e => setSearch(e.target.value)} />
              </div>
              <table className="w-full text-left">
                <tbody>{products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 border-b">
                    <td className="p-4 flex items-center gap-4"><img src={p.image_url} className="h-12 w-12 rounded-xl object-cover border" /><div><p className="font-black italic">{p.name}</p><p className="text-[10px] font-bold text-red-600 uppercase">{p.brand} | {p.formato}</p></div></td>
                    <td className="p-4 text-right"><button onClick={() => setEditingProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={18}/></button><button onClick={async () => {if(confirm('Elimino?')){await supabase.from('vape_products').delete().eq('id', p.id); fetchData();}}} className="p-2 text-red-400"><Trash2 size={18}/></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB DISTRIBUZIONE --- */}
        {activeTab === 'inventory' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {stores.map(s => <button key={s.id} onClick={() => setSelectedStore(s.id)} className={`px-6 py-3 rounded-2xl font-black transition-all border-2 uppercase text-[10px] ${selectedStore === s.id ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white text-slate-500'}`}>{s.subtext}</button>)}
            </div>
            <input type="text" placeholder="Cerca prodotto..." className="p-4 w-full rounded-[2rem] border outline-none mb-4" onChange={e => setSearchDistri(e.target.value)} />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.filter(p => p.name.toLowerCase().includes(searchDistri.toLowerCase())).map(p => {
                const active = inventory.some(item => item.product_id === p.id && item.store_id === selectedStore && item.is_active);
                return (
                  <div key={p.id} onClick={() => toggleAvailability(p.id, selectedStore)} className={`p-4 rounded-3xl cursor-pointer border-2 transition-all h-36 flex flex-col justify-between ${active ? 'border-green-500 bg-white ring-4 ring-green-50' : 'border-slate-100 opacity-60'}`}>
                    <div className="flex justify-between items-start"><img src={p.image_url} className="h-10 w-10 object-contain rounded" />{active ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-slate-200" />}</div>
                    <div><p className="font-black text-xs leading-tight uppercase italic">{p.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{p.brand}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB NEGOZI --- */}
        {activeTab === 'stores' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 grid grid-cols-2 gap-4 relative">
              {editingStore && <button onClick={() => setEditingStore(null)} className="absolute top-6 right-6 text-slate-400"><X/></button>}
              <h2 className="col-span-2 font-black te