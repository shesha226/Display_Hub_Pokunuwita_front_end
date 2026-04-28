import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Filter,
  Package,
  Tag,
  Smartphone,
  Headphones,
  Battery,
  Shield,
  Speaker
} from "lucide-react";

/* ================= TYPES ================= */
type Category =
  | "tempered"
  | "backcover"
  | "battery"
  | "charger"
  | "phone"
  | "handfree"
  | "earphone"
  | "speaker"
  | "case"
  | "other";

const CATEGORIES: Category[] = [
  "tempered", "backcover", "battery", "charger", "phone",
  "handfree", "earphone", "speaker", "case", "other"
];

interface Accessory {
  id: number;
  category: Category;
  item_name: string;
  item_number: string;
  wholesale_price: number;
  price: number;
  discount: number;
  offer_price: number;
  qty_on_hand: number;
  created_at: string;
}

/* ================= HELPER: Category Colors ================= */
const getCategoryColor = (cat: Category) => {
  switch (cat) {
    case "phone": return "bg-blue-100 text-blue-800";
    case "battery": return "bg-green-100 text-green-800";
    case "tempered": return "bg-purple-100 text-purple-800";
    case "charger": return "bg-yellow-100 text-yellow-800";
    case "speaker": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getCategoryIcon = (cat: Category) => {
  switch (cat) {
    case "phone": return <Smartphone size={14} className="mr-1" />;
    case "tempered": return <Shield size={14} className="mr-1" />;
    case "earphone":
    case "handfree": return <Headphones size={14} className="mr-1" />;
    case "battery": return <Battery size={14} className="mr-1" />;
    case "speaker": return <Speaker size={14} className="mr-1" />;
    default: return <Tag size={14} className="mr-1" />;
  }
};

export default function Accessories() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    category: "tempered" as Category,
    item_name: "",
    item_number: "",
    wholesale_price: 0,
    price: 0,
    discount: 0,
    offer_price: 0,
    qty_on_hand: 0,
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchAccessories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/accessories`);
      setAccessories(res.data.accessories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  const openModal = (item?: Accessory) => {
    if (item) {
      setForm({
        category: item.category,
        item_name: item.item_name,
        item_number: item.item_number,
        wholesale_price: item.wholesale_price || 0,
        price: item.price,
        discount: item.discount,
        offer_price: item.offer_price,
        qty_on_hand: item.qty_on_hand,
      });
      setEditingId(item.id);
    } else {
      setForm({
        category: "tempered",
        item_name: "",
        item_number: "",
        wholesale_price: 0,
        price: 0,
        discount: 0,
        offer_price: 0,
        qty_on_hand: 0,
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.item_name || !form.item_number) return alert("Please enter valid data");

    try {
      if (editingId) {
        await axios.put(`${API_URL}/accessories/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/accessories`, form);
      }
      closeModal();
      fetchAccessories();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`${API_URL}/accessories/${id}`);
      fetchAccessories();
    } catch (err: any) {
      alert("Failed to delete");
    }
  };

  const filtered = accessories.filter(
    a =>
      (a.item_name.toLowerCase().includes(search.toLowerCase()) ||
        a.item_number.toLowerCase().includes(search.toLowerCase())) &&
      (categoryFilter === "all" || a.category === categoryFilter)
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="text-blue-600" /> Inventory Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage phones and accessories stock.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Add New Item
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or number..."
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-gray-500" size={18} />
          <select
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as Category | "all")}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price Info</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{a.item_name}</div>
                    <div className="text-xs text-gray-500">#{a.item_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(a.category)}`}>
                      {getCategoryIcon(a.category)} {a.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">Sell: Rs. {a.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">Cost: Rs. {(a.wholesale_price || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${a.qty_on_hand > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {a.qty_on_hand}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(a)} className="text-blue-600 bg-blue-50 p-2 rounded-full mr-2 transition">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 bg-red-50 p-2 rounded-full transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.item_name}
                  onChange={e => setForm({ ...form, item_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Number</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.item_number}
                  onChange={e => setForm({ ...form, item_number: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as Category })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Numerical inputs with the 0 fix */}
              {[
                { label: "Cost (Wholesale) Rs", field: "wholesale_price" },
                { label: "Selling Price Rs", field: "price" },
                { label: "Discount Rs", field: "discount" },
                { label: "Offer Price Rs", field: "offer_price" },
                { label: "Stock Quantity", field: "qty_on_hand" }
              ].map((inp) => (
                <div key={inp.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{inp.label}</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                    value={(form as any)[inp.field] === 0 ? "" : (form as any)[inp.field]}
                    onChange={e => setForm({ ...form, [inp.field]: e.target.value === "" ? 0 : Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition font-medium">
                {editingId ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}