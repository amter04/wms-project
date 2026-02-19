import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard'; // Ton tableau de bord Client
import AdminPanel from './AdminPanel'; // Le nouveau tableau Admin

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Route Client */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Route Admin (Protégée) */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}