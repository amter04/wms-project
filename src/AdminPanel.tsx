import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  Users, MapPin, Box, ShieldCheck, Activity, Grid, 
  PlusCircle, Building2, Calculator, Trash2, Bell, 
  CheckCircle, AlertOctagon, Tag 
} from 'lucide-react';
import { generateRegistrationDoc } from './utils/pdfGenerator';

export default function AdminPanel() {
  const [clients, setClients] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]); // Catalogue
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sites' | 'clients' | 'catalog'>('sites');
  const [showNotifs, setShowNotifs] = useState(false);
  
  // FORMULAIRE CATALOGUE
  const [artName, setArtName] = useState('');
  const [artSku, setArtSku] = useState('');

  // ... (Garde tes autres états : companyName, newWhName, etc.)
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [newWhName, setNewWhName] = useState('');
  const [newWhRows, setNewWhRows] = useState(3);
  const [newWhCols, setNewWhCols] = useState(4);
  const [newWhPrice, setNewWhPrice] = useState(300);

  const navigate = useNavigate();

  useEffect(() => { checkAdminAndLoadData(); }, []);

  const fetchData = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*, warehouses(name)');
    const { data: wh } = await supabase.from('warehouses').select('*').order('name');
    const { data: notifs } = await supabase.from('notifications').select('*').eq('is_read', false).order('created_at', { ascending: false });
    const { data: arts } = await supabase.from('articles').select('*').order('name');

    setClients(profiles || []);
    setWarehouses(wh || []);
    setNotifications(notifs || []);
    setArticles(arts || []);
    setLoading(false);
  };

  const checkAdminAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/');
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return navigate('/dashboard');
    fetchData();
  };

  // --- ACTION : AJOUTER AU CATALOGUE ---
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artName || !artSku) return;

    const { error } = await supabase.from('articles').insert({ name: artName, sku: artSku });
    if (error) alert("Erreur : SKU probablement déjà utilisé.");
    else {
      setArtName(''); setArtSku('');
      alert("Article ajouté au catalogue général !");
      fetchData();
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Supprimer cet article du catalogue ?")) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) alert("Impossible de supprimer : l'article est sans doute déjà en stock chez un client.");
    else fetchData();
  };

  // ... (Garde tes fonctions handleCreateWarehouse, handleCreateClient, handleAcceptResiliationFromNotif)
  const handleAcceptResiliationFromNotif = async (notif: any) => {
    const confirmRevoke = window.confirm(`Voulez-vous vraiment accepter la résiliation de "${notif.company_name}" ?`);
    if (!confirmRevoke) return;
    await supabase.from('profiles').update({ warehouse_id: null, zone: null }).eq('id', notif.client_id);
    await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
    fetchData();
  };

  const handleMarkNotifAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    fetchData();
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('warehouses').insert({ name: newWhName, total_rows: newWhRows, total_columns: newWhCols, base_price: newWhPrice });
    setNewWhName(''); fetchData();
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: newEmail, password: newPassword });
    if (authError) return alert(authError.message);
    setTimeout(async () => {
      await supabase.from('profiles').update({ warehouse_id: selectedWarehouseId, zone: selectedZone, role: 'client', company_name: companyName, full_name: fullName, phone: phone }).eq('id', authData.user!.id);
      fetchData();
    }, 1000);
  };

  const handleRevokeContract = async (id: string, name: string) => {
    if (window.confirm(`Résilier ${name} ?`)) {
      await supabase.from('profiles').update({ warehouse_id: null, zone: null }).eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <header className="bg-slate-900 text-white shadow-lg h-20 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <h1 className="text-xl font-bold tracking-wider">ADMIN WMS</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2">
              <Bell className="w-6 h-6 text-slate-300" />
              {notifications.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-[10px] px-1.5 rounded-full">{notifications.length}</span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-xl text-slate-900 border overflow-hidden">
                <div className="p-3 bg-slate-50 font-bold border-b text-sm">Alertes</div>
                {notifications.map(n => (
                  <div key={n.id} className="p-3 border-b text-xs">
                    <p className="font-bold">{n.company_name}</p>
                    <p className="text-slate-500 mb-2">{n.message}</p>
                    <button onClick={() => handleAcceptResiliationFromNotif(n)} className="text-red-600 font-bold">Valider résiliation</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => {supabase.auth.signOut(); navigate('/')}} className="bg-red-600 px-4 py-2 rounded text-sm font-bold">Sortir</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ONGLES DE NAVIGATION */}
        <div className="flex gap-4 mb-8 bg-white p-2 rounded-lg shadow-sm">
          <button onClick={() => setActiveTab('sites')} className={`flex-1 py-3 rounded-md font-bold text-sm transition ${activeTab === 'sites' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Gestion Sites</button>
          <button onClick={() => setActiveTab('clients')} className={`flex-1 py-3 rounded-md font-bold text-sm transition ${activeTab === 'clients' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Clients & Contrats</button>
          <button onClick={() => setActiveTab('catalog')} className={`flex-1 py-3 rounded-md font-bold text-sm transition ${activeTab === 'catalog' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Catalogue Articles</button>
        </div>

        {/* CONTENU : GESTION SITES */}
        {activeTab === 'sites' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Grid className="w-5 h-5" /> Nouveau Site</h2>
              <form onSubmit={handleCreateWarehouse} className="space-y-4">
                <input required className="w-full border p-2 rounded text-sm" placeholder="Nom du site" value={newWhName} onChange={e => setNewWhName(e.target.value)} />
                <div className="flex gap-2">
                  <input type="number" className="flex-1 border p-2 rounded text-sm" placeholder="Allées" value={newWhRows} onChange={e => setNewWhRows(Number(e.target.value))} />
                  <input type="number" className="flex-1 border p-2 rounded text-sm" placeholder="Places" value={newWhCols} onChange={e => setNewWhCols(Number(e.target.value))} />
                </div>
                <input type="number" className="w-full border p-2 rounded text-sm" placeholder="Prix base" value={newWhPrice} onChange={e => setNewWhPrice(Number(e.target.value))} />
                <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold">Créer</button>
              </form>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {warehouses.map(w => (
                <div key={w.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="font-bold">{w.name}</p>
                  <p className="text-xs text-slate-500">{w.total_rows * w.total_columns} emplacements | {w.base_price}€/mois</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENU : CLIENTS */}
        {activeTab === 'clients' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Building2 className="w-5 h-5" /> Inscrire un Client</h2>
              <form onSubmit={handleCreateClient} className="grid grid-cols-2 gap-4">
                <input required className="border p-2 rounded text-sm" placeholder="Société" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                <input required className="border p-2 rounded text-sm" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <input required className="border p-2 rounded text-sm" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <select className="border p-2 rounded text-sm" value={selectedWarehouseId} onChange={e => setSelectedWarehouseId(e.target.value)}>
                  <option value="">-- Choisir Site --</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <input className="border p-2 rounded text-sm" placeholder="Zone (ex: A1)" value={selectedZone} onChange={e => setSelectedZone(e.target.value)} />
                <button className="bg-blue-600 text-white rounded font-bold">Valider Contrat</button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50">
                  <tr><th className="p-4">Client</th><th className="p-4">Site</th><th className="p-4">Zone</th><th className="p-4 text-right">Action</th></tr>
                </thead>
                <tbody>
                  {clients.filter(c => c.warehouse_id).map(c => (
                    <tr key={c.id} className="border-t">
                      <td className="p-4 font-bold">{c.company_name}</td>
                      <td className="p-4">{c.warehouses?.name}</td>
                      <td className="p-4"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">{c.zone}</span></td>
                      <td className="p-4 text-right"><button onClick={() => handleRevokeContract(c.id, c.company_name)} className="text-red-600"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENU : CATALOGUE (MODIFICATION ICI) */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-emerald-500">
              <h2 className="font-bold mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-emerald-600" /> Ajouter au Catalogue</h2>
              <p className="text-xs text-slate-500 mb-4">Créez des références globales que vos clients pourront ensuite ajouter à leur stock personnel.</p>
              <form onSubmit={handleCreateArticle} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Désignation Produit</label>
                  <input required className="w-full border p-2 rounded text-sm" placeholder="Ex: iPhone 15 Pro Max" value={artName} onChange={e => setArtName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Code SKU / Barres</label>
                  <input required className="w-full border p-2 rounded text-sm font-mono" placeholder="Ex: 190199000123" value={artSku} onChange={e => setArtSku(e.target.value)} />
                </div>
                <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                  <PlusCircle size={18} /> Enregistrer l'article
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 bg-slate-50 border-b font-bold text-sm">Références Actives ({articles.length})</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase">
                    <tr><th className="p-4">Désignation</th><th className="p-4">Code SKU</th><th className="p-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {articles.map(art => (
                      <tr key={art.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-700">{art.name}</td>
                        <td className="p-4 font-mono text-xs text-slate-500">{art.sku}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteArticle(art.id)} className="text-slate-300 hover:text-red-600 transition">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {articles.length === 0 && (
                      <tr><td colSpan={3} className="p-10 text-center text-slate-400 italic">Le catalogue est vide.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

