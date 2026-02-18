import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Check, X, Clock, CheckCircle, 
  XCircle, Search, Calendar, FileSpreadsheet, Download 
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

const StatsHeader = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 15px 25px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  flex: 1;
  min-width: 200px;

  span { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  h4 { margin: 5px 0 0 0; font-size: 20px; color: #fff; font-family: 'Inter', sans-serif; }
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 2;
  min-width: 300px;
  
  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px 15px 12px 45px;
    color: #fff;
    font-size: 14px;
    outline: none;
    transition: all 0.3s;
    &:focus { border-color: #3ea6ff; background: rgba(255,255,255,0.08); }
  }

  svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #666; }
`;

const DateFilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1.5;
  min-width: 320px;

  .date-input-group {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 5px 10px;
    
    input {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 13px;
      outline: none;
      cursor: pointer;
      &::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
      }
    }
    span { color: #555; margin: 0 5px; }
  }
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.2);
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: #2ecc71;
    color: #fff;
  }
`;

const SubNav = styled.div`
  display: flex; gap: 12px; margin-bottom: 25px;
  background: rgba(255, 255, 255, 0.03); padding: 8px; border-radius: 16px; width: fit-content;
`;

const NavItem = styled.button`
  background: ${props => props.$active ? 'rgba(62, 166, 255, 0.1)' : 'transparent'};
  color: ${props => props.$active ? '#3ea6ff' : '#888'};
  border: 1px solid ${props => props.$active ? 'rgba(62, 166, 255, 0.2)' : 'transparent'};
  padding: 10px 20px; border-radius: 12px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.3s ease;
  &:hover { color: #fff; background: rgba(255,255,255,0.05); }
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 900px;
  th { text-align: left; padding: 10px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;}
  td { padding: 15px 10px; color: #ddd; font-size: 14px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 12px 0 0 12px; width: 60px; text-align: center; color: #555; font-weight: bold; }
  td:last-child { border-radius: 0 12px 12px 0; }
`;

const Badge = styled.span`
  padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; gap: 6px; width: fit-content;
  background: ${props => props.$bg}; color: ${props => props.$color};
`;

const ActionBtn = styled.button`
  width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; margin-right: 8px;
  background: ${props => props.$bg}; color: ${props => props.$color};
  transition: transform 0.2s; &:hover { transform: scale(1.1); }
`;

export default function AdminRequests({ requests = [], onHandleAction }) {
  const [activeSubView, setActiveSubView] = useState("PENDING");
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ ADVANCED FILTERING LOGIC
  const processedData = useMemo(() => {
    let result = (requests || []).filter(req => {
      if (!req || !req.status) return false;
      const s = req.status.toString().trim().toUpperCase();
      if (activeSubView === "APPROVED") return s === "APPROVED" || s === "APPROVE";
      if (activeSubView === "REJECTED") return s === "REJECTED" || s === "REJECT";
      return s === "PENDING";
    });

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(req => 
        req.user_id?.toString().includes(lowerQuery) ||
        req.user_name?.toLowerCase().includes(lowerQuery) || // Search by Name
        req.type?.toLowerCase().includes(lowerQuery) ||
        req.amount?.toString().includes(lowerQuery)
      );
    }

    if (startDate) {
      result = result.filter(req => new Date(req.date || req.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(req => new Date(req.date || req.created_at) <= end);
    }

    return result;
  }, [requests, activeSubView, query, startDate, endDate]);

  const totalAmount = processedData.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // ✅ EXCEL EXPORT FUNCTION
  const exportToExcel = () => {
    if (processedData.length === 0) {
        toast.error("No data to export");
        return;
    }

    const exportData = processedData.map((req, index) => ({
        "SL No": index + 1,
        "Date": new Date(req.date || req.created_at).toLocaleDateString(),
        "Time": new Date(req.date || req.created_at).toLocaleTimeString(),
        "User Name": req.user_name || "N/A",
        "User ID": req.user_id,
        "Ref ID": req.id,
        "Type": req.type,
        "Amount": Number(req.amount),
        "Status": req.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Requests");
    XLSX.writeFile(wb, `${activeSubView}_Requests_${new Date().toLocaleDateString()}.xlsx`);
    toast.success("Excel file downloaded!");
  };

  const confirmAction = (id, type, action) => {
    toast((t) => (
      <div style={{minWidth: '250px'}}>
        <span style={{fontWeight:'bold'}}>Confirm {action}?</span>
        <div style={{display:'flex', gap:10, marginTop:10}}>
          <button onClick={() => { toast.dismiss(t.id); onHandleAction(id, type, action); }} 
            style={{flex:1, border:'none', background: action === "APPROVE" ? '#2ecc71':'#e74c3c', color:'#fff', padding:8, borderRadius:6, cursor:'pointer'}}>
            Yes
          </button>
          <button onClick={() => toast.dismiss(t.id)} style={{flex:1, background:'transparent', border:'1px solid #555', color:'#ccc', padding:8, borderRadius:6, cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    ), { duration: 4000, style: { background: '#222', color: '#fff', border: '1px solid #333'} });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SubNav>
        <NavItem $active={activeSubView === "PENDING"} onClick={() => setActiveSubView("PENDING")}>
          <Clock size={16}/> Pending
        </NavItem>
        <NavItem $active={activeSubView === "APPROVED"} onClick={() => setActiveSubView("APPROVED")}>
          <CheckCircle size={16}/> Approved
        </NavItem>
        <NavItem $active={activeSubView === "REJECTED"} onClick={() => setActiveSubView("REJECTED")}>
          <XCircle size={16}/> Rejected
        </NavItem>
      </SubNav>

      <StatsHeader>
        <StatCard>
          <span>Total {activeSubView} Count</span>
          <h4>{processedData.length} Requests</h4>
        </StatCard>
        <StatCard>
          <span>Total {activeSubView} Volume</span>
          <h4>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
        </StatCard>
        <div style={{display: 'flex', alignItems: 'flex-end'}}>
             <ExportBtn onClick={exportToExcel}>
                <FileSpreadsheet size={18} /> Export Excel
             </ExportBtn>
        </div>
      </StatsHeader>

      <ControlsRow>
        <SearchBox>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by Name, User ID, Type..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchBox>

        <DateFilterWrapper>
            <Calendar size={18} color="#666" />
            <div className="date-input-group">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span>to</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  style={{background:'none', border:'none', color:'#3ea6ff', fontSize:'12px', cursor:'pointer'}}
                >
                  Clear
                </button>
            )}
        </DateFilterWrapper>
      </ControlsRow>

      <Section>
        <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:10, color: '#fff'}}>
          {activeSubView === "PENDING" && <Clock size={20} color="#f1c40f"/>}
          {activeSubView === "APPROVED" && <CheckCircle size={20} color="#2ecc71"/>}
          {activeSubView === "REJECTED" && <XCircle size={20} color="#e74c3c"/>}
          {activeSubView} List
        </h3>
        
        <AnimatePresence mode="wait">
          {processedData.length === 0 ? (
            <motion.p 
              key="empty"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{color:'#666', padding: '20px 0', textAlign: 'center'}}
            >
              No records found matching your criteria.
            </motion.p>
          ) : (
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
                {processedData.map((req, index) => (
                  <tr key={`${req.type}-${req.id}`}>
                    <td>{index + 1}</td>
                    <td>
                        <div style={{color: '#fff'}}>{new Date(req.date || req.created_at).toLocaleDateString()}</div>
                        <div style={{fontSize: '11px', color: '#666'}}>{new Date(req.date || req.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td style={{fontWeight: '600', color: '#3ea6ff'}}>
                        {req.user_name || "Unknown User"}
                    </td>
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
                    <td style={{fontWeight:'700', fontSize:'16px', color: '#fff'}}>
                      ${Number(req.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    {activeSubView === "PENDING" && (
                      <td>
                        <ActionBtn $bg="rgba(46,204,113,0.15)" $color="#2ecc71" onClick={() => confirmAction(req.id, req.type, "APPROVE")} title="Approve Request">
                          <Check size={16}/>
                        </ActionBtn>
                        <ActionBtn $bg="rgba(231,76,60,0.15)" $color="#e74c3c" onClick={() => confirmAction(req.id, req.type, "REJECT")} title="Reject Request">
                          <X size={16}/>
                        </ActionBtn>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </AnimatePresence>
      </Section>
    </motion.div>
  );
}