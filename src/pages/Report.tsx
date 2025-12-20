import { useState } from "react";
import axios from "axios";
import { API_URL } from "../api/api";

interface Report {
  total_profit: number;
  total_items_sold: number;
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

      const res = await axios.get<Report>(
        `${API_URL}/reports/all`,
        {
          params: { range },
        }
      );

      setReport({
        total_profit: Number(res.data.total_profit) || 0,
        total_items_sold: Number(res.data.total_items_sold) || 0,
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
      <h1 className="text-3xl font-bold mb-4">Sales Report</h1>

      {/* Controls */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={range}
          onChange={e => setRange(e.target.value)}
          className="border px-3 py-2 rounded"
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Report
        </button>
      </div>

      {/* Status */}
      {loading && <p className="text-blue-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Result */}
      {report && !loading && (
        <div className="bg-white p-4 rounded shadow-md w-full sm:w-1/2">
          <p className="mb-2">
            <b>Total Profit:</b>{" "}
            <span className="text-green-600">
              Rs. {report.total_profit.toFixed(2)}
            </span>
          </p>
          <p>
            <b>Total Items Sold:</b>{" "}
            <span className="text-blue-600">
              {report.total_items_sold}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
