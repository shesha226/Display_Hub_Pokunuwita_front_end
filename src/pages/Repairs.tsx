import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api/api";

interface Repair {
  id: number;
  customer_name: string;
  phone_model: string;
  issue: string;
  repair_cost: number;
  advance: number;
  status: "pending" | "completed";
}

export default function Repairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [form, setForm] = useState<Partial<Repair>>({
    customer_name: "",
    phone_model: "",
    issue: "",
    repair_cost: undefined,
    advance: undefined,
    status: "pending",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Fetch all repairs
  const fetchRepairs = async () => {
    try {
      const res = await axios.get(`${API_URL}/repair-parts`);
      setRepairs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  // Add or Update repair
  const handleSubmit = async () => {
    if (!form.customer_name || !form.phone_model || !form.issue || form.repair_cost == null || form.advance == null) {
      alert("Please fill all fields");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`${API_URL}/repair-parts/${editingId}`, form);
        alert("Repair updated successfully");
      } else {
        await axios.post(`${API_URL}/repair-parts`, form);
        alert("Repair added successfully");
      }
      resetForm();
      fetchRepairs();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save repair");
    }
  };

  // Mark as done
  const markAsDone = async (id: number) => {
    try {
      await axios.put(`${API_URL}/repair-parts/${id}`, { status: "completed" });
      fetchRepairs();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as completed");
    }
  };

  // Edit repair
  const handleEdit = (r: Repair) => {
    setForm(r);
    setEditingId(r.id);
  };

  // Delete repair
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this repair?")) return;
    try {
      await axios.delete(`${API_URL}/repair-parts/${id}`);
      fetchRepairs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete repair");
    }
  };

  const resetForm = () => {
    setForm({ customer_name: "", phone_model: "", issue: "", repair_cost: undefined, advance: undefined, status: "pending" });
    setEditingId(null);
  };

  // Filtered repairs
  const filtered = repairs.filter(r =>
    r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone_model.toLowerCase().includes(search.toLowerCase()) ||
    r.issue.toLowerCase().includes(search.toLowerCase())
  );

  const pendingRepairs = filtered.filter(r => r.status === "pending");
  const completedRepairs = filtered.filter(r => r.status === "completed");

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold mb-4">Repair Management</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by customer, phone, or issue..."
        className="border p-2 rounded w-full sm:w-1/3 mb-6"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Form */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 sm:grid-cols-6 gap-4">
  {/* Customer Name */}
  <div className="col-span-2">
    <h3>Customer Name</h3>
    <input
      placeholder="Customer Name"
      className="border p-2 rounded w-full"
      value={form.customer_name}
      onChange={e => setForm({ ...form, customer_name: e.target.value })}
    />
  </div>

  {/* Phone Model */}
  <div className="col-span-2">
    <h3>Phone Model</h3>
    <input
      placeholder="Phone Model"
      className="border p-2 rounded w-full"
      value={form.phone_model}
      onChange={e => setForm({ ...form, phone_model: e.target.value })}
    />
  </div>

  {/* Issue */}
  <div className="col-span-2">
    <h3>Issue</h3>
    <input
      placeholder="Issue"
      className="border p-2 rounded w-full"
      value={form.issue}
      onChange={e => setForm({ ...form, issue: e.target.value })}
    />
  </div>

  {/* Total Cost */}
  <div className="col-span-2">
    <h3>Total Cost</h3>
    <input
      type="number"
      placeholder="Total Cost"
      className="border p-2 rounded w-full"
      value={form.repair_cost}
      onChange={e => setForm({ ...form, repair_cost: Number(e.target.value) })}
    />
  </div>

    {/* Advance */}
  <div className="col-span-2">
    <h3>Advance</h3>
    <input
      type="number"
      placeholder="Advance"
      className="border p-2 rounded w-full"
      value={form.advance }
      onChange={e => setForm({ ...form, advance: Number(e.target.value) })}
    />
  </div>

  {/* Buttons */}
  <div className="col-span-6 flex gap-2 mt-2">
    <button
      onClick={handleSubmit}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      {editingId ? "Update" : "Add"}
    </button>
    {editingId && (
      <button
        onClick={resetForm}
        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
      >
        Cancel
      </button>
    )}
  </div>
</div>

      {/* Pending Repairs */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="text-xl font-semibold bg-yellow-400 text-black px-4 py-2 rounded-t">
          Pending Repairs
        </h2>
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Issue</th>
              <th className="p-2 text-left">Cost</th>
              <th className="p-2 text-left">Advance</th>
              <th className="p-2 text-left">Balance</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRepairs.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4">No pending repairs</td>
              </tr>
            )}
            {pendingRepairs.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{r.customer_name}</td>
                <td className="p-2">{r.phone_model}</td>
                <td className="p-2">{r.issue}</td>
                <td className="p-2"> Rs. {Number(r.repair_cost).toFixed(2)}</td>
                <td className="p-2"> Rs. {Number(r.advance).toFixed(2)}</td>
                <td className="p-2"> Rs. {(Number(r.repair_cost) - Number(r.advance)).toFixed(2)}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => markAsDone(r.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">DONE</button>
                  <button onClick={() => handleEdit(r)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Completed Repairs */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <h2 className="text-xl font-semibold bg-green-500 text-white px-4 py-2 rounded-t">
          Completed Repairs
        </h2>
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Issue</th>
              <th className="p-2 text-left">Cost</th>
              <th className="p-2 text-left">Advance</th>
              <th className="p-2 text-left">Balance</th>
            </tr>
          </thead>
          <tbody>
            {completedRepairs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4">No completed repairs</td>
              </tr>
            )}
            {completedRepairs.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{r.customer_name}</td>
                <td className="p-2">{r.phone_model}</td>
                <td className="p-2">{r.issue}</td>
                <td className="p-2">Rs. {Number(r.repair_cost).toFixed(2)}</td>
                <td className="p-2">Rs. {Number(r.advance).toFixed(2)}</td>
                <td className="p-2">Rs. {(Number(r.repair_cost) - Number(r.advance)).toFixed(2)}</td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
