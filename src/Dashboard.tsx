import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  LogOut, 
  FileText, 
  History, 
  PieChart as PieChartIcon, 
  MailWarning, 
  Download, 
  PlusCircle, 
  Search
} from 'lucide-react';
import { generateExitSlip } from './utils/pdfGenerator';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');

  // États pour les Modales
  const [showOutModal, setShowOutModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  
  // État Sortie
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [outQuantity, setOutQuantity] = useState(1);
  const [outReference, setOutReference] = useState('');

  // État Ajout (Catalogue)
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState('');
  const [initialQty, setInitialQty] = useState('0');

  const navigate = useNavigate();

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/');

    const { data: prof } = await supabase.from('profiles').select('*, warehouses(name)').eq('id', user.id).single();
    if (prof?.role === 'admin') return navigate('/admin');
    
    setProfile({ ...prof, email: user.email });
    if (prof?.warehouse_id) {
      fetchData(prof.warehouse_id);
    } else {
      setLoading(false);
    }
  };

  const fetchData = async (warehouseId: string) => {
    const { data: inv } = await supabase.from('inventory').select('*, articles(*)').eq('warehouse_id', warehouseId).order('quantity', { ascending: true });
    const { data: mov } = await supabase.from('movements').select('*').eq('warehouse_id', warehouseId).order('created_at', { ascending: false });
    setInventory(inv || []);
    setMovements(mov || []);
    setLoading(false);
  };

  const fetchCatalog = async () => {
    const { data } = await supabase.from('articles').select('*').order('name');
    setCatalog(data || []);
  };

  // --- ACTIONS ---

  const handleAddProductToStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatalogItem) return;

    const { error } = await supabase.from('inventory').insert({
      warehouse_id: profile.warehouse_id,
      article_id: selectedCatalogItem,
      quantity: parseInt(initialQty) || 0
    });

    if (error) {
      if (error.code === '23505') alert("Cet article est déjà présent dans votre inventaire.");
      else alert("Erreur : " + error.message);
    } else {
      alert("Article ajouté avec succès.");
      setShowAddStockModal(false);
      fetchData(profile.warehouse_id);
    }
  };

  const handleStockOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (outQuantity > selectedItem.quantity) {
      alert("Erreur : Stock insuffisant."); return;
    }

    const newQuantity = selectedItem.quantity - outQuantity;
    await supabase.from('inventory').update({ quantity: newQuantity }).eq('id', selectedItem.id);

    const { data: newMov } = await supabase.from('movements').insert({
      warehouse_id: profile.warehouse_id,
      article_name: selectedItem.articles.name,
      sku: selectedItem.articles.sku,
      type: 'OUT',
      quantity: outQuantity,
      reference: outReference,
      operator_email: profile.email
    }).select().single();

    generateExitSlip({
      id: newMov?.id || 'ID',
      warehouseName: profile.warehouses?.name || 'Inconnu',
      articleName: selectedItem.articles.name,
      sku: selectedItem.articles.sku,
      quantity: outQuantity,
      clientReference: outReference,
      date: new Date().toLocaleDateString('fr-FR'),
      userEmail: profile.email
    });

    setShowOutModal(false);
    fetchData(profile.warehouse_id);
  };

  const handleRequestResiliation = async () => {
    const confirm = window.confirm("Envoyer une demande de résiliation à l'administrateur ?");
    if (confirm) {
      await supabase.from('notifications').insert({
        client_id: profile.id,
        company_name: profile.company_name,
        type: 'RESILIATION',
        message: `Demande de résiliation pour la zone ${profile.zone}.`
      });
      alert("Demande envoyée.");
    }
  };

  // Graphique
  const chartData = inventory.map(item => ({
    name: item.articles.name,
    value: item.quantity
  }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">{profile?.company_name || 'Espace Client'}</h1>
              <p className="text-xs text-blue-200">Site : {profile?.warehouses?.name} | Zone : {profile?.zone}</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={handleRequestResiliation} className="text-blue-300 hover:text-white text-xs flex items-center gap-1 transition">
              <MailWarning className="w-4 h-4" /> Résiliation
            </button>
            <button onClick={() => {supabase.auth.signOut(); navigate('/')}} className="bg-red-500 px-4 py-2 rounded font-bold text-sm">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* DASHBOARD TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-red-500">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Stock Faible
            </h2>
            <div className="space-y-2">
              {inventory.filter(i => i.quantity <= 10).map(i => (
                <div key={i.id} className="flex justify-between bg-red-50 p-2 rounded text-xs">
                  <span className="font-bold">{i.articles.name}</span>
                  <span className="text-red-700">{i.quantity} u.</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-64">
            <h2 className="text-sm font-bold text-slate-700 mb-2">Volume par Référence</h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INVENTAIRE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b bg-slate-50">
            <button onClick={() => setActiveTab('stock')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'stock' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Inventaire</button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-sm font-bold ${activeTab === 'history' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Historique</button>
          </div>

          <div className="p-6">
            {activeTab === 'stock' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-700">Stock en zone</h3>
                  <button 
                    onClick={() => { fetchCatalog(); setShowAddStockModal(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Nouvel Article
                  </button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr><th className="px-6 py-3">SKU</th><th className="px-6 py-3">Produit</th><th className="px-6 py-3">Quantité</th><th className="px-6 py-3 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id} className="border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs">{item.articles.sku}</td>
                        <td className="px-6 py-4 font-bold">{item.articles.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${item.quantity <= 10 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{item.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setSelectedItem(item); setShowOutModal(true); }} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Sortir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === 'history' && (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Produit</th><th className="px-6 py-3">Réf</th><th className="px-6 py-3 text-right">Doc</th></tr>
                </thead>
                <tbody>
                  {movements.map(mov => (
                    <tr key={mov.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4 text-xs">{new Date(mov.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-orange-600 text-xs">{mov.type}</td>
                      <td className="px-6 py-4">{mov.article_name}</td>
                      <td className="px-6 py-4 italic text-slate-500">{mov.reference}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => generateExitSlip({...mov, warehouseName: profile.warehouses.name, date: new Date(mov.created_at).toLocaleDateString()})} className="text-blue-600"><Download size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* MODALE SORTIE */}
      {showOutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Sortie de Stock : {selectedItem.articles.name}</h2>
            <form onSubmit={handleStockOut} className="space-y-4">
              <input type="number" min="1" max={selectedItem.quantity} required className="w-full border rounded p-2" value={outQuantity} onChange={e => setOutQuantity(parseInt(e.target.value))} />
              <input type="text" placeholder="Référence commande" required className="w-full border rounded p-2" value={outReference} onChange={e => setOutReference(e.target.value)} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowOutModal(false)} className="flex-1 bg-slate-100 py-2 rounded font-bold">Annuler</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE AJOUT CATALOGUE */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Initialiser un nouvel article</h2>
            <form onSubmit={handleAddProductToStock} className="space-y-4">
              <select required className="w-full border rounded p-2 text-sm" value={selectedCatalogItem} onChange={e => setSelectedCatalogItem(e.target.value)}>
                <option value="">-- Choisir un produit du catalogue --</option>
                {catalog.map(item => <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>)}
              </select>
              <input type="number" placeholder="Quantité initiale" className="w-full border rounded p-2" value={initialQty} onChange={e => setInitialQty(e.target.value)} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddStockModal(false)} className="flex-1 bg-slate-100 py-2 rounded font-bold">Annuler</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded font-bold">Ajouter au stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}