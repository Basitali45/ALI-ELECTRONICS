import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface InvoiceModalProps {
  order: Order;
  settings: StoreSettings;
  onClose: () => void;
}

export function InvoiceModal({ order, settings, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Official Invoice Preview
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
              #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= INVOICE BODY (PRINTABLE) ================= */}
        <div className="p-8 sm:p-12 space-y-8 bg-white print:p-4 print:text-black">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-blue-600 text-white font-black text-xs tracking-wider uppercase mb-2">
                Tech Showroom & Accessories
              </div>
              <h1 className="font-heading font-black text-3xl tracking-tight text-slate-900">
                ALI ELECTRONIC
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Main Bus Stop, Islam Shaheed Road, Opposite New Sethi Flour Mills, Hassan Abdal, Pakistan
              </p>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                Tel: 0311-5321647 / 0313-3332141
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                INVOICE
              </span>
              <div className="text-xl font-black font-mono text-blue-600">
                #{order.orderNumber}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Date: {new Date(order.createdAt).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Status: {order.status}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Billed / Shipped To:
              </span>
              <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">{order.customerAddress}</p>
              <p className="text-slate-600">{order.city}, Pakistan</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Contact & Payment:
              </span>
              <p className="text-slate-700">Phone: <strong className="text-slate-900">{order.customerPhone}</strong></p>
              {order.customerWhatsapp && (
                <p className="text-slate-700">WhatsApp: <strong className="text-slate-900">{order.customerWhatsapp}</strong></p>
              )}
              <p className="text-slate-700">Payment: <strong className="text-slate-900">{order.paymentMethod}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Item Description</th>
                  <th className="py-2.5 px-2">SKU</th>
                  <th className="py-2.5 px-2 text-right">Price</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-2 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2 font-bold text-slate-800">
                      {item.productName}
                    </td>
                    <td className="py-3 px-2 text-slate-500 font-mono">
                      {item.sku || 'AE-GEN'}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-700">
                      Rs. {item.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-black text-slate-900">
                      Rs. {item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs space-y-1.5">
            <div className="flex justify-between w-64 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-64 text-slate-600">
              <span>Delivery Charges:</span>
              <span className="font-semibold text-slate-900">
                {order.deliveryCharges > 0 ? `Rs. ${order.deliveryCharges.toLocaleString()}` : 'FREE'}
              </span>
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="text-blue-600 text-base">Rs. {order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <p className="font-bold text-slate-700">Terms & Showroom Assurance:</p>
              <p>All items checked and tested prior to handover. 7-day checking warranty on select electronic items.</p>
            </div>
            <div className="text-right sm:text-right shrink-0">
              <p className="font-bold text-slate-900">Authorized Signature</p>
              <div className="mt-4 border-b border-dashed border-slate-400 w-32"></div>
              <p className="text-[10px] text-slate-400 mt-1">Ali Electronic Hassan Abdal</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
