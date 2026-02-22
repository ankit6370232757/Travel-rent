import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ArrowUpRight, ArrowDownLeft, 
  RefreshCw, Gift, Download, Loader2,
  AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import * as XLSX from 'xlsx'; 
import api from "../../api/axios"; 
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Container = styled(motion.div)`
  display: flex; flex-direction: column; gap: 20px;
`;

const Toolbar = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.03); padding: 15px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  flex-wrap: wrap; gap: 15px;

  .search-box {
    display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.2);
    padding: 10px 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
    input { background: transparent; border: none; color: #fff; outline: none; width: 250px; }
  }

  .actions { display: flex; gap: 10px; flex-wrap: wrap; }
`;

const FilterBtn = styled.button`
  background: ${props => props.active ? "rgba(62, 166, 255, 0.2)" : "transparent"};
  color: ${props => props.active ? "#3ea6ff" : "#888"};
  border: 1px solid ${props => props.active ? "#3ea6ff" : "rgba(255,255,255,0.1)"};
  padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;
  transition: all 0.2s;
  &:hover { color: #fff; border-color: #fff; }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  background: rgba(255,255,255,0.01);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 1000px;
  th { text-align: left; padding: 15px; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; }
  td { background: rgba(255,255,255,0.02); padding: 15px; color: #ddd; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05); }
  td:first-child { border-radius: 12px 0 0 12px; border-left: 1px solid rgba(255,255,255,0.05); }
  td:last-child { border-radius: 0 12px 12px 0; border-right: 1px solid rgba(255,255,255,0.05); }
`;

const PaginationBar = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px; background: rgba(255,255,255,0.02); border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);

  .page-info { color: #666; font-size: 13px; }
  .nav-btns { display: flex; gap: 8px; }
`;

const NavBtn = styled.button`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s;
  &:disabled { opacity: 0.3; cursor: not-allowed; }
  &:not(:disabled):hover { background: #3ea6ff; border-color: #3ea6ff; }
`;

const TxBadge = styled.div`
  display: flex; align-items: center; gap: 8px; width: fit-content;
  padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
  background: ${props => props.$bg}; color: ${props => props.$color};
  text-transform: uppercase;
`;

const Amount = styled.span`
  font-weight: 700; font-size: 15px;
  color: ${props => props.$type === 'debit' ? '#e74c3c' : '#2ecc71'};
`;

export default function AdminFinance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/finance/all-logs");
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to sync ledger data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 🔍 Filter & Search Logic
  const allFilteredData = useMemo(() => {
    return transactions.filter(tx => {
      const term = search.toLowerCase();
      const matchesSearch = 
        tx.txn_id?.toString().toLowerCase().includes(term) || 
        tx.user_name?.toLowerCase().includes(term) ||
        tx.user_id?.toString().includes(term);
      
      const matchesFilter = 
        filter === "ALL" || 
        tx.type === filter ||
        (filter === "ROI" && tx.type?.includes("ROI"));

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  // 📑 Pagination Logic
  const totalPages = Math.ceil(allFilteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return allFilteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [allFilteredData, currentPage]);

  const handleExport = () => {
    if (allFilteredData.length === 0) return toast.error("No data available");
    const exportData = allFilteredData.map((tx, index) => ({
      "S.N.": index + 1,
      "Transaction ID": `#${tx.txn_id}`,
      "User Name": tx.user_name,
      "User UID": tx.user_id,
      "Type": tx.type,
      "Amount ($)": tx.amount,
      "Status": tx.status,
      "Date": new Date(tx.created_at).toLocaleDateString(),
      "Time": new Date(tx.created_at).toLocaleTimeString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance_Ledger");
    XLSX.writeFile(wb, `Finance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel report generated!");
  };

  const getStyle = (type) => {
    const t = type?.toUpperCase() || "";
    if (t.includes('DEPOSIT')) return { bg: 'rgba(46, 204, 113, 0.1)', col: '#2ecc71', icon: <ArrowDownLeft size={14}/> };
    if (t.includes('WITHDRAW')) return { bg: 'rgba(231, 76, 60, 0.1)', col: '#e74c3c', icon: <ArrowUpRight size={14}/> };
    if (t.includes('ROI')) return { bg: 'rgba(62, 166, 255, 0.1)', col: '#3ea6ff', icon: <RefreshCw size={14}/> };
    if (t.includes('REFERRAL')) return { bg: 'rgba(155, 89, 182, 0.1)', col: '#9b59b6', icon: <Gift size={14}/> };
    return { bg: 'rgba(255,255,255,0.05)', col: '#888', icon: <Search size={14}/> };
  };

  return (
    <Container initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
            <h2 style={{color:'#fff', margin:0, fontSize: '24px'}}>Global Financial Ledger</h2>
            <p style={{color: '#666', fontSize: '13px', marginTop: '5px'}}>Monitoring {allFilteredData.length} total records.</p>
        </div>
        <button onClick={handleExport} disabled={loading} style={{ background: '#2ecc71', border: 'none', padding: '10px 22px', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, opacity: loading ? 0.5 : 1 }}>
          <Download size={18}/> Export Excel
        </button>
      </div>

      <Toolbar>
        <div className="search-box">
          <Search size={18} color="#444"/>
          <input placeholder="Search Name, UID or TXN..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="actions">
          {['ALL', 'DEPOSIT', 'WITHDRAW', 'ROI', 'REFERRAL'].map(f => (
            <FilterBtn key={f} active={filter === f} onClick={() => { setFilter(f); setCurrentPage(1); }}>{f}</FilterBtn>
          ))}
          <FilterBtn onClick={fetchLogs} title="Reload Data"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></FilterBtn>
        </div>
      </Toolbar>

      <TableWrapper>
        {loading ? (
          <div style={{padding: '100px', textAlign: 'center', color: '#666'}}>
            <Loader2 className="animate-spin" size={32} style={{margin: '0 auto 15px', color: '#3ea6ff'}} />
            <p>Syncing with Database...</p>
          </div>
        ) : allFilteredData.length === 0 ? (
          <div style={{padding: '100px', textAlign: 'center', color: '#555'}}>
            <AlertCircle size={40} style={{margin: '0 auto 15px', opacity: 0.2}} />
            <p>No records found.</p>
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>S.N.</th>
                  <th>Transaction ID</th>
                  <th>User Details</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Processed At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((tx, index) => {
                    const style = getStyle(tx.type);
                    const isDebit = tx.type === 'WITHDRAW';
                    const serialNumber = (currentPage - 1) * rowsPerPage + index + 1;
                    return (
                      <motion.tr key={tx.txn_id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td style={{ color: '#555', fontWeight: 800 }}>{serialNumber}</td>
                        <td style={{ fontFamily: 'monospace', color: '#3ea6ff', fontWeight: 700 }}>#{tx.txn_id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{tx.user_name}</div>
                          <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>UID: {tx.user_id}</div>
                        </td>
                        <td><TxBadge $bg={style.bg} $color={style.col}>{style.icon} {tx.type}</TxBadge></td>
                        <td><Amount $type={isDebit ? 'debit' : 'credit'}>{isDebit ? '-' : '+'}${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Amount></td>
                        <td>
                          <div style={{ fontSize: '13px', color: '#ddd' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                          <div style={{ fontSize: '11px', color: '#555' }}>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <span style={{ color: (tx.status?.toLowerCase() === 'success' || tx.status?.toLowerCase() === 'completed') ? '#2ecc71' : '#f1c40f', fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} /> {tx.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </Table>

            <PaginationBar>
              <div className="page-info">
                Showing {Math.min((currentPage - 1) * rowsPerPage + 1, allFilteredData.length)} to {Math.min(currentPage * rowsPerPage, allFilteredData.length)} of {allFilteredData.length} records
              </div>
              <div className="nav-btns">
                <NavBtn disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                  <ChevronLeft size={20} />
                </NavBtn>
                <NavBtn disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                  <ChevronRight size={20} />
                </NavBtn>
              </div>
            </PaginationBar>
          </>
        )}
      </TableWrapper>
    </Container>
  );
}