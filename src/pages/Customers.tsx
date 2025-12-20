import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api/api";

interface Customer {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ✅ FIX: correct response handling
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/customers`);
      setCustomers(res.data.customers); // 🔥 VERY IMPORTANT FIX
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch customers");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await axios.put(
          `${API_URL}/customers/${editingCustomer.id}`,
          form
        );
      } else {
        await axios.post(`${API_URL}/customers`, form);
      }

      setForm({ name: "", email: "", address: "", phone: "" });
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to save customer");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer?")) return;

    try {
      await axios.delete(`${API_URL}/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Customers</h1>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid gap-3 sm:grid-cols-2">
        <input
          placeholder="Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          className="border p-2 rounded"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Address"
          className="border p-2 rounded"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          required
        />
        <input
          placeholder="Phone"
          className="border p-2 rounded"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          required
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded sm:col-span-2">
          {editingCustomer ? "Update Customer" : "Add Customer"}
        </button>
      </form>

      {/* Search */}
      <input
        placeholder="Search customers..."
        className="border p-2 rounded mb-4 w-full sm:w-1/3"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Table */}
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-blue-500 text-white">
          <tr>
            <th className="p-2">ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4">
                No customers found. Add first customer 👆
              </td>
            </tr>
          ) : (
            filtered.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.address}</td>
                <td>{c.phone}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => {
                      setEditingCustomer(c);
                      setForm(c);
                    }}
                    className="bg-yellow-400 px-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
