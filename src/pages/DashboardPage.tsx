import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { LogOut, Store, Users, ShoppingCart, Package, History } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ProductsPage } from './ProductsPage';
import { PosPage } from './PosPage';
import { SalesHistoryPage } from './SalesHistoryPage';

export const DashboardPage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'pos' | 'history'>('dashboard');
  const [productCount, setProductCount] = useState<number>(0);
  const [todaySalesTotal, setTodaySalesTotal] = useState<number>(0);
  const [salesChartData, setSalesChartData] = useState<{ date: string; total: number }[]>([]);

  useEffect(() => {
    if (!userProfile?.companyId) return;

  // Escuchar conteo de productos
  const qProd = query(collection(db, 'products'), where('companyId', '==', userProfile.companyId));
  const unsubProd = onSnapshot(qProd, (snap) => setProductCount(snap.size));

  // Escuchar ventas y filtrar el día de hoy localmente
  const qSales = query(
    collection(db, 'sales'),
    where('companyId', '==', userProfile.companyId)
  );

    const unsubSales = onSnapshot(qSales, (snap) => {
      const today = new Date().toDateString();
      const salesMap: { [key: string]: number } = {};
      let sum = 0;

      snap.forEach((doc) => {
        const saleData = doc.data();
        if (saleData.createdAt) {
          const saleDate = new Date(saleData.createdAt).toDateString();
          if (saleDate === today) {
            sum += saleData.total || 0;
          }

          const dateStr = new Date(saleData.createdAt).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
          });
          salesMap[dateStr] = (salesMap[dateStr] || 0) + (saleData.total || 0);
        }
      });

      setTodaySalesTotal(sum);
      setSalesChartData(
        Object.keys(salesMap).map((date) => ({
          date,
          total: salesMap[date],
        }))
      );
    });

    return () => {
      unsubProd();
      unsubSales();
    };
  }, [userProfile?.companyId]);

  if (currentView === 'products') return <ProductsPage onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'pos') return <PosPage onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'history') return <SalesHistoryPage onBack={() => setCurrentView('dashboard')} />;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Store />
          <span>ShopApp</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-indigo-700 px-3 py-1 rounded-full">
            {userProfile?.name} ({userProfile?.role})
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl w-full mx-auto flex-1">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Panel de Control</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Ventas Hoy</p>
                <h3 className="text-lg font-bold text-slate-800">${todaySalesTotal.toFixed(2)}</h3>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('pos')}
              className="bg-indigo-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Vender
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Productos</p>
                <h3 className="text-lg font-bold text-slate-800">{productCount}</h3>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('products')}
              className="bg-indigo-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ver &rarr;
            </button>
          </div>

          {userProfile?.role === 'admin' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                  <History size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Historial</p>
                  <h3 className="text-lg font-bold text-slate-800">Ventas</h3>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('history')}
                className="bg-purple-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reportes
              </button>
            </div>
          )}

          {userProfile?.role === 'admin' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Gestión de Personal</p>
                <p className="text-lg font-bold text-slate-800">Equipo</p>
              </div>
              <button
                onClick={() => setCurrentView('history')}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700"
              >
                Administrar
              </button>
            </div>
          )}

          {userProfile?.role !== 'admin' && (
            <div className="bg-slate-100 p-6 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-sm text-slate-500">
              Sin permisos administrativos
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500">ID Empresa</p>
              <h3 className="text-xs font-mono font-bold text-slate-700 truncate max-w-[120px]">
                {userProfile?.companyId}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Ventas Recientes</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};