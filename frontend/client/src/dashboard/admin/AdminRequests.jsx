import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Check, X, Clock, CheckCircle, 
  XCircle, Search, Calendar, FileSpreadsheet,
  ChevronLeft, ChevronRight, AlertCircle 
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';

// --- STYLED COMPONENTS ---

const Section = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 25px;
  overflow-x: auto;
`;

const TopHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 10px 15px 10px 40px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: all 0.3s;
    &:focus { border-color: #3ea6ff; background: rgba(255,255,255,0.08); }
  }

  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #666; }
`;

const SubNav = styled.div`
  display: flex; gap: 8px;
  background: rgba(255, 255, 255, 0.03); padding: 6px; border-radius: 12px;
`;

const NavItem = styled.button`
  background: ${props => props.$active ? 'rgba(62, 166, 255, 0.1)' : 'transparent'};
  color: ${props => props.$active ? '#3ea6ff' : '#888'};
  border: 1px solid ${props => props.$active ? 'rgba(62, 166, 255, 0.2)' : 'transparent'};
  padding: 6px 14px; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 13px; transition: all 0.3s ease;
  &:hover { color: #fff; background: rgba(255,255,255,0.05); }
`;

const StatsHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 10px 15px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-width: 140px;

  span { color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  h4 { margin: 2px 0 0 0; font-size: 16px; color: #fff; }
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 900px;
  th { text-align: left; padding: 10px; color: #888; font-size: 12px; text-transform: uppercase; }
  td { padding: 12px 10px; color: #ddd; font-size: 14px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 12px 0 0 12px; text-align: center; width: 50px; }
  td:last-child { border-radius: 0 12px 12px 0; }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; gap: 6px; width: fit-content;
  background: ${props => props.$bg}; color: ${props => props.$color};
`;

const ActionBtn = styled.button`
  width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; margin-right: 8px;
  background: ${props => props.$bg}; color: ${props => props.$color};
  transition: transform 0.2s; &:hover { transform: scale(1.1); }
`;

const PaginationWrapper = styled.div`
  display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px;
  span { color: #666; font-size: 13px; }
`;

const PageBtn = styled.button`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
  &:disabled { opacity: 0.2; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #3ea6ff; }
`;

export default function AdminRequests({ requests = [], onHandleAction }) {
  const [activeSubView, setActiveSubView] = useState("PENDING");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // ✅ Advanced Filtering Logic
  const filteredResults = useMemo(() => {
    setCurrentPage(1); // Reset page on filter
    let result = (requests || []).filter(req => {
      if (!req || !req.status) return false;
      const s = req.status.toString().trim().toUpperCase();
      if (activeSubView === "APPROVED") return s === "APPROVED" || s === "APPROVE";
      if (activeSubView === "REJECTED") return s === "REJECTED" || s === "REJECT";
      return s === "PENDING";
    });

    if (query) {
      const lowQ = query.toLowerCase();
      result = result.filter(req => 
        req.user_id?.toString().includes(lowQ) ||
        req.user_name?.toLowerCase().includes(lowQ) ||
        req.type?.toLowerCase().includes(lowQ) ||
        req.amount?.toString().includes(lowQ)
      );
    }
    return result;
  }, [requests, activeSubView, query]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedData = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalAmount = filteredResults.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const exportToExcel = () => {
    if (filteredResults.length === 0) { toast.error("No data to export"); return; }
    const exportData = filteredResults.map((req, index) => ({
      "SL No": index + 1,
      "Date": new Date(req.date || req.created_at).toLocaleDateString(),
      "Name": req.user_name || "N/A",
      "User ID": req.user_id,
      "Type": req.type,
      "Amount": Number(req.amount),
      "Status": req.status
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Requests");
    XLSX.writeFile(wb, `${activeSubView}_Requests.xlsx`);
    toast.success("Excel exported!");
  };

  const confirmAction = (id, type, action) => {
    toast((t) => (
      <div style={{minWidth: '250px'}}>
        <span style={{fontWeight:'bold'}}>Confirm {action}?</span>
        <div style={{display:'flex', gap:10, marginTop:10}}>
          <button onClick={() => { toast.dismiss(t.id); onHandleAction(id, type, action); }} 
            style={{flex:1, border:'none', background: action === "APPROVE" ? '#2ecc71':'#e74c3c', color:'#fff', padding:8, borderRadius:6, cursor:'pointer'}}>Yes</button>
          <button onClick={() => toast.dismiss(t.id)} style={{flex:1, background:'transparent', border:'1px solid #555', color:'#ccc', padding:8, borderRadius:6, cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    ), { duration: 4000, style: { background: '#222', color: '#fff', border: '1px solid #333'} });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* 🔍 TOP ROW: SEARCH (LEFT) & TABS (RIGHT) */}
      <TopHeaderRow>
        <SearchBox>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or amount..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchBox>

        <SubNav>
          {["PENDING", "APPROVED", "REJECTED"].map(tab => (
            <NavItem key={tab} $active={activeSubView === tab} onClick={() => setActiveSubView(tab)}>
              {tab === "PENDING" && <Clock size={14}/>}
              {tab === "APPROVED" && <CheckCircle size={14}/>}
              {tab === "REJECTED" && <XCircle size={14}/>}
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </NavItem>
          ))}
        </SubNav>
      </TopHeaderRow>

      {/* 📊 SMALL STAT CARDS */}
      <StatsHeader>
        <StatCard>
          <span>{activeSubView} COUNT</span>
          <h4>{filteredResults.length}</h4>
        </StatCard>
        <StatCard>
          <span>{activeSubView} VOLUME</span>
          <h4>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
        </StatCard>
        <button onClick={exportToExcel} style={{marginLeft: 'auto', background:'rgba(46,204,113,0.1)', color:'#2ecc71', border:'1px solid rgba(46,204,113,0.2)', padding:'8px 15px', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:'13px', fontWeight:600}}>
          <FileSpreadsheet size={16}/> Export
        </button>
      </StatsHeader>

      <Section>
        <AnimatePresence mode="wait">
          {paginatedData.length === 0 ? (
            <motion.p key="empty" style={{color:'#666', textAlign: 'center', padding: '60px'}}>No records found matching your filters.</motion.p>
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <th># SL</th>
                    <th>Date & Time</th>
                    <th>Name</th>
                    <th>User Details</th>
                    <th>Type</th>
                    <th>Amount</th>
                    {activeSubView === "PENDING" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((req, index) => (
                    <tr key={`${req.type}-${req.id}`}>
                      <td style={{color: '#555'}}>{((currentPage - 1) * itemsPerPage) + index + 1}</td>
                      <td>
                        <div style={{color: '#fff'}}>{new Date(req.date || req.created_at).toLocaleDateString()}</div>
                        <div style={{fontSize: '11px', color: '#666'}}>{new Date(req.date || req.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td style={{fontWeight: '600', color: '#3ea6ff'}}>{req.user_name || "Unknown User"}</td>
                      <td>
                        <div style={{fontWeight: 'bold'}}>User #{req.user_id}</div>
                        <small style={{color:'#666'}}>Ref ID: {req.id}</small>
                      </td>
                      <td>
                        <Badge $bg={req.type === "DEPOSIT" ? "rgba(46,204,113,0.1)" : "rgba(231,76,60,0.1)"} 
                               $color={req.type === "DEPOSIT" ? "#2ecc71" : "#e74c3c"}>
                           <TrendingUp size={12}/> {req.type}
                        </Badge>
                      </td>
                      <td style={{fontWeight:'700', fontSize:'16px', color: '#fff'}}>${Number(req.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      {activeSubView === "PENDING" && (
                        <td>
                          <ActionBtn $bg="rgba(46,204,113,0.15)" $color="#2ecc71" onClick={() => confirmAction(req.id, req.type, "APPROVE")} title="Approve"><Check size={16}/></ActionBtn>
                          <ActionBtn $bg="rgba(231,76,60,0.15)" $color="#e74c3c" onClick={() => confirmAction(req.id, req.type, "REJECT")} title="Reject"><X size={16}/></ActionBtn>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* ✅ PAGINATION FOOTER */}
              {totalPages > 1 && (
                <PaginationWrapper>
                  <PageBtn disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                    <ChevronLeft size={18} />
                  </PageBtn>
                  <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>
                  <PageBtn disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                    <ChevronRight size={18} />
                  </PageBtn>
                </PaginationWrapper>
              )}
            </>
          )}
        </AnimatePresence>
      </Section>
    </motion.div>
  );
}