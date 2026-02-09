import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { 
  Search, Filter, ArrowUpRight, ArrowDownLeft, 
  RefreshCw, Gift, Download 
} from "lucide-react";

// --- STYLED COMPONENTS ---
const Container = styled(motion.div)`
  display: flex; flex-direction: column; gap: 20px;
`;

const Toolbar = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.03); padding: 15px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);

  .search-box {
    display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.2);
    padding: 10px 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
    input { background: transparent; border: none; color: #fff; outline: none; width: 250px; }
  }

  .actions { display: flex; gap: 10px; }
`;

const FilterBtn = styled.button`
  background: ${props => props.active ? "rgba(62, 166, 255, 0.2)" : "transparent"};
  color: ${props => props.active ? "#3ea6ff" : "#888"};
  border: 1px solid ${props => props.active ? "#3ea6ff" : "rgba(255,255,255,0.1)"};
  padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;
  transition: all 0.2s;
  &:hover { color: #fff; border-color: #fff; }
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px;
  th { text-align: left; padding: 15px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  td { background: rgba(255,255,255,0.02); padding: 15px; color: #ddd; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05); }
  td:first-child { border-radius: 12px 0 0 12px; border-left: 1px solid rgba(255,255,255,0.05); }
  td:last-child { border-radius: 0 12px 12px 0; border-right: 1px solid rgba(255,255,255,0.05); }
`;

const TxBadge = styled.div`
  display: flex; align-items: center; gap: 8px; width: fit-content;
  padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
  background: ${props => props.bg}; color: ${props => props.color};
`;

const Amount = styled.span`
  font-weight: 700; font-size: 15px;
  color: ${props => props.type === 'credit' ? '#2ecc71' : '#e74c3c'};
`;

export default function AdminFinance() {
  const [filter, setFilter] = useState("ALL");
  
  // MOCK DATA (Replace with API call)
  const transactions = [
    { id: "TXN_98234", user: "Amit Kumar", type: "DEPOSIT", amount: 5000, date: "Feb 10, 2024", status: "Success" },
    { id: "TXN_98235", user: "Sarah Jones", type: "WITHDRAW", amount: 200, date: "Feb 09, 2024", status: "Success" },
    { id: "TXN_98236", user: "Rahul Singh", type: "ROI_CREDIT", amount: 50, date: "Feb 09, 2024", status: "Success" },
    { id: "TXN_98237", user: "Amit Kumar", type: "REFERRAL", amount: 25, date: "Feb 08, 2024", status: "Success" },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'DEPOSIT': return <ArrowDownLeft size={14}/>;
      case 'WITHDRAW': return <ArrowUpRight size={14}/>;
      case 'ROI_CREDIT': return <RefreshCw size={14}/>;
      case 'REFERRAL': return <Gift size={14}/>;
      default: return <Search size={14}/>;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'DEPOSIT': return { bg: 'rgba(46, 204, 113, 0.1)', col: '#2ecc71' };
      case 'WITHDRAW': return { bg: 'rgba(231, 76, 60, 0.1)', col: '#e74c3c' };
      case 'ROI_CREDIT': return { bg: 'rgba(62, 166, 255, 0.1)', col: '#3ea6ff' };
      case 'REFERRAL': return { bg: 'rgba(155, 89, 182, 0.1)', col: '#9b59b6' };
      default: return { bg: '#333', col: '#fff' };
    }
  };

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{color:'#fff', margin:0}}>Global Transactions</h2>
        <button style={{background:'#3ea6ff', border:'none', padding:'10px 20px', borderRadius:8, color:'#fff', fontWeight:600, cursor:'pointer', display:'flex', gap:8}}>
          <Download size={16}/> Export CSV
        </button>
      </div>

      <Toolbar>
        <div className="search-box">
          <Search size={18} color="#666"/>
          <input placeholder="Search TXN ID or Username..." />
        </div>
        <div className="actions">
          {['ALL', 'DEPOSIT', 'WITHDRAW', 'ROI', 'REFERRAL'].map(f => (
            <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </FilterBtn>
          ))}
        </div>
      </Toolbar>

      <Table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => {
            const style = getColor(tx.type);
            return (
              <tr key={tx.id}>
                <td style={{fontFamily:'monospace', color:'#888'}}>{tx.id}</td>
                <td style={{fontWeight:600, color:'#fff'}}>{tx.user}</td>
                <td>
                  <TxBadge bg={style.bg} color={style.col}>
                    {getIcon(tx.type)} {tx.type}
                  </TxBadge>
                </td>
                <td>
                  <Amount type={tx.type === 'WITHDRAW' ? 'debit' : 'credit'}>
                    {tx.type === 'WITHDRAW' ? '-' : '+'}${tx.amount}
                  </Amount>
                </td>
                <td>{tx.date}</td>
                <td><span style={{color:'#2ecc71', fontWeight:600}}>● {tx.status}</span></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}