import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Check, X, Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---

const Section = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 25px;
  overflow-x: auto;
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
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 700px;
  th { text-align: left; padding: 10px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;}
  td { padding: 15px 10px; color: #ddd; font-size: 14px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 12px 0 0 12px; }
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

  // ✅ IMPROVED FILTER: Handles both "APPROVE" and "APPROVED" status strings
  const filteredRequests = (requests || []).filter(req => {
    if (!req || !req.status) return false;
    const s = req.status.toString().trim().toUpperCase();

    // Mapping different database statuses to the frontend tabs
    if (activeSubView === "APPROVED") {
        return s === "APPROVED" || s === "APPROVE";
    }
    if (activeSubView === "REJECTED") {
        return s === "REJECTED" || s === "REJECT";
    }
    return s === "PENDING";
  });

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

      <Section>
        <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:10, color: '#fff'}}>
          {activeSubView === "PENDING" && <Clock size={20} color="#f1c40f"/>}
          {activeSubView === "APPROVED" && <CheckCircle size={20} color="#2ecc71"/>}
          {activeSubView === "REJECTED" && <XCircle size={20} color="#e74c3c"/>}
          {activeSubView} Requests
        </h3>
        
        <AnimatePresence mode="wait">
          {filteredRequests.length === 0 ? (
            <motion.p 
              key="empty"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{color:'#666', padding: '20px 0'}}
            >
              No {activeSubView.toLowerCase()} requests found.
            </motion.p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User Details</th>
                  <th>Type</th>
                  <th>Amount</th>
                  {activeSubView === "PENDING" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={`${req.type}-${req.id}`}>
                    <td>{new Date(req.date || req.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{fontWeight: 'bold'}}>User #{req.user_id}</div>
                      <small style={{color:'#666'}}>Ref: {req.id}</small>
                    </td>
                    <td>
                      <Badge $bg={req.type === "DEPOSIT" ? "rgba(46,204,113,0.1)" : "rgba(231,76,60,0.1)"} 
                             $color={req.type === "DEPOSIT" ? "#2ecc71" : "#e74c3c"}>
                         <TrendingUp size={12}/> {req.type}
                      </Badge>
                    </td>
                    <td style={{fontWeight:'bold', fontSize:'16px'}}>
                      ${Number(req.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    {activeSubView === "PENDING" && (
                      <td>
                        <ActionBtn $bg="rgba(46,204,113,0.15)" $color="#2ecc71" onClick={() => confirmAction(req.id, req.type, "APPROVE")}><Check size={16}/></ActionBtn>
                        <ActionBtn $bg="rgba(231,76,60,0.15)" $color="#e74c3c" onClick={() => confirmAction(req.id, req.type, "REJECT")}><X size={16}/></ActionBtn>
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