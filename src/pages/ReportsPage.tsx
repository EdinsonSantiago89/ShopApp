import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { type Sale } from '../types';
import { ArrowLeft, Download, Filter, Calendar } from 'lucide-react';
import { Parser } from 'json2csv';

export const ReportsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userProfile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const q = query(
      collection(db, 'sales'),
      where('companyId', '==', userProfile.companyId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: Sale[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Sale);
      });

      // Ordenar por fecha descendente
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSales(list);
    });

    return () => unsub();
  }, [userProfile?.companyId]);

  // Aplicar filtros según el período seleccionado
  useEffect(() => {
    const now = new Date();
    
    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);

      if (filterPeriod === 'today') {
        return saleDate.toDateString() === now.toDateString();
      }

      if (filterPeriod === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return saleDate >= startOfWeek;
      }

      if (filterPeriod === 'month') {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      }

      return true; // 'all'
    });

    setFilteredSales(filtered);
  }, [sales, filterPeriod]);

  // Función para exportar los datos filtrados a un archivo CSV
  const exportToCSV = () => {
    if (filteredSales.length === 0) return;

    try {
      const dataToExport = filteredSales.map((s) => ({
        ID_Venta: s.id,
        Fecha_Hora: new Date(s.createdAt).toLocaleString(),
        Items: s.items.map((i) => `${i.name} (x${i.quantity})`).join(' | '),
        Total: s.total,
      }));

      const parser = new Parser({ fields: ['ID_Venta', 'Fecha_Hora', 'Items', 'Total'] });
      const csv = parser.parse(dataToExport);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Ventas_${filterPeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al exportar CSV:', err);
    }
  };

  const totalFilteredSales = filteredSales.reduce((acc, curr) => acc + (curr.total || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-medium mb-6 hover:underline">
        <ArrowLeft size={18} /> Volver al Dashboard
      </button>

      {/* Cabecera y Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Historial de Ventas</h1>
          <p className="text-xs text-slate-500">Gestiona y exporta el registro detallado de transacciones</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Filtros */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm text-sm">
            <Filter size={16} className="text-slate-400 ml-1" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 outline-none pr-2"
            >
              <option value="all">Todas las ventas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>

          {/* Botón Exportar */}
          <button
            onClick={exportToCSV}
            disabled={filteredSales.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Download size={16} /> Exportar Excel / CSV
          </button>
        </div>
      </div>

      {/* Resumen del Filtro Actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Transacciones Filtradas</p>
            <p className="text-xl font-bold text-slate-800">{filteredSales.length}</p>
          </div>
          <Calendar className="text-indigo-600" size={24} />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Total Recaudado (Filtro)</p>
            <p className="text-xl font-bold text-emerald-600">${totalFilteredSales.toFixed(2)}</p>
          </div>
          <span className="text-2xl font-bold text-emerald-600">$</span>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No se encontraron ventas para el rango de fechas seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                <tr>
                  <th className="p-4">ID Venta</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Ítems</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-xs text-slate-500">{sale.id}</td>
                    <td className="p-4 text-xs">{new Date(sale.createdAt).toLocaleString()}</td>
                    <td className="p-4 text-xs">
                      <ul className="list-disc list-inside">
                        {sale.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} x{item.quantity} (${(item.price * item.quantity).toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 font-bold text-indigo-600 text-right">${sale.total.toFixed(2)}</td>
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