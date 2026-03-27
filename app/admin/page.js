"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Store, Package, CheckCircle2, 
  XCircle, Search, Edit3, Save, X, ExternalLink, ImageIcon, Beaker
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'inventory', 'stores'
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stati Ricerca
  const [searchCatalog, setSearchCatalog] = useState(""); // Ricerca nel catalogo prodotti
  const [searchDistri, setSearchDistri] = useState("");   // Ricerca nella distribuzione

  const [selectedStore, setSelectedStore] = useState(null);

  // Stati Edit
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

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: p } = await supabase.from('vape_products').select('*').order('brand').order('name');
    const { data: s } = await supabase.from('vape_stores').select('*').order('name');
    const { data: i } = await supabase.from('vape_inventory').select('*');
    
    setProducts(p || []);
    setStores(s || []);
    setInventory(i || []);
    
    if (s?.length > 0 && !selectedStore) {
      setSelectedStore(s[0].id);
    }
    setLoading(false);
  }

  // Helper Nicotina
  const formatNicotine = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    return str.split(',').map(s => s.trim()).filter(s => s !== "");
  };

  // --- AZIONI PRODOTTI ---
  async function handleAddProduct() {
    if (!newProduct.name || !newProduct.brand) return alert("Nome e Marca obbligatori");
    const payload = { 
      ...newProduct, 
      nicotina: formatNicotine(newProduct.nicotina_input),
      prezzo: newProduct.prezzo ? parseFloat(newProduct.prezzo) : null 
    };
    delete payload.nicotina_input;
    
    const { error } = await supabase.from('vape_products').insert([payload]);
    if (error) alert(error.message);
    else {
      setNewProduct({ name: '', brand: '', category: '', image_url: '', description: '', formato: '', nicotina_input: '', prezzo: '' });
      fetchData();
    }
  }

  async function handleUpdateProduct() {
    const payload = { 
      ...editingProduct, 
      nicotina: typeof editingProduct.nicotina === 'string' ? formatNicotine(editingProduct.nicotina) : editingProduct.nicotina,
      prezzo: editingProduct.prezzo ? parseFloat(editingProduct.prezzo) : null
    };
    const { error } = await supabase.from('vape_products').update(payload).eq('id', editingProduct.id);
    if (error) alert(error.message);
    else {
      setEditingProduct(null);
      fetchData();
    }
  }

  async function deleteProduct(id) {
    if (confirm("Eliminare definitivamente questo prodotto dal catalogo globale?")) {
      await supabase.from('vape_products').delete().eq('id', id);
      fetchData();
    }
  }

  // --- AZIONI NEGOZI ---
  async function handleAddStore() {
    if (!newStore.slug) return alert("Slug obbligatorio");
    const { error } = await supabase.from('vape_stores').insert([newStore]);
    if (error) alert(error.message);
    else {
      setNewStore({ name: '', subtext: '', slug: '', address: '', phone: '', google_review_url: '', logo_url: '' });
      fetchData();
    }
  }

  async function handleUpdateStore() {
    const { error } = await supabase.from('vape_stores').update(editingStore).eq('id', editingStore.id);
    if (error) alert(error.message);
    else {
      setEditingStore(null);
      fetchData();
    }
  }

  // --- AZIONI DISTRIBUZIONE ---
  async function toggleAvailability(prodId, storeId) {
    if (!storeId) return;
    const existing = inventory.find(item => item.product_id === prodId && item.store_id === storeId);
    
    if (existing) {
      await supabase.from('vape_inventory')
        .update({ is_active: !existing.is_active })
        .match({ product_id: prodId, store_id: storeId });
    } else {
      await supabase.from('vape_inventory')
        .insert([{ product_id: prodId, store_id: storeId, is_active: true }]);
    }
    // Aggiornamento locale rapido per non rifare fetch totale
    fetchData();
  }

  // Filtri logici
  const filteredCatalog = products.filter(p => 
    p.name.toLowerCase().includes(searchCatalog.toLowerCase()) || 
    p.brand?.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  const filteredDistri = products.filter(p => 
    p.name.toLowerCase().includes(searchDistri.toLowerCase()) || 
    p.brand?.toLowerCase().includes(searchDistri.toLowerCase())
  );

  if (loading && products.length === 0) return <div className="p-20 text-center font-black text-red-600 animate-pulse uppercase italic tracking-widest text-2xl">Caricamento SMO-KING...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <nav className="w-72 bg-slate-900 text-white p-6 flex flex-col gap-3 shadow-xl flex-shrink-0">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-red-500 italic uppercase tracking-tighter">Smo-King</h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Management Panel</p>
        </div>
        
        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'products' ? 'bg-red-600 shadow-lg shadow-red-900/40' : 'hover:bg-slate-800'}`}>
          <Package size={20} /> <span className="font-bold uppercase text-xs tracking-widest">Catalogo Prodotti</span>
        </button>
        
        <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-red-600 shadow-lg shadow-red-900/40' : 'hover:bg-slate-800'}`}>
          <CheckCircle2 size={20} /> <span className="font-bold uppercase text-xs tracking-widest">Distribuzione</span>
        </button>
        
        <button onClick={() => setActiveTab('stores')} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === 'stores' ? 'bg-red-600 shadow-lg shadow-red-900/40' : 'hover:bg-slate-800'}`}>
          <Store size={20} /> <span className="font-bold uppercase text-xs tracking-widest">Gestione Negozi</span>
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">

        {/* --- SCHEDA PRODOTTI --- */}
        {activeTab === 'products' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 underline decoration-red-500 decoration-4 underline-offset-8">Catalogo Globale</h1>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 grid grid-cols-2 gap-4 relative">
              {editingProduct && <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><X size={24} /></button>}
              <h2 className="col-span-2 font-black text-red-600 uppercase italic text-sm tracking-widest mb-2">{editingProduct ? 'Modifica Liquido' : 'Inserisci Nuovo Liquido'}</h2>
              
              <input type="text" placeholder="Nome Liquido (es: Zio Adriano)" className="border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-2 ring-red-100 transition-all font-bold" 
                value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} />
              
              <input type="text" placeholder="Marca (es: Galactika)" className="border p-4 rounded-2xl bg-slate-50 outline-none focus:ring-2 ring-red-100 transition-all font-bold" 
                value={editingProduct ? editingProduct.brand : newProduct.brand} onChange={e => editingProduct ? setEditingProduct({...editingProduct, brand: e.target.value}) : setNewProduct({...newProduct, brand: e.target.value})} />
              
              <select className="border p-4 rounded-2xl bg-slate-50 font-bold outline-none" value={editingProduct ? editingProduct.category : newProduct.category} onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}>
                <option value="">Gusto (Categoria)</option>
                {categorieList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select className="border p-4 rounded-2xl bg-slate-50 font-bold outline-none" value={editingProduct ? editingProduct.formato : newProduct.formato} onChange={e => editingProduct ? setEditingProduct({...editingProduct, formato: e.target.value}) : setNewProduct({...newProduct, formato: e.target.value})}>
                <option value="">Formato Prodotto</option>
                {formatiList.map(f => <option key={f} value={f}>{f}</option>)}
              </select>

              <input type="text" placeholder="Nicotina (es: 0, 4, 8, 12)" className="border p-4 rounded-2xl bg-slate-50 outline-none font-bold" value={editingProduct ? (Array.isArray(editingProduct.nicotina) ? editingProduct.nicotina.join(', ') : editingProduct.nicotina) : newProduct.nicotina_input} onChange={e => editingProduct ? setEditingProduct({...editingProduct, nicotina: e.target.value}) : setNewProduct({...newProduct, nicotina_input: e.target.value})} />
              
              <input type="number" step="0.01" placeholder="Prezzo (€) Es: 19.90" className="border p-4 rounded-2xl bg-slate-50 outline-none font-bold" value={editingProduct ? editingProduct.prezzo : newProduct.prezzo} onChange={e => editingProduct ? setEditingProduct({...editingProduct, prezzo: e.target.value}) : setNewProduct({...newProduct, prezzo: e.target.value})} />
              
              <input type="text" placeholder="URL Immagine (Link Esterno)" className="border p-4 rounded-2xl bg-slate-50 col-span-2 outline-none" value={editingProduct ? editingProduct.image_url : newProduct.image_url} onChange={e => editingProduct ? setEditingProduct({...editingProduct, image_url: e.target.value}) : setNewProduct({...newProduct, image_url: e.target.value})} />
              
              <textarea placeholder="Note aromatiche / Descrizione gusto..." className="border p-4 rounded-2xl bg-slate-50 col-span-2 h-24 outline-none font-medium" value={editingProduct ? editingProduct.description : newProduct.description} onChange={e => editingProduct ? setEditingProduct({...editingProduct, description: e.target.value}) : setNewProduct({...newProduct, description: e.target.value})} />
              
              <button onClick={editingProduct ? handleUpdateProduct : handleAddProduct} className="col-span-2 bg-red-600 text-white p-5 rounded-2xl font-black uppercase shadow-xl hover:bg-red-700 transition-all italic tracking-widest shadow-red-100">
                {editingProduct ? 'Salva Modifiche' : 'Aggiungi al Catalogo'}
              </button>
            </div>

            {/* Lista con Ricerca */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-50 flex items-center gap-4 border-b">
                <Search className="text-slate-400" />
                <input type="text" placeholder="Cerca nel catalogo per nome o marca..." className="bg-transparent w-full outline-none font-bold text-lg" value={searchCatalog} onChange={e => setSearchCatalog(e.target.value)} />
              </div>
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5 flex items-center gap-4">
                        <img src={p.image_url} className="h-14 w-14 rounded-2xl object-cover border shadow-sm" alt="" />
                        <div>
                          <p className="font-black text-slate-800 italic uppercase leading-tight">{p.name}</p>
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{p.brand} | {p.formato}</p>
                        </div>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button onClick={() => setEditingProduct(p)} className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={20}/></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SCHEDA DISTRIBUZIONE (CON RICERCA) --- */}
        {activeTab === 'inventory' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">Distribuzione</h1>
            
            {/* Selettore Negozio */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {stores.map(s => (
                <button key={s.id} onClick={() => setSelectedStore(s.id)} className={`px-6 py-3 rounded-2xl font-black transition-all border-2 uppercase text-[10px] tracking-widest ${selectedStore === s.id ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-red-300'}`}>
                  {s.subtext}
                </button>
              ))}
            </div>

            {/* BARRA DI RICERCA NELLA DISTRIBUZIONE */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-4 focus-within:ring-2 ring-red-100 transition-all">
              <Search className="text-red-500 ml-2" size={24} />
              <input 
                type="text" 
                placeholder={`Cerca prodotti da attivare/disattivare per ${stores.find(s=>s.id===selectedStore)?.subtext}...`} 
                className="bg-transparent w-full outline-none font-bold text-lg placeholder:font-medium placeholder:text-slate-300"
                value={searchDistri}
                onChange={e => setSearchDistri(e.target.value)}
              />
            </div>

            {/* Griglia Prodotti */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredDistri.map(p => {
                const active = inventory.some(item => item.product_id === p.id && item.store_id === selectedStore && item.is_active);
                return (
                  <div 
                    key={p.id} 
                    onClick={() => toggleAvailability(p.id, selectedStore)} 
                    className={`p-5 rounded-[2.5rem] cursor-pointer border-2 transition-all flex flex-col justify-between h-44 shadow-sm relative group ${active ? 'bg-white border-green-500 ring-4 ring-green-50' : 'bg-white border-slate-100 opacity-60 hover:opacity-100'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 bg-gray-50 rounded-xl overflow-hidden border p-1 group-hover:scale-110 transition-transform">
                        <img src={p.image_url} className="h-full w-full object-contain" />
                      </div>
                      {active ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-slate-200" />}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-[11px] leading-tight italic uppercase line-clamp-2">{p.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{p.brand}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredDistri.length === 0 && <div className="text-center py-10 text-slate-400 italic font-bold">Nessun prodotto trovato per la distribuzione.</div>}
          </div>
        )}

        {/* --- SCHEDA GESTIONE NEGOZI --- */}
        {activeTab === 'stores' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 italic underline decoration-red-500 decoration-4 underline-offset-8">Punti Vendita</h1>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 grid grid-cols-2 gap-4 relative">
              {editingStore && <button onClick={() => setEditingStore(null)} className="absolute top-6 right-6 text-slate-400"><X size={24} /></button>}
              <h2 className="col-span-2 font-black text-red-600 uppercase italic text-sm tracking-widest mb-2">{editingStore ? 'Modifica Punto Vendita' : 'Configura Nuovo Negozio'}</h2>
              
              <input type="text" placeholder="Nome (Es: Smo-King)" className="border p-4 rounded-2xl bg-slate-50 font-bold" value={editingStore ? editingStore.name : newStore.name} onChange={e => editingStore ? setEditingStore({...editingStore, name: e.target.value}) : setNewStore({...newStore, name: e.target.value})} />
              
              <input type="text" placeholder="Sottotitolo / Luogo (Es: Gelsi)" className="border p-4 rounded-2xl bg-slate-50 font-bold italic" value={editingStore ? editingStore.subtext : newStore.subtext} onChange={e => editingStore ? setEditingStore({...editingStore, subtext: e.target.value}) : setNewStore({...newStore, subtext: e.target.value})} />
              
              <input type="text" placeholder="Slug URL (Es: gelsi)" className="border p-4 rounded-2xl bg-slate-50" value={editingStore ? editingStore.slug : newStore.slug} onChange={e => editingStore ? setEditingStore({...editingStore, slug: e.target.value}) : setNewStore({...newStore, slug: e.target.value})} />
              
              <input type="text" placeholder="URL Logo Negozio" className="border p-4 rounded-2xl bg-slate-50" value={editingStore ? editingStore.logo_url : newStore.logo_url} onChange={e => editingStore ? setEditingStore({...editingStore, logo_url: e.target.value}) : setNewStore({...newStore, logo_url: e.target.value})} />
              
              <input type="text" placeholder="Telefono" className="border p-4 rounded-2xl bg-slate-50" value={editingStore ? editingStore.phone : newStore.phone} onChange={e => editingStore ? setEditingStore({...editingStore, phone: e.target.value}) : setNewStore({...newStore, phone: e.target.value})} />
              
              <input type="text" placeholder="Indirizzo Completo" className="border p-4 rounded-2xl bg-slate-50" value={editingStore ? editingStore.address : newStore.address} onChange={e => editingStore ? setEditingStore({...editingStore, address: e.target.value}) : setNewStore({...newStore, address: e.target.value})} />
              
              <input type="text" placeholder="Link Google Review (URL)" className="border p-4 rounded-2xl bg-slate-50 col-span-2" value={editingStore ? editingStore.google_review_url : newStore.google_review_url} onChange={e => editingStore ? setEditingStore({...editingStore, google_review_url: e.target.value}) : setNewStore({...newStore, google_review_url: e.target.value})} />
              
              <button onClick={editingStore ? handleUpdateStore : handleAddStore} className="col-span-2 bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] italic hover:bg-slate-800 transition shadow-xl">
                {editingStore ? 'Salva Modifiche' : 'Crea Nuovo Negozio'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              {stores.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-200 flex justify-between items-center group hover:border-red-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-slate-50 rounded-full border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                      <img src={s.logo_url || 'https://via.placeholder.com/50'} className="object-contain w-full h-full" alt="logo" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl italic uppercase leading-none">{s.name} <span className="text-red-600 underline decoration-2 underline-offset-4">{s.subtext}</span></h3>
                      <p className="text-slate-400 font-bold text-[10px] mt-2 tracking-widest uppercase italic">{s.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setEditingStore(s)} className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={20}/></button>
                    <button onClick={async () => {if(confirm('Eliminare negozio e tutte le sue impostazioni?')){await supabase.from('vape_stores').delete().eq('id', s.id); fetchData();}}} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}