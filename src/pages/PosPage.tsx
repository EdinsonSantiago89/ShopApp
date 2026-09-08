import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { type Product, type SaleItem } from '../types';
import { ArrowLeft, ShoppingCart, Trash2, CheckCircle } from 'lucide-react';

export const PosPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { userProfile, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!userProfile?.companyId) return;

    const q = query(
      collection(db, 'products'),
      where('companyId', '==', userProfile.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as Product);
      });
      setProducts(items);
    });

    return () => unsubscribe();
  }, [userProfile?.companyId]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prevCart;
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: product.id!,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const generateReceiptPDF = (saleId: string, items: SaleItem[], total: number) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 150],
    });

    doc.setFontSize(12);
    doc.text('ShopApp - Comprobante', 40, 10, { align: 'center' });

    doc.setFontSize(8);
    doc.text(`Empresa: ${userProfile?.name || 'Comercio'}`, 5, 18);
    doc.text(`Ticket #: ${saleId.substring(0, 8)}`, 5, 22);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, 26);
    doc.text('------------------------------------------------', 5, 30);

    let y = 35;
    items.forEach((item) => {
      doc.text(`${item.name} x${item.quantity}`, 5, y);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 75, y, { align: 'right' });
      y += 5;
    });

    doc.text('------------------------------------------------', 5, y);
    y += 5;
    doc.setFontSize(10);
    doc.text(`TOTAL: $${total.toFixed(2)}`, 75, y, { align: 'right' });

    doc.output('dataurlnewwindow');
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !userProfile?.companyId || !user) return;

    setLoading(true);
    try {
      // 1. Guardar Registro de Venta
      const saleRef = await addDoc(collection(db, 'sales'), {
        companyId: userProfile.companyId,
        userId: user.uid,
        items: cart,
        total,
        createdAt: new Date().toISOString(),
      });

      // 2. Descontar Stock en Firestore
      for (const item of cart) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod && prod.id) {
          const productRef = doc(db, 'products', prod.id);
          await updateDoc(productRef, {
            stock: prod.stock - item.quantity,
          });
        }
      }

      generateReceiptPDF(saleRef.id, cart, total);
      setCart([]);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (error) {
      console.error('Error al procesar la venta:', error);
    } finally {
      setLoading(false);
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

      {successMsg && (
        <div className="mb-4 p-4 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} /> Venta registrada y stock actualizado con éxito.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Catálogo para Selección */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Catálogo de Productos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
                className={`p-4 border rounded-xl text-left transition-all ${
                  p.stock > 0
                    ? 'hover:border-indigo-500 hover:shadow-md bg-white'
                    : 'bg-slate-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="font-bold text-slate-800">{p.name}</div>
                <div className="text-sm text-slate-500">{p.category}</div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-indigo-600 font-bold">${p.price.toFixed(2)}</span>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">Stock: {p.stock}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Carrito de Compra */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-600" /> Detalle de Venta
            </h2>

            {cart.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center">Selecciona productos de la lista.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">${(item.quantity * item.price).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between text-lg font-bold text-slate-800 mb-4">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Completar Venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};