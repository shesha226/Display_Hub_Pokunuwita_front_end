import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api/api";

/* ================= TYPES ================= */

type Category =
  | "tempered"
  | "backcover"
  | "battery"
  | "charger"
  | "phone"
  | "HandFree"
  | "earphone"
  | "speaker"
  | "other";

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

/* ================= COMPONENT ================= */

export default function Accessories() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<Category | "all">("all");

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
      const res = await axios.get(`${API_URL}/accessories`);
      setAccessories(res.data.accessories);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch accessories");
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  /* ================= HELPERS ================= */

  const resetForm = () => {
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
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const { category, item_name, item_number, price, qty_on_hand } = form;

    if (!category || !item_name || !item_number || price < 0 || qty_on_hand < 0) {
      return alert("Please enter valid data");
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/accessories/${editingId}`, form);
        alert("Accessory updated");
      } else {
        await axios.post(`${API_URL}/accessories`, form);
        alert("Accessory added");
      }

      resetForm();
      fetchAccessories();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (a: Accessory) => {
    setForm({
      category: a.category,
      item_name: a.item_name,
      item_number: a.item_number,
      price: a.price,
      discount: a.discount,
      offer_price: a.offer_price,
      qty_on_hand: a.qty_on_hand,
    });
    setEditingId(a.id);
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item?")) return;

    try {
      await axios.delete(`${API_URL}/accessories/${id}`);
      fetchAccessories();
    } catch {
      alert("Failed to delete");
    }
  };

  /* ================= FILTER ================= */

  const filtered = accessories.filter(a =>
    a.item_name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === "all" || a.category === categoryFilter)
  );

  /* ================= UI ================= */

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Accessories & Phones</h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search item..."
          className="border px-3 py-2 rounded w-full sm:w-1/3"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={categoryFilter}
          onChange={e =>
            setCategoryFilter(e.target.value as Category | "all")
          }
        >
          <option value="all">All Categories</option>
          <option value="tempered">Tempered Glass</option>
          <option value="backcover">Back Cover</option>
          <option value="battery">Battery</option>
          <option value="charger">Charger</option>
          <option value="phone">Phone</option>
          <option value="HandFree">HandFree</option>
          <option value="earphone">Earphone</option>
          <option value="speaker">Speaker</option>
          <option value="case">Case</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* FORM */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-8 gap-2 items-end bg-white p-4 rounded shadow">
        <div className="flex flex-col">
          <label className="font-semibold">Category</label>
          <select
            className="border px-2 py-1 rounded"
            value={form.category}
            onChange={e =>
              setForm({ ...form, category: e.target.value as Category })
            }
          >
            <option value="tempered">Tempered</option>
            <option value="backcover">Back Cover</option>
            <option value="battery">Battery</option>
            <option value="charger">Charger</option>
            <option value="phone">Phone</option>
            <option value="HandFree">HandFree</option>
            <option value="earphone">Earphone</option>
            <option value="speaker">Speaker</option>
            <option value="case">Case</option>
            <option value="other">Other</option>


          </select>
        </div>

        <input
          className="border px-2 py-1 rounded"
          placeholder="Name"
          value={form.item_name}
          onChange={e => setForm({ ...form, item_name: e.target.value })}
        />

        <input
          className="border px-2 py-1 rounded"
          placeholder="Number"
          value={form.item_number}
          onChange={e => setForm({ ...form, item_number: e.target.value })}
        />

        <input
          type="number"
          className="border px-2 py-1 rounded"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: +e.target.value })}
        />

        <input
          type="number"
          className="border px-2 py-1 rounded"
          placeholder="Discount"
          value={form.discount}
          onChange={e => setForm({ ...form, discount: +e.target.value })}
        />

        <input
          type="number"
          className="border px-2 py-1 rounded"
          placeholder="Offer"
          value={form.offer_price}
          onChange={e => setForm({ ...form, offer_price: +e.target.value })}
        />

        <input
          type="number"
          className="border px-2 py-1 rounded"
          placeholder="Stock"
          value={form.qty_on_hand}
          onChange={e => setForm({ ...form, qty_on_hand: +e.target.value })}
        />

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 px-3 py-1 text-white rounded hover:bg-blue-600"
          >
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="bg-gray-400 px-3 py-1 text-white rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Number</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Discount</th>
              <th className="px-3 py-2">Offer</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-100">
                <td className="px-3 py-2">{a.id}</td>
                <td className="px-3 py-2 capitalize">{a.category}</td>
                <td className="px-3 py-2">{a.item_name}</td>
                <td className="px-3 py-2">{a.item_number}</td>
                <td className="px-3 py-2">{a.price.toFixed(2)}</td>
                <td className="px-3 py-2">{a.discount.toFixed(2)}</td>
                <td className="px-3 py-2">{a.offer_price.toFixed(2)}</td>
                <td className="px-3 py-2">{a.qty_on_hand}</td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    onClick={() => handleEdit(a)}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-500 px-2 py-1 rounded text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
