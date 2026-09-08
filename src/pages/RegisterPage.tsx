import React, { useState } from 'react';
import { registerCompanyAndAdmin } from '../services/authService';
import { Building2 } from 'lucide-react';

export const RegisterPage: React.FC<{ onSwitchToLogin?: () => void }> = ({ onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    nit: '',
    phone: '',
    email: '',
    address: '',
    businessType: 'retail' as 'retail' | 'restaurant' | 'services',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerCompanyAndAdmin(formData);
      alert('¡Empresa y Administrador registrados con éxito!');
    } catch (err: any) {
      setError(err.message || 'Error al registrar la empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Building2 className="text-indigo-600" />
          Registro de Empresa en ShopApp
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-slate-700 text-lg border-b pb-1">Datos de la Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Nombre de la Empresa</label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">NIT / Identificación</label>
              <input
                type="text"
                name="nit"
                required
                value={formData.nit}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Teléfono</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Tipo de Negocio</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="retail">Comercio / Retail</option>
                <option value="restaurant">Restaurante / Comida</option>
                <option value="services">Servicios</option>
              </select>
            </div>
          </div>

          <h3 className="font-semibold text-slate-700 text-lg border-b pb-1 pt-2">Administrador del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Nombre Completo</label>
              <input
                type="text"
                name="adminName"
                required
                value={formData.adminName}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Correo Electrónico</label>
              <input
                type="email"
                name="adminEmail"
                required
                value={formData.adminEmail}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600">Contraseña</label>
              <input
                type="password"
                name="adminPassword"
                required
                minLength={6}
                value={formData.adminPassword}
                onChange={handleChange}
                className="w-full border rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-slate-400"
          >
            {loading ? 'Registrando...' : 'Crear Empresa y Administrador'}
          </button>
        </form>

        {onSwitchToLogin && (
          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600 mb-2">¿Ya tienes una empresa registrada?</p>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-indigo-600 font-semibold hover:underline text-sm inline-flex items-center gap-1"
            >
              Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};