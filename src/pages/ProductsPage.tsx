import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { type Product } from '../types';
import { Plus, Package, ArrowLeft, Trash2, Edit2, X, Check } from 'lucide-react';

export const ProductsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para la edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const q = query(
      collection(db, 'products'),
      where('companyId', '==', userProfile.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(items);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        companyId: userProfile.companyId,
        name,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category: category || 'General',
        createdAt: new Date().toISOString(),
      });

      setName('');
      setPrice('');
      setStock('');
      setCategory('');
    } catch (error) {
      console.error("Error guardando producto:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (p: Product) => {
    setEditingId(p.id!);
    setEditName(p.name);
    setEditPrice(p.price.toString());
    setEditStock(p.stock.toString());
    setEditCategory(p.category);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdateProduct = async (id: string) => {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        name: editName,
        price: parseFloat(editPrice),
        stock: parseInt(editStock, 10),
        category: editCategory || 'General',
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error actualizando producto:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto del inventario?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error("Error eliminando producto:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 font-medium mb-6 hover:underline"
      >
        <ArrowLeft size={18} /> Volver al Dashboard
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario de Registro de Producto */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-indigo-600" /> Nuevo Producto
          </h2>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Stock</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Categoría</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </form>
        </div>

        {/* Lista de Productos */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-indigo-600" /> Inventario de Productos
          </h2>

          {products.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No hay productos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                  <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Precio</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      {editingId === p.id ? (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full p-1 border rounded text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full p-1 border rounded text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-20 p-1 border rounded text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-16 p-1 border rounded text-xs"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleUpdateProduct(p.id!)}
                                className="p-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-medium text-slate-800">{p.name}</td>
                          <td className="p-3">{p.category}</td>
                          <td className="p-3">${p.price.toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditing(p)}
                                className="text-indigo-600 hover:text-indigo-800 p-1"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id!)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};