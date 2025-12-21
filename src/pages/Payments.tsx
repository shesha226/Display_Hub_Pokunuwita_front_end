import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api/api";

interface Repair {
  id: number;
  invoice_number: string | null;
  customer_name: string;
  phone_model: string;
  issue: string;
  repair_cost: number | null;
  advance: number | null;
  status: "pending" | "completed";
}

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
  invoice_number: string | null;
  customer_name: string;
  customer_phone: string;
  total_amount: number | null;
  items?: OrderItem[];
  created_at: string;
}

const LIMIT = 5;

export default function RepairTable() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairSearch, setRepairSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [repairPage, setRepairPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchRepairs();
    fetchOrders();
  }, []);

  const fetchRepairs = async () => {
    try {
      const res = await axios.get(`${API_URL}/repair-parts`);
      setRepairs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      const ordersData: Order[] = Array.isArray(res.data?.orders)
        ? res.data.orders
        : Array.isArray(res.data)
        ? res.data
        : [];
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setSelectedOrder({ ...res.data });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch order items");
    }
  };

  const filteredRepairs = repairs.filter((r) =>
  r.id.toString().includes(repairSearch) || // search by invoice number
  `${r.invoice_number} ${r.phone_model} ${r.issue}`
    .toLowerCase()
    .includes(repairSearch.toLowerCase())
);

  const filteredOrders = orders.filter((o) =>
  o.id.toString().includes(orderSearch) || // search by invoice number
  `${o.invoice_number} ${o.customer_phone}`
    .toLowerCase()
    .includes(orderSearch.toLowerCase())
);

  const repairData = filteredRepairs.slice(
    (repairPage - 1) * LIMIT,
    repairPage * LIMIT
  );
  const orderData = filteredOrders.slice(
    (orderPage - 1) * LIMIT,
    orderPage * LIMIT
  );

  const repairTotalPages = Math.ceil(filteredRepairs.length / LIMIT);
  const orderTotalPages = Math.ceil(filteredOrders.length / LIMIT);

  const handlePrint = () => {
    const printContent = document.getElementById("print-bill");
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bill</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              td, th { padding: 8px; border: 1px solid #ccc; }
              h1, p { margin: 5px 0; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
            </style>
          </head>
          <body>${printContent.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* LEFT SIDE TABLES */}
      <div className="flex-1 p-6 space-y-12">
        {/* Repairs Table */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Repairs</h2>
          <input
            className="border px-3 py-2 rounded w-full mb-3"
            placeholder="Search repairs..."
            value={repairSearch}
            onChange={(e) => {
              setRepairSearch(e.target.value);
              setRepairPage(1);
            }}
          />
          <table className="w-full bg-white rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Incoice</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Cost</th>
                <th className="p-2">Balance</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {repairData.map((r) => {
                const cost = Number(r.repair_cost || 0);
                const adv = Number(r.advance || 0);
                return (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">{r.invoice_number}</td>
                    <td className="p-2">{r.customer_name}</td>
                    <td className="p-2">{r.phone_model}</td>
                    <td className="p-2">Rs. {cost.toFixed(2)}</td>
                    <td className="p-2">Rs. {(cost - adv).toFixed(2)}</td>
                    <td className="p-2">
                      <button
                        onClick={() => {
                          setSelectedRepair(r);
                          setSelectedOrder(null);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Bill
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-between mt-3">
            <button
              disabled={repairPage === 1}
              onClick={() => setRepairPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {repairPage} / {repairTotalPages || 1}
            </span>
            <button
              disabled={repairPage === repairTotalPages}
              onClick={() => setRepairPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Orders</h2>
          <input
            className="border px-3 py-2 rounded w-full mb-3"
            placeholder="Search orders..."
            value={orderSearch}
            onChange={(e) => {
              setOrderSearch(e.target.value);
              setOrderPage(1);
            }}
          />
          <table className="w-full bg-white rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Incoice</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Total</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orderData.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="p-2">{o.invoice_number}</td>
                  <td className="p-2">{o.customer_name}</td>
                  <td className="p-2">{o.customer_phone}</td>
                  <td className="p-2">Rs. {Number(o.total_amount || 0).toFixed(2)}</td>
                  <td className="p-2">
                    <button
                      onClick={() => {
                        fetchOrderItems(o.id);
                        setSelectedRepair(null);
                      }}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-3">
            <button
              disabled={orderPage === 1}
              onClick={() => setOrderPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {orderPage} / {orderTotalPages || 1}
            </span>
            <button
              disabled={orderPage === orderTotalPages}
              onClick={() => setOrderPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Invoice / Bill Popup */}
      {(selectedRepair || selectedOrder) && (
        <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="p-8" id="print-bill">
            <button
              onClick={() => {
                setSelectedRepair(null);
                setSelectedOrder(null);
              }}
              className="text-red-500 font-bold mb-6 flex items-center gap-2"
            >
              ✕ Close Preview
            </button>

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">DisplaysHub</h1>
                <div className="text-gray-500 text-xs mt-1 leading-relaxed">
                  <p>Pokunuwita, Sri Lanka</p>
                  <p>+94 7X XXX XXXX</p>
                  <p>info@displayhub.com</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Mobile Repair Shop</p>
                <h2 className="text-4xl font-black text-black">INVOICE</h2>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 mb-8 border-b border-black pb-6">
              <div>
                <h3 className="text-gray-400 font-bold text-xs uppercase mb-1">Bill To</h3>
                <p className="font-bold text-lg leading-none">{selectedRepair?.customer_name || selectedOrder?.customer_name}</p>
                <p className="text-gray-600 text-sm mt-1">{selectedRepair?.phone_model || selectedOrder?.customer_phone}</p>
              </div>
              <div className="text-right">
                <h3 className="text-gray-400 font-bold text-xs uppercase mb-1">Date</h3>
                <p className="text-sm">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Invoice Items Table */}
            <table className="w-full text-left mb-8 border">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-xs uppercase">
                  <th className="py-2 px-2 border">Description</th>
                  <th className="py-2 px-2 border text-right">Quantity</th>
                  <th className="py-2 px-2 border text-right">Price</th>
                  <th className="py-2 px-2 border text-right">Discount</th>
                  <th className="py-2 px-2 border text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {selectedRepair ? (
                  <tr>
                    <td className="py-2 px-2 border">Repair: {selectedRepair.issue} ({selectedRepair.phone_model})</td>
                    <td className="py-2 px-2 border text-right">1</td>
                    <td className="py-2 px-2 border text-right">Rs. {Number(selectedRepair.repair_cost).toFixed(2)}</td>
                    <td className="py-2 px-2 border text-right">Rs. {Number(selectedRepair.advance).toFixed(2)}</td>
                    <td className="py-2 px-2 border text-right">Rs. {(Number(selectedRepair.repair_cost) - Number(selectedRepair.advance)).toFixed(2)}</td>
                  </tr>
                ) : selectedOrder && selectedOrder.items ? (
                  <>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2 border">{item.item_name}</td>
                        <td className="py-2 px-2 border text-right">{item.quantity}</td>
                        <td className="py-2 px-2 border text-right">Rs. {item.price.toFixed(2)}</td>
                        <td className="py-2 px-2 border text-right">Rs. {item.discount.toFixed(2)}</td>
                        <td className="py-2 px-2 border text-right">Rs. {item.final_price.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold text-lg">
                      <td className="py-2 px-2 border text-right" colSpan={4}>Total</td>
                      <td className="py-2 px-2 border text-right">Rs. {Number(selectedOrder.total_amount || 0).toFixed(2)}</td>
                    </tr>
                  </>
                ) : null}
              </tbody>
            </table>

            {/* Footer */}
            <div className="mt-12 text-center border-t pt-6">
              <p className="text-sm font-bold">Thank you for your business!</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Warranty valid as per shop policy</p>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="mt-8 w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              🖨️ Print Official Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
