import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import {
  Search, Plus, Trash2, Printer, Edit, Eye, ShoppingBag, User, Phone, CheckCircle2, X
} from "lucide-react";

interface OrderItem {
  id: number;
  item_name: string;
  quantity: number;
  price: number;
  discount: number;
  final_price: number;
}

interface Order {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  created_at: string;
}

interface Accessory {
  id: number;
  item_name: string;
  price: number;
  discount: number;
  qty_on_hand: number;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Customer Entry State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Bill Print State
  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
    fetchAccessories();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((o) =>
        (o.customer_name + o.invoice_number + o.customer_phone)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, orders]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data.orders || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessories = async () => {
    try {
      const res = await axios.get(`${API_URL}/accessories`);
      setAccessories(res.data.accessories || res.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setOrderItems(res.data.items || []);
      setSelectedOrderId(orderId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchOrders();
      setSelectedOrderId(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete order");
    }
  };

  const addNewItem = () => {
    setEditItems([...editItems, { id: 0, item_name: "", quantity: 1, price: 0, discount: 0, final_price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...editItems];
    newItems.splice(index, 1);
    setEditItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...editItems];
    newItems[index] = { ...newItems[index], [field]: value };
    const item = newItems[index];
    item.final_price = item.quantity * (item.price - item.discount);
    setEditItems(newItems);
  };

  const handleAccessorySelect = (index: number, accessoryId: number) => {
    const accessory = accessories.find(a => a.id === accessoryId);
    if (!accessory) return;
    const newItems = [...editItems];
    newItems[index] = {
      ...newItems[index],
      id: accessory.id,
      item_name: accessory.item_name,
      price: accessory.price,
      discount: accessory.discount,
      final_price: newItems[index].quantity * (accessory.price - accessory.discount),
    };
    setEditItems(newItems);
  };

  // ------------------------------------------
  // Submit Order & Print Logic
  // ------------------------------------------
  const submitOrder = async () => {
    if (!customerName.trim()) return alert("Please enter Customer Name");
    if (editItems.length === 0) return alert("Please add at least one item");

    for (const item of editItems) {
      if (item.id <= 0) return alert("Please select an item for all rows");
      if (item.quantity <= 0) return alert("Quantity must be at least 1");
    }

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      items: editItems.map(item => ({
        accessory_id: item.id,
        item_name: item.item_name,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        final_price: item.final_price
      })),
      total_amount: editItems.reduce((sum, item) => sum + item.final_price, 0)
    };

    try {
      if (editingOrderId) {
        await axios.put(`${API_URL}/orders/${editingOrderId}`, payload);
        alert("Order updated successfully!");
      } else {
        const res = await axios.post(`${API_URL}/orders`, payload);
        // Set Bill Data from response and show modal
        const newOrder = res.data.order || res.data;
        setBillData({
          invoice_number: newOrder.invoice_number || `INV-${Math.floor(Math.random() * 10000)}`,
          customer_name: customerName,
          customer_phone: customerPhone,
          items: editItems,
          total_amount: payload.total_amount,
          date: new Date().toLocaleDateString()
        });
        setShowBill(true);
      }
      
      fetchOrders();
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit order");
    }
  };

  const resetForm = () => {
    setEditingOrderId(null);
    setCustomerName("");
    setCustomerPhone("");
    setEditItems([]);
  };

  const startEditing = async (order: Order) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${order.id}`);
      setEditingOrderId(order.id);
      setCustomerName(order.customer_name);
      setCustomerPhone(order.customer_phone);
      setEditItems(res.data.items.map((i: any) => ({
        id: i.accessory_id,
        item_name: i.item_name,
        quantity: i.quantity,
        price: i.price,
        discount: i.discount,
        final_price: i.final_price,
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 font-bold text-slate-400">Loading Orders...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900 print:bg-white print:p-0">
      
      {/* ----------------- HIDDEN IN PRINT MODE ----------------- */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <ShoppingBag className="text-blue-600" size={32} />
              ORDERS <span className="text-blue-600">& BILLING</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Create orders, manage customers, and print invoices instantly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE: ADD ORDER FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm sticky top-6">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                {editingOrderId ? `Edit Order #${editingOrderId}` : "Quick Order"}
              </h2>

              {/* Customer Details */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <User className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Mobile Number (Optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {editItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 relative group">
                    <button 
                      onClick={() => removeItem(idx)} 
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                    >
                      <X size={14} />
                    </button>
                    
                    <select
                      value={item.id}
                      onChange={(e) => handleAccessorySelect(idx, Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm font-bold mb-2 outline-none"
                    >
                      <option value={0}>-- Select Item --</option>
                      {accessories.map(a => <option key={a.id} value={a.id}>{a.item_name} (Rs.{a.price})</option>)}
                    </select>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Qty</label>
                        <input
                          type="number" min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-bold text-center outline-none"
                        />
                      </div>
                      <div className="flex-[2]">
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Total</label>
                        <div className="bg-slate-200/50 rounded-lg py-1.5 px-3 text-sm font-black text-slate-800 text-right">
                          Rs. {item.final_price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addNewItem} 
                  className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 font-bold text-sm hover:border-blue-500 hover:text-blue-600 transition-colors flex justify-center items-center gap-2"
                >
                  <Plus size={18} /> Add Item
                </button>
              </div>

              {/* Total & Submit */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-slate-500">Grand Total</span>
                  <span className="text-2xl font-black text-slate-900">
                    Rs. {editItems.reduce((acc, curr) => acc + curr.final_price, 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={submitOrder}
                    disabled={editItems.length === 0}
                    className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <CheckCircle2 size={18} /> {editingOrderId ? "Update" : "Place Order"}
                  </button>
                  {editingOrderId && (
                    <button onClick={resetForm} className="px-4 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: ORDERS LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by invoice, name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                      <th className="pb-3 font-black">Invoice</th>
                      <th className="pb-3 font-black">Customer</th>
                      <th className="pb-3 font-black">Total</th>
                      <th className="pb-3 font-black">Date</th>
                      <th className="pb-3 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.length > 0 ? currentOrders.map(order => (
                      <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 font-bold text-sm text-slate-900">{order.invoice_number}</td>
                        <td className="py-4">
                          <p className="font-bold text-sm text-slate-900">{order.customer_name}</p>
                          <p className="text-xs text-slate-500">{order.customer_phone || 'No Phone'}</p>
                        </td>
                        <td className="py-4 font-black text-emerald-600 text-sm">Rs. {Number(order.total_amount).toLocaleString()}</td>
                        <td className="py-4 text-sm font-medium text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => fetchOrderItems(order.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="View Items"><Eye size={16} /></button>
                            <button onClick={() => startEditing(order)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-colors" title="Edit"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(order.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">No orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-slate-200">Prev</button>
                  <span className="text-sm font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-slate-200">Next</button>
                </div>
              )}
            </div>

            {/* View Order Items Details */}
            {selectedOrderId && (
              <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white animate-in fade-in slide-in-from-bottom-4 relative">
                <button onClick={() => setSelectedOrderId(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={20} /></button>
                <h2 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Eye size={20} className="text-blue-400" /> Order #{selectedOrderId} Items
                </h2>
                <div className="space-y-3">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
                      <div>
                        <p className="font-bold text-sm">{item.item_name}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">{item.quantity} x Rs. {item.price}</p>
                      </div>
                      <p className="font-black text-emerald-400">Rs. {item.final_price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------- BILL PRINT MODAL / VIEW ----------------- */}
      {showBill && billData && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900/60 backdrop-blur-sm print:relative print:bg-white print:backdrop-blur-none">
          <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-2xl relative print:shadow-none print:p-0 print:w-full print:max-w-none">
            
            {/* Action Buttons (Hidden on Print) */}
            <div className="flex justify-end gap-2 mb-6 print:hidden">
              <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                <Printer size={16} /> Print Bill
              </button>
              <button onClick={() => setShowBill(false)} className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                <X size={16} /> Close
              </button>
            </div>

            {/* --- Printable Bill Area --- */}
            <div className="text-black font-mono print:text-xs">
              <div className="text-center mb-6 border-b border-dashed border-gray-400 pb-4">
                <h2 className="text-2xl font-black mb-1 uppercase tracking-widest">YOUR SHOP NAME</h2>
                <p className="text-xs text-gray-600">123, Main Street, City</p>
                <p className="text-xs text-gray-600">Tel: 011-2345678</p>
              </div>

              <div className="mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-bold">Invoice:</span> <span>{billData.invoice_number}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold">Date:</span> <span>{billData.date}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold">Customer:</span> <span>{billData.customer_name}</span>
                </div>
                {billData.customer_phone && (
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">Mobile:</span> <span>{billData.customer_phone}</span>
                  </div>
                )}
              </div>

              <table className="w-full text-sm mb-4">
                <thead className="border-y border-dashed border-gray-400">
                  <tr>
                    <th className="py-2 text-left font-bold w-1/2">Item</th>
                    <th className="py-2 text-center font-bold">Qty</th>
                    <th className="py-2 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="border-b border-dashed border-gray-400">
                  {billData.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 text-left pr-2">{item.item_name}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">Rs. {item.final_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-4 text-lg font-black border-b-2 border-black pb-4">
                <span>TOTAL:</span>
                <span>Rs. {Number(billData.total_amount).toFixed(2)}</span>
              </div>

              <div className="text-center mt-6 text-xs text-gray-500 uppercase tracking-widest font-bold">
                <p>Thank You!</p>
                <p className="mt-1">Come Again</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}