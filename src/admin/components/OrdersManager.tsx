import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  PhoneCall, 
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '../../types';
import { api } from '../../services/api';
import { WhatsAppIcon } from '../../components/WhatsAppIcon';
import { InvoiceModal } from '../../components/InvoiceModal';

interface OrdersManagerProps {
  settings: StoreSettings;
  showToast: (msg: string) => void;
}

export function OrdersManager({ settings, showToast }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch {
      showToast('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Order status updated to ${newStatus}`);
    } catch {
      showToast('Failed to update status');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
      showToast('Order removed');
    } catch {
      showToast('Failed to delete order');
    }
  };

  const handleWhatsAppCustomer = (order: Order) => {
    const cleanCustomerPhone = (order.customerWhatsapp || order.customerPhone)
      .replace(/^0/, '92')
      .replace(/[^0-9]/g, '');

    const msg = `Assalam-o-Alaikum ${order.customerName}, this is Ali Electronic regarding your order #${order.orderNumber}. We are preparing your order for Rs. ${order.totalAmount.toLocaleString()}. Please let us know if you have any questions!`;
    window.open(`https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.customerAddress.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'Processing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      case 'Shipped':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Customer Orders Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time orders stored permanently in Supabase database
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by order #, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All Orders' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-xs">Fetching orders from Supabase...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No orders found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When customers checkout online or order via WhatsApp, orders are recorded here immediately.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Order Number & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 dark:text-white font-mono">
                        #{order.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('en-PK')}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {order.customerPhone}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {order.customerAddress}, {order.city}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 dark:text-white">
                        Rs. {order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {order.paymentMethod}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${getStatusBadge(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Customer */}
                        <button
                          onClick={() => handleWhatsAppCustomer(order)}
                          title="WhatsApp Customer"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                        >
                          <WhatsAppIcon className="w-4 h-4 fill-emerald-600" />
                        </button>

                        {/* View Invoice */}
                        <button
                          onClick={() => setInvoiceOrder(order)}
                          title="Generate Invoice"
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(order.id)}
                          title="Delete Order"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal Preview */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          settings={settings}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
