import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  ClipboardList,
  User,
  Smartphone,
  AlertCircle,
  Clock,
  Check
} from "lucide-react";

/* ================= TYPES ================= */
interface Repair {
  id: number;
  invoice_number: string | null;
  customer_name: string | null;
  phone_model: string | null;
  issue: string | null;
  repair_cost: number;
  advance: number;
  status: "pending" | "completed";
}

export default function Repairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<Partial<Repair>>({
    customer_name: "",
    phone_model: "",
    issue: "",
    repair_cost: undefined,
    advance: undefined,
    status: "pending",
  });

  /* ================= FETCH ================= */
  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/repair-parts`);
      setRepairs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  /* ================= HANDLERS ================= */
  const openModal = (item?: Repair) => {
    if (item) {
      setForm(item);
      setEditingId(item.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      customer_name: "",
      phone_model: "",
      issue: "",
      repair_cost: undefined,
      advance: undefined,
      status: "pending",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.customer_name || !form.phone_model || !form.issue || form.repair_cost == null || form.advance == null) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      customer_name: form.customer_name,
      phone_model: form.phone_model,
      issue: form.issue,
      repair_cost: Number(form.repair_cost),
      advance: Number(form.advance),
      status: form.status,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/repair-parts/${editingId}`, payload);
        alert("Repair updated successfully.");
      } else {
        const res = await axios.post(`${API_URL}/repair-parts`, payload);
        alert(`Repair added successfully. Invoice: ${res.data?.invoice_number || 'N/A'}`);
      }
      closeModal();
      fetchRepairs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save repair");
    }
  };

  // අලුතින් එකතු කළ Function එක: Popup එකෙන් කෙලින්ම Complete කිරීම
  const markAsCompletedFromModal = async () => {
    if (!form.customer_name || !form.phone_model || !form.issue || form.repair_cost == null || form.advance == null) {
      alert("Please fill all fields before completing.");
      return;
    }

    const payload = {
      customer_name: form.customer_name,
      phone_model: form.phone_model,
      issue: form.issue,
      repair_cost: Number(form.repair_cost),
      advance: Number(form.advance),
      status: "completed", // Status එක Completed ලෙස වෙනස් කිරීම
    };

    try {
      await axios.put(`${API_URL}/repair-parts/${editingId}`, payload);
      alert("Repair marked as completed and updated successfully.");
      closeModal();
      fetchRepairs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to complete repair");
    }
  };

  const markAsDone = async (id: number) => {
    try {
      const repair = repairs.find(r => r.id === id);
      if (!repair) return;

      const payload = {
        customer_name: repair.customer_name,
        phone_model: repair.phone_model,
        issue: repair.issue,
        repair_cost: Number(repair.repair_cost),
        advance: Number(repair.advance),
        status: "completed",
      };

      await axios.put(`${API_URL}/repair-parts/${id}`, payload);
      fetchRepairs();
    } catch (err) {
      alert("Failed to mark as completed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this repair?")) return;
    try {
      await axios.delete(`${API_URL}/repair-parts/${id}`);
      fetchRepairs();
    } catch (err) {
      alert("Failed to delete repair");
    }
  };

  /* ================= FILTER ================= */
  const filteredRepairs = repairs.filter(r =>
    (r.invoice_number ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.customer_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.phone_model ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.issue ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Wrench className="text-blue-600" /> Repair Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track all your phone repair jobs in one place.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> New Repair
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search repairs..."
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm font-medium text-gray-500">
          Total Records: {filteredRepairs.length}
        </div>
      </div>

      {/* SINGLE REPAIR TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
          <ClipboardList size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">All Repair Jobs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice / Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device & Issue</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payments</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRepairs.length > 0 ? (
                filteredRepairs.map(r => {
                  const balance = Number(r.repair_cost) - Number(r.advance);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{r.customer_name || "N/A"}</div>
                        <div className="text-xs text-blue-600 font-medium">#{r.invoice_number || "PENDING"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{r.phone_model}</div>
                        <div className="text-xs text-gray-500 italic">{r.issue}</div>
                      </td>
                      {/* STATUS COLUMN */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {r.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            <Clock size={12} /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <Check size={12} /> Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">Total: Rs. {Number(r.repair_cost).toLocaleString()}</div>
                        <div className="text-xs text-green-600 font-bold">Paid: Rs. {Number(r.advance).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          Rs. {balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {r.status === "pending" && (
                            <button onClick={() => markAsDone(r.id)} className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full transition" title="Mark as Done">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button onClick={() => openModal(r)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full transition" title="Edit Repair">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic text-sm">
                    No repair records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Repair Info" : "Register New Repair"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter customer name"
                    value={form.customer_name ?? ""}
                    onChange={e => setForm({ ...form, customer_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Model</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Samsung A54"
                    value={form.phone_model ?? ""}
                    onChange={e => setForm({ ...form, phone_model: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue / Fault</label>
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Display replacement"
                    value={form.issue ?? ""}
                    onChange={e => setForm({ ...form, issue: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (Rs)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.repair_cost ?? ""}
                  onChange={e => setForm({ ...form, repair_cost: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid (Rs)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.advance ?? ""}
                  onChange={e => setForm({ ...form, advance: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 items-center">
              {/* මේ තියෙන්නේ අලුතින් Modal එක ඇතුළට දාපු Complete Button එක */}
              {editingId && form.status === "pending" && (
                <button 
                  onClick={markAsCompletedFromModal} 
                  className="mr-auto px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition font-bold flex items-center gap-2 text-sm"
                >
                  <CheckCircle size={16} /> Mark as Completed
                </button>
              )}
              
              <button onClick={closeModal} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition font-medium">
                {editingId ? "Update Repair" : "Confirm Repair"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}