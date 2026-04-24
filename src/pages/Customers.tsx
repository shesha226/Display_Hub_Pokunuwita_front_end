import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  X,
  User
} from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= FETCH DATA ================= */
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/customers`);
      setCustomers(res.data.customers || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch customers");
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
  const openModal = (customer?: Customer) => {
    if (customer) {
      // Edit Mode
      setForm({
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone,
      });
      setEditingId(customer.id);
    } else {
      // Add Mode
      setForm({ name: "", email: "", address: "", phone: "" });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return alert("Name and Phone are required!");

    try {
      if (editingId) {
        await axios.put(`${API_URL}/customers/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/customers`, form);
      }
      closeModal();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to save customer");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await axios.delete(`${API_URL}/customers/${id}`);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  // Helper to get initials (e.g., "John Doe" -> "JD")
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  /* ================= FILTER ================= */
  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" /> Customer Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage your loyal customer base.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Name, Email or Phone..."
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ERROR STATE */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">Loading customers...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">

                    {/* Name + Avatar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {getInitials(c.name)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">ID: #{c.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          {c.email || "N/A"}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          {c.phone}
                        </div>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-2 text-gray-400" />
                        <span className="truncate max-w-xs">{c.address || "No address provided"}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(c)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full mr-2 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <User size={40} className="text-gray-300 mb-2" />
                      <p>No customers found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">

            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Customer" : "Add New Customer"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition">
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="077xxxxxxx"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Colombo, Sri Lanka"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition"
              >
                {editingId ? "Update Customer" : "Save Customer"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}