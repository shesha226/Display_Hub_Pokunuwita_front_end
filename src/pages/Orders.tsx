import { useState, useEffect } from "react";
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

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleAccessorySelect = (index: number, accessoryName: string) => {
    const accessory = accessories.find(a => a.item_name === accessoryName);
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

  const submitOrder = async () => {
    if (!customerName.trim()) return alert("Please enter Customer Name");
    if (editItems.length === 0) return alert("Please add at least one item");

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
        const newOrder = res.data.order || res.data;
        setBillData({
          invoice_number: newOrder.invoice_number,
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
    } catch (err) {
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
    } catch (err) { console.error(err); }
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="p-8 font-bold text-slate-400">Loading Orders...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900 print:bg-white print:p-0">
      
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <ShoppingBag className="text-blue-600" size={32} />
              ORDERS <span className="text-blue-600">& BILLING</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Create orders and print invoices instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm sticky top-6">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                {editingOrderId ? `Edit Order` : "Quick Order"}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="relative">
                  <User className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                  <input type="text" placeholder="Customer Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                  <input type="text" placeholder="Mobile Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none" />
                </div>
              </div>

              {/* SEARCHABLE ITEMS LIST */}
              <div className="space-y-3 mb-6 max-h-[350px] overflow-y-auto pr-2">
                {editItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
                    <button onClick={() => removeItem(idx)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full"><X size={14} /></button>
                    
                    <div className="mb-2">
                      <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Item Name</label>
                      <input 
                        list={`acc-list-${idx}`}
                        placeholder="Search item..."
                        defaultValue={item.item_name}
                        onChange={(e) => handleAccessorySelect(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm font-bold outline-none"
                      />
                      <datalist id={`acc-list-${idx}`}>
                        {accessories.map(a => <option key={a.id} value={a.item_name}>Rs. {a.price} | Stock: {a.qty_on_hand}</option>)}
                      </datalist>
                    </div>

                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Qty</label>
                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-sm font-bold text-center" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Total</label>
                        <div className="bg-blue-50 py-1.5 px-3 rounded-lg text-sm font-black text-blue-700 text-right">Rs. {item.final_price.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addNewItem} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 font-bold rounded-xl flex justify-center items-center gap-2"><Plus size={18} /> Add Item</button>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-slate-500">Total</span>
                  <span className="text-2xl font-black">Rs. {editItems.reduce((acc, curr) => acc + curr.final_price, 0).toLocaleString()}</span>
                </div>
                <button onClick={submitOrder} disabled={editItems.length === 0} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> {editingOrderId ? "Update" : "Place Order"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: TABLE */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 outline-none font-bold" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs uppercase text-slate-400 border-b">
                      <th className="text-left pb-3">Invoice</th>
                      <th className="text-left pb-3">Customer</th>
                      <th className="text-left pb-3">Total</th>
                      <th className="text-right pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order.id} className="border-b group hover:bg-slate-50">
                        <td className="py-4 font-bold text-sm">{order.invoice_number}</td>
                        <td className="py-4">
                          <p className="font-bold text-sm">{order.customer_name}</p>
                          <p className="text-xs text-slate-400">{order.customer_phone || '-'}</p>
                        </td>
                        <td className="py-4 font-black text-emerald-600 text-sm">Rs. {Number(order.total_amount).toLocaleString()}</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => fetchOrderItems(order.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Eye size={16} /></button>
                            <button onClick={() => startEditing(order)} className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(order.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedOrderId && (
              <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
                <div className="flex justify-between mb-4">
                  <h2 className="font-black uppercase tracking-tight">Items in Order #{selectedOrderId}</h2>
                  <button onClick={() => setSelectedOrderId(null)}><X size={20} /></button>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm">
                      <span>{item.item_name} (x{item.quantity})</span>
                      <span className="font-black text-emerald-400">Rs. {item.final_price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BILL MODAL */}
      {showBill && billData && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900/60 backdrop-blur-sm print:relative print:bg-white">
          <div className="bg-white w-full max-w-sm p-8 rounded-2xl print:p-0">
            <div className="flex justify-end gap-2 mb-6 print:hidden">
              <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={16} /> Print</button>
              <button onClick={() => setShowBill(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold"><X size={16} /></button>
            </div>
            <div className="text-black font-mono text-center">
              <h2 className="text-2xl font-black border-b border-dashed pb-2">YOUR SHOP NAME</h2>
              <div className="text-left my-4 text-sm space-y-1">
                <p>Invoice: {billData.invoice_number}</p>
                <p>Date: {billData.date}</p>
                <p>Customer: {billData.customer_name}</p>
              </div>
              <table className="w-full text-xs border-y border-dashed my-4">
                <thead><tr><th className="text-left py-1">Item</th><th className="text-center">Qty</th><th className="text-right">Price</th></tr></thead>
                <tbody>
                  {billData.items.map((i: any, idx: number) => (
                    <tr key={idx}><td className="py-1 text-left">{i.item_name}</td><td className="text-center">{i.quantity}</td><td className="text-right">{i.final_price.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between font-black text-lg"><span>TOTAL:</span><span>Rs. {billData.total_amount.toFixed(2)}</span></div>
              <p className="mt-6 text-xs font-bold uppercase">Thank You! Come Again</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}