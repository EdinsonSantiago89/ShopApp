import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import {  type UserProfile } from '../types';
import { createEmployee } from '../services/userService';
import { Users, UserPlus, ArrowLeft, ShieldCheck, User } from 'lucide-react';

export const UsersPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userProfile } = useAuth();
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'cashier'>('cashier');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const q = query(
      collection(db, 'users'),
      where('companyId', '==', userProfile.companyId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((doc) => list.push(doc.data() as UserProfile));
      setTeam(list);
    });

    return () => unsub();
  }, [userProfile?.companyId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId) return;
    setLoading(true);
    setMsg('');

    try {
      await createEmployee(email, password, name, role, userProfile.companyId);
      setName('');
      setEmail('');
      setPassword('');
      setMsg('Empleado creado exitosamente.');
    } catch (err: any) {
      setMsg('Error al registrar empleado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-medium mb-6 hover:underline">
        <ArrowLeft size={18} /> Volver al Dashboard
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-600" /> Registrar Empleado
          </h2>

          {msg && <p className="mb-4 text-xs font-semibold text-indigo-600 bg-indigo-50 p-2 rounded">{msg}</p>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Contraseña Providencial</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Rol asignado</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'cashier')}
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
              >
                <option value="cashier">Cajero</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Registrando...' : 'Guardar Empleado'}
            </button>
          </form>
        </div>

        {/* Listado de Personal */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-indigo-600" /> Equipo de Trabajo
          </h2>

          <div className="divide-y divide-slate-100">
            {team.map((m) => (
              <div key={m.uid} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-full text-slate-600">
                    {m.role === 'admin' ? <ShieldCheck size={20} className="text-indigo-600" /> : <User size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  m.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {m.role === 'admin' ? 'Administrador' : 'Cajero'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};