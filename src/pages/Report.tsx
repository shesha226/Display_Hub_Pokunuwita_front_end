import { useState, useEffect } from "react";
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
  Legend,
  AreaChart,
  Area
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
  Package,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";

interface TopItem {
  id: string;
  name: string;
  qty: number;
  revenue: number;
}

interface DailyRecord {
  date: string;
  profit: number;
  items_sold: number;
  revenue: number;
}

interface Report {
  total_profit: number;
  total_revenue: number;
  total_items_sold: number;
  daily_data: DailyRecord[];
  top_items: TopItem[];
}

export default function Reports() {
  const [range, setRange] = useState("7d");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReport();
  }, [range]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get<Report>(`${API_URL}/reports/all`, {
        params: { range },
      });

      // Backend data sanitize කිරීම
      setReport({
        total_profit: Number(res.data.total_profit) || 0,
        total_revenue: Number(res.data.total_revenue) || 0,
        total_items_sold: Number(res.data.total_items_sold) || 0,
        daily_data: Array.isArray(res.data.daily_data) ? res.data.daily_data : [],
        top_items: Array.isArray(res.data.top_items) ? res.data.top_items : [],
      });
    } catch (err: any) {
      console.error(err);
      setError("දත්ත ලබා ගැනීමට නොහැකි විය. කරුණාකර සම්බන්ධතාවය පරීක්ෂා කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            BUSINESS <span className="text-blue-600">INSIGHTS</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Real-time performance tracking and sales analytics.
          </p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5 transition-all hover:border-blue-300">
          <Calendar className="w-4 h-4 text-slate-400 ml-3" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-transparent border-none text-sm font-bold focus:ring-0 text-slate-700 cursor-pointer py-2 pl-2 pr-10 appearance-none"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="1y">Last 1 Year</option>
          </select>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-8 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <div className="absolute inset-0 blur-xl bg-blue-400/20 rounded-full animate-pulse"></div>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[4px] mt-6">Syncing Data</p>
        </div>
      ) : (
        report && (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Revenue */}
              <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 transition-transform">
                    <DollarSign size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Revenue</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    Rs. {report.total_revenue.toLocaleString()}
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:text-blue-50 group-hover:scale-125 transition-all">
                  <DollarSign size={140} />
                </div>
              </div>

              {/* Profit */}
              <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform">
                    <TrendingUp size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Net Profit</p>
                  <p className="text-3xl font-black text-emerald-600 mt-2">
                    Rs. {report.total_profit.toLocaleString()}
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:text-emerald-50 group-hover:scale-125 transition-all">
                  <TrendingUp size={140} />
                </div>
              </div>

              {/* Sales */}
              <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform">
                    <Package size={24} />
                  </div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Orders Handled</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {report.total_items_sold}
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-50 group-hover:text-indigo-50 group-hover:scale-125 transition-all">
                  <ShoppingBag size={140} />
                </div>
              </div>
            </div>

            {/* MAIN CHART & TOP ITEMS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Chart */}
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    Income vs Sales Trend
                  </h2>
                </div>
                
                <div className="h-[400px] w-full">
                  {report.daily_data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.daily_data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700}}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700}}
                        />
                        <Tooltip 
                          cursor={{fill: '#F8FAFC'}}
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold'}} />
                        <Bar 
                          dataKey="profit" 
                          name="Profit" 
                          fill="url(#profitGradient)" 
                          radius={[6, 6, 0, 0]} 
                          barSize={30}
                        />
                        <Bar 
                          dataKey="items_sold" 
                          name="Units Sold" 
                          fill="#6366F1" 
                          radius={[6, 6, 0, 0]} 
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <AlertCircle size={48} strokeWidth={1} />
                      <p className="mt-4 font-bold text-sm tracking-widest uppercase">No data for this period</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-2">
                  <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                  Top Selling
                </h2>

                <div className="flex-1 space-y-4">
                  {report.top_items.length > 0 ? (
                    report.top_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-900 transition-all cursor-default">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-slate-900 transition-colors">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-white transition-colors">{item.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.qty} units moved</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm group-hover:text-emerald-400 transition-colors">Rs. {item.revenue.toLocaleString()}</p>
                          <ArrowUpRight size={14} className="ml-auto text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-20 text-xs font-bold uppercase tracking-widest">Inventory static</p>
                  )}
                </div>

                <button className="w-full mt-6 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[2px] flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg">
                  Full Inventory <ChevronRight size={14} />
                </button>
              </div>

            </div>
          </>
        )
      )}
    </div>
  );
}