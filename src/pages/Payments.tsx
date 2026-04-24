import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api/api";
import { 
  Wrench, 
  ShoppingBag, 
  Search, 
  Printer, 
  X, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  User,
  Hash
} from "lucide-react";

// Interfaces
interface Repair {
  id: number;
  invoice_number: string | null;
  customer_name: string;
  phone_model: string;
  issue: string;
  repair_cost: number | null;
  advance: number | null;
  status: "pending" | "completed";
}

interface Order {
  id: number;
  invoice_number: string | null;
  customer_name: string;
  customer_phone: string;
  total_amount: number | null;
  items?: any[];
  created_at: string;
}

// Unified interface for the table
interface CombinedRecord {
  uniqueKey: string;
  type: 'Repair' | 'Sale';
  invoice: string;
  customer: string;
  contact: string;
  amount: number;
  originalData: any;
}

const LIMIT = 10;

export default function UnifiedTransactionTable() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<CombinedRecord | null>(null);

  useEffect(() => {
    fetchRepairs();
    fetchOrders();
  }, []);

  const fetchRepairs = async () => {
    try {
      const res = await axios.get(`${API_URL}/repair-parts`);
      setRepairs(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      const data = Array.isArray(res.data?.orders) ? res.data.orders : Array.isArray(res.data) ? res.data : [];
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      // Update the selected record with full item details
      setSelectedRecord(prev => prev ? {
        ...prev,
        originalData: { ...res.data }
      } : null);
    } catch (err) { alert("Failed to fetch details"); }
  };

  // --- COMBINE AND FILTER LOGIC ---
  const combinedData: CombinedRecord[] = [
    // 1. Filter completed repairs and map
    ...repairs
      .filter(r => r.status === "completed")
      .map(r => ({
        uniqueKey: `repair-${r.id}`,
        type: 'Repair' as const,
        invoice: r.invoice_number || 'N/A',
        customer: r.customer_name,
        contact: r.phone_model,
        amount: Number(r.repair_cost || 0) - Number(r.advance || 0),
        originalData: r
      })),
    // 2. Map sales
    ...orders.map(o => ({
      uniqueKey: `sale-${o.id}`,
      type: 'Sale' as const,
      invoice: o.invoice_number || 'N/A',
      customer: o.customer_name,
      contact: o.customer_phone,
      amount: Number(o.total_amount || 0),
      originalData: o
    }))
  ];

 // --- COMBINE AND FILTER LOGIC ---
const filteredData = combinedData.filter(item => {
  const customer = item.customer?.toLowerCase() ?? "";
  const invoice = item.invoice?.toLowerCase() ?? "";
  const contact = item.contact?.toLowerCase() ?? "";
  const query = searchQuery.toLowerCase();

  return (
    customer.includes(query) ||
    invoice.includes(query) ||
    contact.includes(query)
  );
});

  const paginatedData = filteredData.slice((page - 1) * LIMIT, page * LIMIT);
  const totalPages = Math.ceil(filteredData.length / LIMIT);

  const handlePrint = () => {
    const printContent = document.getElementById("print-bill");
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:30px;} table{width:100%;border-collapse:collapse;} td,th{border:1px solid #eee;padding:10px;}</style></head><body>${printContent.innerHTML}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* MAIN TABLE */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">TRANSACTIONS</h2>
            <p className="text-gray-500 text-sm">Combined view of completed repairs and sales.</p>
          </div>
          
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              placeholder="Search by Invoice, Customer or Phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Info</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact / Model</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Net Amount</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedData.map((item) => (
                <tr key={item.uniqueKey} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4">
                    {item.type === 'Repair' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                        <Wrench size={12} /> Repair
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                        <ShoppingBag size={12} /> Sale
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.customer}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Hash size={10}/>{item.invoice}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 font-medium">
                    {item.contact}
                  </td>
                  <td className="p-4 text-right">
  <div className="font-black text-gray-900">
    Rs. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </div>
</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => {
                        setSelectedRecord(item);
                        if (item.type === 'Sale') fetchOrderDetails(item.originalData.id);
                      }}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-900 hover:text-white transition shadow-sm"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-bold">Showing {paginatedData.length} of {filteredData.length} records</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg bg-white border disabled:opacity-30"><ChevronLeft size={16}/></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg bg-white border disabled:opacity-30"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* BILL SIDEBAR */}
      {selectedRecord && (
        <div className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-50 border-l flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="font-black uppercase tracking-widest text-xs text-gray-400">Invoice Preview</h3>
            <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"><X size={20}/></button>
          </div>

          <div className="p-8 flex-1 overflow-y-auto" id="print-bill">
             {/* Invoice Brand */}
             <div className="flex justify-between items-start mb-10">
                <div>
                  <h1 className="text-2xl font-black tracking-tighter">DISPLAYSHUB</h1>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[3px]">Mobile Solutions</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black bg-gray-900 text-white px-2 py-1 rounded uppercase mb-1">
                    {selectedRecord.type}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold">#{selectedRecord.invoice}</p>
                </div>
             </div>

             {/* Customer Box */}
             <div className="bg-gray-50 p-4 rounded-xl mb-8 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bill To</p>
                  <p className="font-bold text-gray-900 flex items-center gap-1"><User size={14}/> {selectedRecord.customer}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={14}/> {selectedRecord.contact}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date</p>
                   <p className="text-xs font-bold">{new Date().toLocaleDateString()}</p>
                </div>
             </div>

             {/* Table */}
             <table className="w-full text-sm mb-8">
                <thead className="border-b-2 border-gray-900">
                   <tr className="text-[10px] font-black uppercase text-gray-400">
                      <th className="py-3 text-left">Description</th>
                      <th className="py-3 text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {selectedRecord.type === 'Repair' ? (
                     <tr>
                        <td className="py-4">
                           <p className="font-bold">{selectedRecord.originalData.issue}</p>
                           <p className="text-xs text-gray-400">{selectedRecord.originalData.phone_model}</p>
                        </td>
                        <td className="py-4 text-right font-bold">Rs. {Number(selectedRecord.originalData.repair_cost).toLocaleString()}</td>
                     </tr>
                   ) : (
                     selectedRecord.originalData.items?.map((item: any, i: number) => (
                       <tr key={i}>
                          <td className="py-3">
                             <p className="font-bold">{item.item_name}</p>
                             <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </td>
                          <td className="py-3 text-right font-bold">Rs. {item.final_price.toLocaleString()}</td>
                       </tr>
                     ))
                   )}
                </tbody>
             </table>

             {/* Calculation */}
             <div className="space-y-2 border-t-2 border-gray-900 pt-4">
                {selectedRecord.type === 'Repair' && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                     <span>Advance Paid</span>
                     <span>- Rs. {Number(selectedRecord.originalData.advance).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black">
                   <span>NET TOTAL</span>
                   <span>Rs. {selectedRecord.amount.toLocaleString()}</span>
                </div>
             </div>

             <div className="mt-16 text-center border-t border-dashed pt-6">
                <p className="text-[10px] font-black uppercase tracking-[4px] text-gray-300">Thank You</p>
             </div>
          </div>

          <div className="p-6 bg-gray-50 border-t">
            <button onClick={handlePrint} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-black transition shadow-lg tracking-widest text-xs">
              <Printer size={18} /> PRINT INVOICE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}