import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api/api";

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
  invoice_number: string; // Added
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
  const [error, setError] = useState("");

  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // search

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
    fetchAccessories();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((o) =>
        (o.customer_name + o.invoice_number)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
    setCurrentPage(1); // reset page on search
  }, [searchTerm, orders]);

  // Pagination calculation
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Pagination handlers
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  // Fetch functions
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data.orders || res.data);
      setFilteredOrders(res.data.orders || res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
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

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers`);
      setCustomers(res.data.customers || res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setOrderItems(res.data.items || []);
      setSelectedOrderId(orderId);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch order items");
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this order?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchOrders();
      setSelectedOrderId(null);
      alert("Order deleted successfully ✅");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete order ❌");
    }
  };

  // Add/Edit item functions
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
    if (item.price && item.discount && item.quantity) {
      item.final_price = item.quantity * (item.price - item.discount);
    }
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

  const submitOrder = async () => {
    if (!editCustomerId) return alert("Please select a customer");
    for (const item of editItems) {
      if (item.id <= 0) return alert("Please select an accessory for all items");
      if (item.quantity <= 0) return alert("Quantity must be at least 1");
    }
    const payload = {
      customer_id: editCustomerId,
      items: editItems.map(item => ({ accessory_id: item.id, quantity: item.quantity })),
    };

    try {
      if (editingOrderId) {
        await axios.put(`${API_URL}/orders/${editingOrderId}`, payload);
        alert("Order updated successfully ✅");
      } else {
        await axios.post(`${API_URL}/orders`, payload);
        alert("Order created successfully ✅");
      }
      fetchOrders();
      setEditingOrderId(null);
      setEditCustomerId(null);
      setEditItems([]);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert("Failed to submit order");
    }
  };

  const startEditing = async (orderId: number) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setEditingOrderId(orderId);
      setEditCustomerId(res.data.customer_id || null);
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
      alert("Failed to fetch order for editing");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer name or invoice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 w-full rounded"
        />
      </div>

      {/* Add/Edit Order Form */}
      <div className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-xl font-bold mb-3">{editingOrderId ? `Edit Order #${editingOrderId}` : "Add New Order"}</h2>
        <select
          value={editCustomerId || ""}
          onChange={(e) => setEditCustomerId(Number(e.target.value))}
          className="border px-2 py-1 mb-3 w-full"
        >
          <option value="">Select Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {editItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <select
              value={item.id}
              onChange={(e) => handleAccessorySelect(idx, Number(e.target.value))}
              className="border px-2 py-1 w-40"
            >
              <option value={0}>Select Item</option>
              {accessories.map(a => <option key={a.id} value={a.id}>{a.item_name}</option>)}
            </select>

            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
              className="border px-2 py-1 w-20"
            />

            <span className="px-2 py-1 w-24">Rs. {item.final_price.toFixed(2)}</span>

            <button onClick={() => removeItem(idx)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
          </div>
        ))}

        <button onClick={addNewItem} className="bg-blue-500 text-white px-3 py-1 rounded mt-2">Add Item</button>

        <div className="mt-4">
          <button
            onClick={submitOrder}
            className="bg-green-500 text-white px-3 py-1 rounded"
            disabled={editItems.length === 0 || editItems.some(i => i.id <= 0 || i.quantity <= 0)}
          >
            {editingOrderId ? "Save Changes" : "Create Order"}
          </button>
          {editingOrderId && (
            <button
              onClick={() => { setEditingOrderId(null); setEditCustomerId(null); setEditItems([]); }}
              className="bg-gray-400 text-white px-3 py-1 rounded ml-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded shadow-md mb-2">
        <table className="min-w-full">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-100">
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.invoice_number}</td>
                <td className="px-4 py-2">{order.customer_name}</td>
                <td className="px-4 py-2">{order.customer_phone}</td>
                <td className="px-4 py-2">Rs. {Number(order.total_amount).toFixed(2)}</td>
                <td className="px-4 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => fetchOrderItems(order.id)} className="bg-green-500 text-white px-2 py-1 rounded">View Items</button>
                  <button onClick={() => startEditing(order.id)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(order.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mb-6">
        <button onClick={handlePrev} disabled={currentPage === 1} className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50">Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNext} disabled={currentPage === totalPages} className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50">Next</button>
      </div>

      {/* Order Items Table */}
      {selectedOrderId && (
        <div className="bg-white p-4 rounded shadow-md mb-6">
          <h2 className="text-xl font-bold mb-3">Order #{selectedOrderId} Items</h2>
          {orderItems.length === 0 ? <p>No items found</p> :
            <table className="min-w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Discount</th>
                  <th className="px-3 py-2">Final</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">{item.item_name}</td>
                    <td className="px-3 py-2">{item.quantity}</td>
                    <td className="px-3 py-2">{item.price}</td>
                    <td className="px-3 py-2">{item.discount}</td>
                    <td className="px-3 py-2 font-bold">{item.final_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      )}
    </div>
  );
}
