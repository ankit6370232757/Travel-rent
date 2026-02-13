import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, 
  CheckCircle, Filter, Wallet, TrendingUp, Download 
} from "lucide-react";
import api from "../api/axios";

// ✨ Glassmorphism Card
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 600px;
  display: flex; flex-direction: column;
`;

const Header = styled.div`
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  margin-bottom: 30px; gap: 20px;
  h2 { margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px; }
`;

// --- FILTER TABS ---
const FilterGroup = styled.div`
  display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
`;

const FilterBtn = styled.button`
  background: ${props => props.active ? '#3ea6ff' : 'rgba(255,255,255,0.05)'};
  color: ${props => props.active ? '#fff' : '#888'};
  border: 1px solid ${props => props.active ? '#3ea6ff' : 'rgba(255,255,255,0.1)'};
  padding: 8px 16px; border-radius: 20px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  white-space: nowrap; transition: all 0.2s;
  &:hover { background: ${props => props.active ? '#3ea6ff' : 'rgba(255,255,255,0.1)'}; }
`;

// --- TABLE STYLES ---
const TableWrapper = styled.div`
  width: 100%; overflow-x: auto;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
`;

const Table = styled.table`
  width: 100%; border-collapse: collapse; min-width: 800px; /* Forces scroll on mobile */
`;

const Th = styled.th`
  text-align: left; padding: 18px 20px;
  background: rgba(0,0,0,0.2);
  color: #888; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
`;

const Tr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255, 255, 255, 0.03); }
`;

const Td = styled.td`
  padding: 18px 20px; font-size: 14px; vertical-align: middle;
  color: #eee;
`;

const TypeBadge = styled.div`
  display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 13px;
  color: ${props => props.color};
  
  .icon-box {
    width: 36px; height: 36px; border-radius: 10px;
    background: ${props => props.bg};
    display: flex; align-items: center; justify-content: center;
  }
`;

const StatusBadge = styled.span`
  padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800;
  background: ${props => props.bg}; color: ${props => props.color};
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const Amount = styled.span`
  font-weight: 700; font-family: 'Inter', sans-serif;
  color: ${props => props.isPositive ? "#2ecc71" : "#e74c3c"};
`;

const BalanceText = styled.span`
  font-family: 'Inter', monospace; font-weight: 600; color: #ccc;
`;

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Fetch History AND Current Balance to calculate running totals
  const fetchData = async () => {
    try {
      const [histRes, walletRes] = await Promise.all([
        api.get("/transactions/my-history"),
        api.get("/wallet")
      ]);

      const rawData = histRes.data;
      const liveBalance = Number(walletRes.data.balance);
      setCurrentBalance(liveBalance);

      // 2. Calculate Running Balance (Reverse Engineering)
      // Assuming API returns Newest -> Oldest
      let runningBal = liveBalance;
      
      const processedData = rawData.map(tx => {
        const amt = Number(tx.amount);
        const isCredit = ['DEPOSIT', 'DAILY', 'REFERRAL', 'OTS_BONUS'].some(t => tx.type.includes(t));
        const isDebit = ['WITHDRAWAL', 'INVESTMENT'].includes(tx.type);

        // Snapshot balance for THIS row
        const snapshotBalance = runningBal;

        // Prepare balance for the NEXT row (older transaction)
        if (isCredit) {
           runningBal -= amt; // Since we are going back in time, we SUBTRACT the credit
        } else if (isDebit) {
           runningBal += amt; // We ADD back the debit to find previous balance
        }

        return { ...tx, balanceAfter: snapshotBalance, isCredit, isDebit };
      });

      setTransactions(processedData);
      setFilteredData(processedData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // 3. Filter Logic
  useEffect(() => {
    if (filter === "ALL") {
      setFilteredData(transactions);
    } else {
      setFilteredData(transactions.filter(tx => tx.type.includes(filter)));
    }
  }, [filter, transactions]);

  // Helpers for Styling
  const getTypeStyle = (type) => {
    if (type.includes('DEPOSIT')) return { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.15)', icon: <ArrowDownLeft size={18} />, label: 'Deposit' };
    if (type.includes('WITHDRAW')) return { color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.15)', icon: <ArrowUpRight size={18} />, label: 'Withdrawal' };
    if (type.includes('INVEST')) return { color: '#3ea6ff', bg: 'rgba(62, 166, 255, 0.15)', icon: <RefreshCw size={18} />, label: 'Investment' };
    if (type.includes('BONUS') || type.includes('DAILY')) return { color: '#f1c40f', bg: 'rgba(241, 196, 15, 0.15)', icon: <TrendingUp size={18} />, label: 'Earning' };
    return { color: '#fff', bg: '#333', icon: <CheckCircle size={18} />, label: type };
  };

  const getStatusStyle = (status) => {
    if (['APPROVED', 'CREDITED', 'CONFIRMED', 'SUCCESS'].includes(status)) return { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' };
    if (status === 'PENDING') return { bg: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' };
    return { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' };
  };

  return (
    <Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      {/* Header & Filters */}
      <Header>
        <h2><Clock size={24} color="#3ea6ff" /> Transaction History</h2>
        
        <FilterGroup>
          {["ALL", "DEPOSIT", "WITHDRAW", "BOOKING", "MINING"].map((f) => (
            <FilterBtn 
              key={f} 
              active={filter === f} 
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? "All Transactions" : f + "s"}
            </FilterBtn>
          ))}
        </FilterGroup>
      </Header>

      {/* Table */}
      {loading ? (
        <p style={{textAlign: 'center', color: '#666', marginTop: 50}}>Loading records...</p>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th style={{width: '60px'}}>S.No</Th>
                <Th>Transaction Type</Th>
                <Th>Date & Time</Th>
                <Th>Status</Th>
                <Th style={{textAlign: 'right'}}>Amount</Th>
                <Th style={{textAlign: 'right'}}>Total Balance</Th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((tx, i) => {
                const style = getTypeStyle(tx.type);
                const statusStyle = getStatusStyle(tx.status);
                
                return (
                  <Tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <Td style={{color: '#666', fontWeight:'bold'}}>#{i + 1}</Td>
                    
                    <Td>
                      <TypeBadge color={style.color} bg={style.bg}>
                        <div className="icon-box">{style.icon}</div>
                        <div>
                           <div style={{color:'#fff'}}>{style.label}</div>
                           <div style={{fontSize:11, opacity:0.6, fontWeight:400}}>{tx.transaction_id || "System"}</div>
                        </div>
                      </TypeBadge>
                    </Td>

                    <Td style={{ color: '#aaa', fontSize: '13px' }}>
                      <div style={{color:'#eee', fontWeight:500}}>{new Date(tx.date).toLocaleDateString()}</div>
                      <div style={{fontSize:11}}>{new Date(tx.date).toLocaleTimeString()}</div>
                    </Td>

                    <Td>
                      <StatusBadge bg={statusStyle.bg} color={statusStyle.color}>
                        {tx.status}
                      </StatusBadge>
                    </Td>

                    <Td style={{ textAlign: 'right' }}>
                      <Amount isPositive={tx.isCredit}>
                        {tx.isCredit ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                      </Amount>
                    </Td>

                    <Td style={{ textAlign: 'right' }}>
                       <BalanceText>
                         ${tx.balanceAfter.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                       </BalanceText>
                    </Td>
                  </Tr>
                );
              }) : (
                <tr>
                  <Td colSpan="6" style={{textAlign: 'center', padding: '50px', color: '#666'}}>
                    No transactions found for this filter.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </Card>
  );
}