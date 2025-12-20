import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import html2pdf from "html2pdf.js";

/* ================= INTERFACES ================= */
interface Payment {
  id: number;
  customer_id: number;
  completed_repair_id?: number | null;
  order_id?: number | null;
  amount: number;
  payment_method: "cash" | "card" | "bank";
  payment_date: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  customer_name: string;
}

interface Repair {
  id: number;
  customer_id: number;
  customer_name: string;
}

interface Order {
  id: number;
  customer_id: number;
}

/* ================= COMPONENT ================= */
export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [repairId, setRepairId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [paymentsRes, customersRes, ordersRes, repairsRes] =
          await Promise.all([
            axios.get<Payment[]>(`${API_URL}/payments`),
            axios.get<{ customers: Customer[] }>(`${API_URL}/customers`),
            axios.get<{ orders: Order[] }>(`${API_URL}/orders`),
            axios.get<Repair[]>(`${API_URL}/repair-parts`),
          ]);

        setPayments(
          Array.isArray(paymentsRes.data)
            ? paymentsRes.data.map((p) => ({ ...p, amount: Number(p.amount) }))
            : []
        );
        setCustomers(
          Array.isArray(customersRes.data.customers)
            ? customersRes.data.customers
            : []
        );
        setOrders(
          Array.isArray(ordersRes.data.orders) ? ordersRes.data.orders : []
        );
        setRepairs(Array.isArray(repairsRes.data) ? repairsRes.data : []);
      } catch (err) {
        console.error(err);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ================= FILTER ================= */
  const filteredPayments = payments.filter((p) => {
    const customer = customers.find((c) => c.id === p.customer_id);
    return (customer?.name ?? "").toLowerCase().includes(search.toLowerCase());
  });

  /* ================= ADD PAYMENT ================= */
  const handleAddPayment = async (e: React.FormEvent) => {
  e.preventDefault();

  // ✅ THIS VALIDATION CODE GOES HERE
  if (!customers.find(c => c.id === Number(customerId))) {
    alert("Selected customer not found");
    return;
  }

  if (orderId) {
    const order = orders.find(o => o.id === Number(orderId));
    if (!order || order.customer_id !== Number(customerId)) {
      alert("Selected order does not belong to selected customer");
      return;
    }
  }

  if (repairId) {
    const repair = repairs.find(r => r.id === Number(repairId));
    if (!repair || repair.customer_id !== Number(customerId)) {
      alert("Selected repair does not belong to selected customer");
      return;
    }
  }

  // 👉 axios.post BELOW THIS
  try {
    const payload = {
      customer_id: Number(customerId),
      order_id: orderId ? Number(orderId) : null,
      completed_repair_id: repairId ? Number(repairId) : null,
      amount: Number(amount),
      payment_method: paymentMethod,
      payment_date: paymentDate,
    };

    await axios.post(`${API_URL}/payments`, payload);
    alert("Payment added!");
  } catch (err) {
    alert("Failed to add payment");
  }
};


  /* ================= PRINT ================= */
  const handlePrint = () => {
    if (!printRef.current) return;

    const opt = {
      margin: 10,
      filename: `Payment_${selectedPayment?.id}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };
    html2pdf().set(opt).from(printRef.current).save();
  };

  /* ================= SEND EMAIL ================= */
  const handleSendEmail = async () => {
    if (!selectedPayment || !printRef.current) return;

    const customer = customers.find((c) => c.id === selectedPayment.customer_id);
    if (!customer?.email) {
      alert("Customer email not found");
      return;
    }

    const opt = {
      margin: 10,
      filename: `Payment_${selectedPayment.id}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    const pdfBlob = await html2pdf().set(opt).from(printRef.current).output("blob");

    const formData = new FormData();
    formData.append("email", customer.email);
    formData.append("pdf", pdfBlob);

    await axios.post(`${API_URL}/send-payment-receipt`, formData);
    alert("Receipt sent!");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Payments</h1>

      <input
        className="border px-3 py-2 rounded w-full sm:w-1/3"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white p-4 rounded shadow my-4">
        <h2 className="text-xl font-semibold mb-2">Add New Payment</h2>
        <form onSubmit={handleAddPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            className="border px-2 py-1 rounded"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            className="border px-2 py-1 rounded"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          >
            <option value="">Select Order (optional)</option>
            {orders.map((o) => {
              const customer = customers.find((c) => c.id === o.customer_id);
              return (
                <option key={o.id} value={o.id}>
                  {`Order ${o.id} - ${customer?.name || "Unknown"}`}
                </option>
              );
            })}
          </select>

          <select
            className="border px-2 py-1 rounded"
            value={repairId}
            onChange={(e) => setRepairId(e.target.value)}
          >
            <option value="">Select Repair (optional)</option>
            {repairs.map((r) => (
              <option key={r.id} value={r.id}>{`Repair ${r.id}`}</option>
            ))}
          </select>

          <input
            type="number"
            className="border px-2 py-1 rounded"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <select
            className="border px-2 py-1 rounded"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
          </select>

          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-green-500 text-white px-3 py-1 rounded col-span-1 sm:col-span-2"
          >
            Add Payment
          </button>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Customer</th>
              <th className="p-2">Type</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Method</th>
              <th className="p-2">Date</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => {
              const c = customers.find((x) => x.id === p.customer_id);
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{c?.name}</td>
                  <td className="p-2">{p.completed_repair_id ? "Repair" : "Order"}</td>
                  <td className="p-2">Rs. {p.amount.toFixed(2)}</td>
                  <td className="p-2">{p.payment_method}</td>
                  <td className="p-2">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="p-2">
                    <button
                      onClick={() => setSelectedPayment(p)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full sm:w-1/2 p-6">
            <div ref={printRef} className="space-y-2">
              <h2 className="text-center text-2xl font-bold">Display Hub Pokunuwita</h2>
              {(() => {
                const c = customers.find((x) => x.id === selectedPayment.customer_id);
                return (
                  <>
                    <p><b>Name:</b> {c?.name}</p>
                    <p><b>Phone:</b> {c?.phone}</p>
                    <p><b>Email:</b> {c?.email}</p>
                  </>
                );
              })()}
              <hr />
              <p><b>Payment Type:</b> {selectedPayment.completed_repair_id ? "Repair" : "Order"}</p>
              <p><b>Method:</b> {selectedPayment.payment_method}</p>
              <p><b>Amount:</b> Rs. {selectedPayment.amount.toFixed(2)}</p>
              <p className="text-center text-sm mt-4">Thank you, come again!</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handlePrint} className="bg-green-500 text-white px-4 py-2 rounded">Print</button>
              <button onClick={handleSendEmail} className="bg-blue-500 text-white px-4 py-2 rounded">Email</button>
              <button onClick={() => setSelectedPayment(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
