import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api/api";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // ← get JWT token
      if (!token) {
        alert("Please login first!");
        setLoading(false);
        return;
      }

      const res = await axios.get<User[]>(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }, // ← send token
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= FILTER ================= */
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= ADD / UPDATE USER ================= */
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      if (selectedUser) {
        // Update
        await axios.put(`${API_URL}/users/${selectedUser.id}`, {
          name,
          email,
          password: password || undefined,
        });
        alert("User updated!");
      } else {
        // Create
        await axios.post(`${API_URL}/users/register`, { name, email, password });
        alert("User added!");
      }

      setName("");
      setEmail("");
      setPassword("");
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save user");
    }
  };

  /* ================= DELETE USER ================= */
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      fetchUsers();
      alert("User deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  /* ================= SELECT USER ================= */
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      {/* ================= SEARCH ================= */}
      <input
        className="border px-3 py-2 rounded w-full sm:w-1/3"
        placeholder="Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= ADD / UPDATE USER FORM ================= */}
      <div className="bg-white p-4 rounded shadow my-4">
        <h2 className="text-xl font-semibold mb-2">
          {selectedUser ? "Edit User" : "Add New User"}
        </h2>
        <form
          onSubmit={handleSaveUser}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <input
            type="text"
            className="border px-2 py-1 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="border px-2 py-1 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="border px-2 py-1 rounded"
            placeholder={selectedUser ? "New Password (optional)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!selectedUser}
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-3 py-1 rounded col-span-1 sm:col-span-2"
          >
            {selectedUser ? "Update User" : "Add User"}
          </button>
        </form>
      </div>

      {/* ================= USERS TABLE ================= */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleEditUser(u)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
