import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { TrendingUp, Check, X, Clock } from "lucide-react";
import toast from "react-hot-toast";

const Section = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 25px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 700px;
  th { text-align: left; padding: 10px; color: #888; font-size: 12px; }
  td { padding: 15px 10px; color: #ddd; font-size: 14px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 10px 0 0 10px; }
  td:last-child { border-radius: 0 10px 10px 0; }
`;

const Badge = styled.span`
  padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; gap: 6px; width: fit-content;
  background: ${props => props.bg}; color: ${props => props.color};
`;

const ActionBtn = styled.button`
  width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; margin-right: 8px;
  background: ${props => props.bg}; color: ${props => props.color};
  transition: transform 0.2s;
  &:hover { transform: scale(1.1); }
`;

export default function AdminRequests({ requests, onHandleAction }) {
  
  // ⚡ Toast Confirmation Logic
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
      <Section>
        <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:10}}>
          <Clock size={20} color="#f1c40f"/> Pending Requests
        </h3>
        
        {requests.length === 0 ? <p style={{color:'#666'}}>No pending requests.</p> : (
          <Table>
            <thead>
              <tr><th>Date</th><th>User ID</th><th>Type</th><th>Amount</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{new Date(req.created_at).toLocaleDateString()}</td>
                  <td>User #{req.user_id} <br/><small style={{color:'#666'}}>ID: {req.id}</small></td>
                  <td>
                    <Badge bg={req.type === "DEPOSIT" ? "rgba(46,204,113,0.1)" : "rgba(231,76,60,0.1)"} 
                           color={req.type === "DEPOSIT" ? "#2ecc71" : "#e74c3c"}>
                       <TrendingUp size={12}/> {req.type}
                    </Badge>
                  </td>
                  <td style={{fontWeight:'bold', fontSize:'16px'}}>${Number(req.amount).toLocaleString()}</td>
                  <td>
                    <ActionBtn bg="rgba(46,204,113,0.15)" color="#2ecc71" onClick={() => confirmAction(req.id, req.type, "APPROVE")}><Check size={16}/></ActionBtn>
                    <ActionBtn bg="rgba(231,76,60,0.15)" color="#e74c3c" onClick={() => confirmAction(req.id, req.type, "REJECT")}><X size={16}/></ActionBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </motion.div>
  );
}