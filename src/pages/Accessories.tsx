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

/* ================= COMPONENT ================= */
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
    price: 0,
    discount: 0,
    offer_price: 0,
    qty_on_hand: 0,
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  /* ================= FETCH ================= */
  const fetchAccessories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/accessories`);
      setAccessories(res.data.accessories || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch accessories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  /* ================= HANDLERS ================= */
  const openModal = (item?: Accessory) => {
    if (item) {
      // Edit Mode
      setForm({
        category: item.category,
        item_name: item.item_name,
        item_number: item.item_number,
        price: item.price,
        discount: item.discount,
        offer_price: item.offer_price,
        qty_on_hand: item.qty_on_hand,
      });
      setEditingId(item.id);
    } else {
      // Add Mode (Reset)
      setForm({
        category: "tempered",
        item_name: "",
        item_number: "",
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
    let { category, item_name, item_number, price, discount, offer_price, qty_on_hand } = form;

    if (!item_name || !item_number || price < 0 || qty_on_hand < 0) {
      return alert("Please enter valid data");
    }

    try {
      const payload = {
        item_name,
        price: Number(price),
        category,
        item_number,
        discount: Number(discount),
        offer_price: Number(offer_price),
        qty_on_hand: Number(qty_on_hand),
      };

      if (editingId) {
        await axios.put(`${API_URL}/accessories/${editingId}`, payload);
      } else {
        await axios.post(`${API_URL}/accessories`, payload);
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
      setAccessories(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  /* ================= FILTER ================= */
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
            className="border border-gray-300 pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
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
              {filtered.length > 0 ? (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{a.item_name}</div>
                      <div className="text-xs text-gray-500">#{a.item_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(a.category)}`}>
                        {getCategoryIcon(a.category)}
                        {a.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">Rs. {a.price.toFixed(2)}</div>
                      {a.discount > 0 && (
                        <div className="text-xs text-green-600">Off: {a.offer_price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${a.qty_on_hand > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.qty_on_hand}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(a)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full mr-2 transition">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package size={40} className="text-gray-300 mb-2" />
                      <p>No items found matching your search.</p>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all">

            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Item" : "Add New Item"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition">
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. iPhone 13 Backcover"
                  value={form.item_name}
                  onChange={e => setForm({ ...form, item_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Number (Code)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. A-001"
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
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: +e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.qty_on_hand}
                  onChange={e => setForm({ ...form, qty_on_hand: +e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Rs)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.discount}
                  onChange={e => setForm({ ...form, discount: +e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (Rs)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={form.offer_price}
                  onChange={e => setForm({ ...form, offer_price: +e.target.value })}
                />
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
                {editingId ? "Save Changes" : "Add Item"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}