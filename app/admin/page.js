"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Store, Package, CheckCircle2, XCircle, Search, Edit3, X } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [searchDistri, setSearchDistri] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
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

  async function toggleAvailability(prodId, storeId) {
    const existing = inventory.find(item => item.product_id === prodId && item.store_id === storeId);
    if (existing) {
      await supabase.from('vape_inventory').update({ is_active: !existing.is_active }).match({ product_id: prodId, store_id: storeId });
    } else {
      await supabase.from('vape_inventory').insert([{ product_id: prodId, store_id: storeId, is_active: true }]);
    }
    fetchData();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <nav className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-4">
        <h2 className="text-xl font-black text-red-500 italic uppercase">Smo-King Admin</h2>
        <button onClick={() => setActiveTab('products')} className={`p-3 rounded-xl text-left ${activeTab === 'products' ? 'bg-red-600' : 'hover:bg-slate-800'}`}>Catalogo</button>
        <button onClick={() => setActiveTab('inventory')} className={`p-3 rounded-xl text-left ${activeTab === 'inventory' ? 'bg-red-600' : 'hover:bg-slate-800'}`}>Distribuzione</button>
        <button onClick={() => setActiveTab('stores')} className={`p-3 rounded-xl text-left ${activeTab === 'stores' ? 'bg-red-600' : 'hover:bg-slate-800'}`}>Negozi</button>
      </nav>
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm grid grid-cols-2 gap-3 relative">
              {editingProduct && <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4"><X/></button>}
              <input type="text" placeholder="Nome" className="border p-3 rounded-xl" value={editingProduct ? editingProduct.name : newProduct.name} onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} />
              <input type="text" placeholder="Marca" className="border p-3 rounded-xl" value={editingProduct ? editingProduct.brand : newProduct.brand} onChange={e => editingProduct ? setEditingProduct({...editingProduct, brand: e.target.value}) : setNewProduct({...newProduct, brand: e.target.value})} />
              <button onClick={editingProduct ? handleUpdateProduct : handleAddProduct} className="col-span-2 bg-red-600 text-white p-3 rounded-xl font-bold uppercase">{editingProduct ? 'Salva' : 'Aggiungi'}</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <input type="text" placeholder="Cerca..." className="p-4 w-full border-b outline-none" onChange={e => setSearch(e.target.value)} />
                <table className="w-full text-left">
                    <tbody>{products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-bold">{p.name} <span className="text-xs text-red-500 block uppercase">{p.brand}</span></td>
                            <td className="p-4 text-right"><button onClick={() => setEditingProduct(p)} className="text-blue-500 mr-2"><Edit3 size={18}/></button></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
          </div>
        )}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
                {stores.map(s => <button key={s.id} onClick={() => setSelectedStore(s.id)} className={`px-4 py-2 rounded-xl border-2 whitespace-nowrap font-bold ${selectedStore === s.id ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-500'}`}>{s.subtext}</button>)}
            </div>
            <input type="text" placeholder="Cerca prodotto da attivare..." className="p-4 w-full rounded-xl border outline-none shadow-sm" onChange={e => setSearchDistri(e.target.value)} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.filter(p => p.name.toLowerCase().includes(searchDistri.toLowerCase())).map(p => {
                    const active = inventory.some(item => item.product_id === p.id && item.store_id === selectedStore && item.is_active);
                    return <div key={p.id} onClick={() => toggleAvailability(p.id, selectedStore)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${active ? 'border-green-500 bg-white ring-2 ring-green-100' : 'border-gray-100 opacity-50'}`}>
                        <p className="font-bold text-sm leading-tight">{p.name}</p>
                        <p className="text-[10px] uppercase text-slate-400">{p.brand}</p>
                    </div>
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}