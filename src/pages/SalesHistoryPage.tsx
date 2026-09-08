import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { type Sale } from '../types';
import { ArrowLeft, History, DollarSign, Calendar } from 'lucide-react';

export const SalesHistoryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userProfile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const q = query(
      collection(db, 'sales'),
      where('companyId', '==', userProfile.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Sale[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Sale);
      });
      // Ordenar localmente por fecha descendente
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSales(items);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId]);

  const grandTotal = sales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 font-medium mb-6 hover:underline"
      >
        <ArrowLeft size={18} /> Volver al Dashboard
      </button>

      {/* Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <History size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Transacciones Totales</p>
            <h3 className="text-2xl font-bold text-slate-800">{sales.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Ingresos Acumulados</p>
            <h3 className="text-2xl font-bold text-slate-800">${grandTotal.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-indigo-600" /> Registro de Transacciones
        </h2>

        {sales.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No hay ventas registradas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                <tr>
                  <th className="p-3">ID Venta</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Ítems</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs font-semibold text-slate-700">
                      {s.id}
                    </td>
                    <td className="p-3">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <ul className="list-disc list-inside text-xs text-slate-600">
                        {s.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} x{item.quantity} (${item.price.toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3 text-right font-bold text-indigo-600">
                      ${s.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};