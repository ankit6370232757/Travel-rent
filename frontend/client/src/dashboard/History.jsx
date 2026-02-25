import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, 
  CheckCircle, Filter, Wallet, TrendingUp, Download, AlertCircle,
  ChevronLeft, ChevronRight, Search, FileSpreadsheet 
} from "lucide-react";
import api from "../api/axios";
import * as XLSX from "xlsx"; // 🟢 Added for Excel Export

// --- STYLED COMPONENTS ---

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 600px;
  display: flex; 
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex; 
  flex-wrap: wrap; 
  align-items: center; 
  justify-content: space-between;
  margin-bottom: 30px; 
  gap: 20px;

  h2 { 
    margin: 0; 
    font-size: 24px; 
    color: #fff; 
    font-weight: 700;
    display: flex; 
    align-items: center; 
    gap: 12px; 
  }
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 8px 12px 8px 35px;
    color: #fff;
    font-size: 13px;
    outline: none;
    width: 200px;
    transition: all 0.3s ease;
    &:focus { width: 250px; border-color: #3ea6ff; }
  }

  svg {
    position: absolute;
    left: 10px;
    color: #666;
  }
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.2);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover { background: rgba(46, 204, 113, 0.2); transform: translateY(-2px); }
`;

const FilterWrapper = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 5px;
  scrollbar-width: none; 
  &::-webkit-scrollbar { display: none; }
`;

const FilterBtn = styled.button`
  background: ${props => props.active 
    ? 'linear-gradient(90deg, rgba(62, 166, 255, 0.2) 0%, rgba(62, 166, 255, 0.1) 100%)' 
    : 'rgba(255,255,255,0.03)'};
  
  color: ${props => props.active ? '#3ea6ff' : '#888'};
  border: 1px solid ${props => props.active ? 'rgba(62, 166, 255, 0.3)' : 'rgba(255,255,255,0.05)'};
  
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(62, 166, 255, 0.1);
    color: #fff;
    border-color: rgba(62, 166, 255, 0.2);
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
`;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Th = styled.th`
  text-align: left;
  padding: 18px 24px;
  color: #888;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const Tr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: background 0.2s;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255, 255, 255, 0.04); }
`;

const Td = styled.td`
  padding: 20px 24px;
  font-size: 14px;
  color: #e0e0e0;
  vertical-align: middle;
`;

const IconBox = styled.div`
  width: 38px; height: 38px;
  border-radius: 10px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
`;

const TypeInfo = styled.div`
  display: flex; align-items: center; gap: 12px;
  .text-group {
    display: flex; flex-direction: column;
    strong { color: #fff; font-weight: 500; font-size: 14px; }
    span { color: #666; font-size: 11px; margin-top: 2px; font-family: monospace; }
  }
`;

const StatusBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 20px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase;
  background: ${props => props.bg};
  color: ${props => props.color};
  border: 1px solid ${props => props.border};
`;

const Amount = styled.div`
  font-weight: 700; font-size: 15px; font-family: 'Inter', sans-serif;
  color: ${props => props.isPositive ? "#2ecc71" : "#ff4d4d"};
  text-shadow: ${props => props.isPositive ? "0 0 10px rgba(46, 204, 113, 0.2)" : "none"};
`;

const BalanceText = styled.span`
  font-family: 'Inter', monospace; 
  font-weight: 600; 
  color: #ccc;
  background: rgba(255,255,255,0.05);
  padding: 4px 8px;
  border-radius: 6px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 25px;
  padding-top: 10px;
`;

const PageBtn = styled.button`
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(:disabled) { background: #3ea6ff; border-color: #3ea6ff; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState(""); // 🟢 Search State
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [histRes, walletRes] = await Promise.all([
        api.get("/transactions/my-history"),
        api.get("/wallet")
      ]);

      const rawData = histRes.data;
      const liveBalance = Number(walletRes.data.balance);
      let runningBal = liveBalance;
      
      const processedData = rawData.map((tx) => {
        const amt = Number(tx.amount);
        const type = tx.type.toUpperCase();
        const isCredit = ['DEPOSIT', 'DAILY', 'REFERRAL', 'OTS_BONUS', 'EARNING', 'BONUS', 'CREDITED'].some(t => type.includes(t));
        const isDebit = ['WITHDRAWAL', 'INVESTMENT', 'PACKAGE_BUY'].some(t => type.includes(t));
        const snapshotBalance = runningBal;

        if (isCredit) runningBal -= amt;
        else if (isDebit) runningBal += amt;

        return { ...tx, balanceAfter: snapshotBalance, isCredit, isDebit };
      });

      setTransactions(processedData);
      setFilteredData(processedData);
      setLoading(false);
    } catch (err) {
      console.error("History fetch error:", err);
      setLoading(false);
    }
  };

  // 🟢 Combined Filter + Search Logic
  useEffect(() => {
    let result = transactions;

    // 1. Filter by Category
    if (filter !== "ALL") {
      if (filter === "EARNING") {
        result = result.filter(tx => tx.isCredit && !tx.type.includes('DEPOSIT'));
      } else {
        result = result.filter(tx => tx.type.toUpperCase().includes(filter));
      }
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        tx.type.toLowerCase().includes(term) || 
        tx.id?.toString().includes(term) || 
        tx.status?.toLowerCase().includes(term) ||
        tx.amount?.toString().includes(term)
      );
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [filter, searchTerm, transactions]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredData]);

  // 🟢 Excel Export logic
  const exportToExcel = () => {
    const dataToExport = filteredData.map((tx, index) => ({
      "No.": index + 1,
      "Transaction ID": tx.id || "System_Gen",
      "Type": tx.type,
      "Date": new Date(tx.date).toLocaleDateString(),
      "Time": new Date(tx.date).toLocaleTimeString(),
      "Status": tx.status || "SUCCESS",
      "Amount": `${tx.isCredit ? '+' : '-'}${tx.amount}`,
      "Balance": tx.balanceAfter.toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "History");
    XLSX.writeFile(workbook, `Transaction_History_${new Date().toLocaleDateString()}.xlsx`);
  };

  const getTypeStyle = (type) => {
    const t = type.toUpperCase();
    if (t.includes('DEPOSIT')) return { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.1)', icon: <ArrowDownLeft size={18} />, label: 'Deposit' };
    if (t.includes('WITHDRAW')) return { color: '#ff4d4d', bg: 'rgba(255, 77, 77, 0.1)', icon: <ArrowUpRight size={18} />, label: 'Withdrawal' };
    if (t.includes('INVEST')) return { color: '#3ea6ff', bg: 'rgba(62, 166, 255, 0.1)', icon: <RefreshCw size={18} />, label: 'Investment' };
    if (t.includes('BONUS') || t.includes('DAILY') || t.includes('EARNING')) return { color: '#f1c40f', bg: 'rgba(241, 196, 15, 0.1)', icon: <TrendingUp size={18} />, label: 'Earning' };
    return { color: '#fff', bg: '#333', icon: <CheckCircle size={18} />, label: type };
  };

  const getStatusStyle = (status) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    if (['APPROVED', 'CREDITED', 'CONFIRMED', 'SUCCESS'].includes(s)) return { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: 'rgba(46, 204, 113, 0.2)' };
    if (s === 'PENDING') return { bg: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f', border: 'rgba(241, 196, 15, 0.2)' };
    return { bg: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: 'rgba(255, 77, 77, 0.2)' };
  };

  return (
    <Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Header>
        <h2><Clock size={22} color="#3ea6ff" /> Transaction History</h2>
        <ActionGroup>
          <SearchWrapper>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchWrapper>
          <ExportBtn onClick={exportToExcel}>
            <FileSpreadsheet size={18} /> Export Excel
          </ExportBtn>
        </ActionGroup>
      </Header>

      <div style={{ marginBottom: '20px' }}>
        <FilterWrapper>
          {["ALL", "DEPOSIT", "WITHDRAWAL", "INVESTMENT", "EARNING"].map((f) => (
            <FilterBtn 
              key={f} 
              active={filter === (f === "WITHDRAWAL" ? "WITHDRAW" : f)} 
              onClick={() => setFilter(f === "WITHDRAWAL" ? "WITHDRAW" : f)}
            >
              {f === "ALL" ? "All Transactions" : f.charAt(0) + f.slice(1).toLowerCase()}
            </FilterBtn>
          ))}
        </FilterWrapper>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '60px', color: '#666'}}>
           <RefreshCw size={24} className="spin" style={{marginBottom:10}}/>
           <p>Syncing Ledger...</p>
        </div>
      ) : (
        <>
          <TableContainer>
            <Table>
              <Thead>
                <tr>
                  <Th style={{width: '60px'}}>#</Th>
                  <Th>Type & ID</Th>
                  <Th>Date & Time</Th>
                  <Th>Status</Th>
                  <Th style={{textAlign: 'right'}}>Amount</Th>
                  <Th style={{textAlign: 'right'}}>Balance</Th>
                </tr>
              </Thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map((tx, i) => {
                  const style = getTypeStyle(tx.type);
                  const statusStyle = getStatusStyle(tx.status);
                  const globalIndex = (currentPage - 1) * itemsPerPage + i + 1;
                  return (
                    <Tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <Td style={{color: '#555', fontWeight:'700'}}>{globalIndex}</Td>
                      <Td>
                        <TypeInfo>
                          <IconBox bg={style.bg} color={style.color}>{style.icon}</IconBox>
                          <div className="text-group">
                             <strong>{style.label}</strong>
                             <span>{tx.id ? `TRX-${tx.id}` : "System_Gen"}</span>
                          </div>
                        </TypeInfo>
                      </Td>
                      <Td>
                        <div style={{color:'#ddd', fontSize:13, fontWeight: 500}}>{new Date(tx.date).toLocaleDateString()}</div>
                        <div style={{fontSize:11, color:'#777'}}>{new Date(tx.date).toLocaleTimeString()}</div>
                      </Td>
                      <Td>
                        <StatusBadge bg={statusStyle.bg} color={statusStyle.color} border={statusStyle.border}>
                          {tx.status || 'SUCCESS'}
                        </StatusBadge>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <Amount isPositive={tx.isCredit}>{tx.isCredit ? '+' : '-'}${Number(tx.amount).toFixed(2)}</Amount>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <BalanceText>${tx.balanceAfter.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</BalanceText>
                      </Td>
                    </Tr>
                  );
                }) : (
                  <tr>
                    <Td colSpan="6" style={{textAlign: 'center', padding: '60px', color: '#666'}}>
                      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
                         <AlertCircle size={30} color="#444"/>
                         <span>No records found matching your criteria.</span>
                      </div>
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <PaginationContainer>
              <PageBtn onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={18} /></PageBtn>
              <span style={{ color: '#888', fontSize: '13px', fontWeight: '600' }}>Page {currentPage} of {totalPages}</span>
              <PageBtn onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={18} /></PageBtn>
            </PaginationContainer>
          )}
        </>
      )}
    </Card>
  );
}