import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Store, LogIn, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error al intentar iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 max-w-md w-full">
        <div className="flex items-center gap-2 justify-center font-bold text-2xl text-indigo-600 mb-6">
          <Store size={32} />
          <span>ShopApp</span>
        </div>

        <h2 className="text-xl font-bold text-slate-800 text-center mb-6">Iniciar Sesión</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : (
              <>
                <LogIn size={18} /> Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600 mb-2">¿No tienes una cuenta registrada?</p>
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-600 font-semibold hover:underline text-sm inline-flex items-center gap-1"
          >
            Registrar mi Empresa <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};