import { useState } from 'react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Package, ArrowRight, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // 1. Connexion Auth
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !user) {
      setErrorMsg("Identifiants incorrects ou compte inexistant.");
      setLoading(false);
      return;
    }

    // 2. Vérification du Rôle
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    setLoading(false);

    // 3. Redirection Intelligente
    if (profile?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* PARTIE GAUCHE : BRANDING (Masquée sur mobile, visible sur Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Décoration de fond (Cercle flou) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]"></div>
            <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 blur-[100px]"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Package className="w-10 h-10 text-blue-400" />
          <h1 className="text-3xl font-black tracking-wider">WMS OPTIMA</h1>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-tight mb-6">
            La logistique de demain, <br/><span className="text-blue-400">aujourd'hui.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Gérez vos entrepôts, suivez vos stocks en temps réel et optimisez vos flux grâce à notre solution SaaS 3PL.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Supervision Multi-Sites
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Facturation Automatisée
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Traçabilité Complète
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} WMS Optima. Tous droits réservés.
        </div>
      </div>

      {/* PARTIE DROITE : FORMULAIRE DE CONNEXION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        
        {/* Logo version Mobile uniquement */}
        <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
          <Package className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-black text-slate-900">WMS OPTIMA</span>
        </div>

        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Bienvenue</h2>
            <p className="text-sm text-slate-500">Veuillez vous connecter à votre espace.</p>
          </div>

          {/* MESSAGE D'ERREUR */}
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* INPUT EMAIL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="admin@wms.com ou client@societe.com"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* INPUT PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">Mot de passe</label>
                <a href="#" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* BOUTON SUBMIT */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
          </form>

          {}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Système d'Authentification Sécurisé WMS
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
