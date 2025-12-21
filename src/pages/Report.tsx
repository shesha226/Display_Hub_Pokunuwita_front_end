import { useState } from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Report {
  total_profit: number;
  total_items_sold: number;
  daily_data: { date: string; profit: number; items_sold: number }[]; // for chart
}

export default function Reports() {
  const [range, setRange] = useState("7d");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get<Report>(`${API_URL}/reports/all`, {
        params: { range },
      });

      setReport({
        total_profit: Number(res.data.total_profit) || 0,
        total_items_sold: Number(res.data.total_items_sold) || 0,
        daily_data: res.data.daily_data || [], // chart data
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 Sales Report</h1>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last 1 Year</option>
        </select>

        <button
          onClick={fetchReport}
          className="bg-blue-500 text-white px-5 py-2 rounded shadow hover:bg-blue-600 transition-colors"
        >
          Generate Report
        </button>
      </div>

      {/* Status */}
      {loading && <p className="text-blue-600 mb-4">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Result Cards */}
      {report && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow-md flex flex-col items-center justify-center">
            <p className="text-gray-500 uppercase text-sm mb-2">Total Profit</p>
            <p className="text-3xl font-bold text-green-600">
              Rs. {report.total_profit.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow-md flex flex-col items-center justify-center">
            <p className="text-gray-500 uppercase text-sm mb-2">Total Items Sold</p>
            <p className="text-3xl font-bold text-blue-600">
              {report.total_items_sold}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {report && report.daily_data.length > 0 && (
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Sales & Profit Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.daily_data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="profit" fill="#82ca9d" name="Profit (Rs)" />
              <Bar yAxisId="right" dataKey="items_sold" fill="#8884d8" name="Items Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
