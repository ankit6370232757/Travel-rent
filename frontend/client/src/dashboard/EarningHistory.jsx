import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, Clock, CheckCircle, TrendingUp, Calendar, 
  ChevronLeft, ChevronRight, FileSpreadsheet, AlertCircle, Search, Layers
} from "lucide-react";
import api from "../api/axios";
import * as XLSX from "xlsx";

// --- STYLED COMPONENTS ---

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 600px;
  display: flex; flex-direction: column; overflow: hidden;
`;

const Header = styled.div`
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  margin-bottom: 30px; gap: 20px;
  h2 { margin: 0; font-size: 24px; color: #fff; font-weight: 700; display: flex; align-items: center; gap: 12px; }
`;

const FilterSection = styled.div`
  display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.02); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);
`;

const DatePickerGroup = styled.div`
  display: flex; flex-wrap: wrap; align-items: center; gap: 15px;
  label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
  input { 
    background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); 
    color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 13px; outline: none;
    &::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
  }
`;

const ExportBtn = styled.button`
  display: flex; align-items: center; gap: 8px; background: rgba(46, 204, 113, 0.1);
  color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); padding: 8px 16px; 
  border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer;
  &:hover { background: rgba(46, 204, 113, 0.2); transform: translateY(-2px); }
`;

const FilterWrapper = styled.div` display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; `;

const FilterBtn = styled.button`
  background: ${props => props.active ? 'linear-gradient(90deg, rgba(62, 166, 255, 0.2) 0%, rgba(62, 166, 255, 0.1) 100%)' : 'rgba(255,255,255,0.03)'};
  color: ${props => props.active ? '#3ea6ff' : '#888'}; border: 1px solid ${props => props.active ? 'rgba(62, 166, 255, 0.3)' : 'rgba(255,255,255,0.05)'};
  padding: 8px 18px; border-radius: 30px; font-size: 13px; font-weight: 600; cursor: pointer;
`;

const TableContainer = styled.div` width: 100%; overflow-x: auto; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(0, 0, 0, 0.2); `;
const Table = styled.table` width: 100%; border-collapse: collapse; min-width: 1100px; `;
const Th = styled.th` text-align: left; padding: 18px 24px; color: #888; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; `;
const Td = styled.td` padding: 20px 24px; font-size: 14px; color: #e0e0e0; vertical-align: middle; `;

const PaginationWrapper = styled.div`
  display: flex; align-items: center; justify-content: center;
  margin-top: 25px; padding: 20px; gap: 20px; border-top: 1px solid rgba(255,255,255,0.05);
  span { color: #888; font-size: 13px; font-weight: 600; }
`;

const PageBtn = styled.button`
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  color: #fff; width: 36px; height: 36px; border-radius: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:disabled { opacity: 0.3; cursor: not-allowed; }
  &:not(:disabled):hover { background: #3ea6ff; border-color: #3ea6ff; }
`;

const StatusBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
  color: ${props => props.$isMatured ? '#888' : '#3ea6ff'};
  background: ${props => props.$isMatured ? 'rgba(255, 255, 255, 0.05)' : 'rgba(62, 166, 255, 0.1)'};
  padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
`;

const BatchTag = styled.span`
  background: rgba(255, 255, 255, 0.05);
  color: #aaa;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
  border: 1px solid rgba(255,255,255,0.05);
`;

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [histRes, walletRes] = await Promise.all([api.get("/income/history"), api.get("/wallet")]);
      const liveBalance = Number(walletRes.data.balance);
      let runningBal = liveBalance;
      
      const processed = histRes.data.map((tx) => {
        const snapshot = runningBal;
        runningBal -= Number(tx.amount);

        // Calculate Contract Progress Day
        // Daily: 365, Monthly: 12, Yearly: 1
        const totalDuration = tx.income_type === 'DAILY' ? 365 : (tx.income_type === 'MONTHLY' ? 12 : 1);
        const currentDay = totalDuration - (tx.days_remaining || 0);

        return { 
            ...tx, 
            balanceAfter: snapshot,
            progressLabel: `Day ${currentDay} of ${totalDuration}`
        };
      });
      setTransactions(processed);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.created_at).setHours(0,0,0,0);
      const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
      const end = endDate ? new Date(endDate).setHours(0,0,0,0) : null;

      const matchesPlan = filter === "ALL" || tx.income_type === filter;
      const matchesStart = !start || txDate >= start;
      const matchesEnd = !end || txDate <= end;

      return matchesPlan && matchesStart && matchesEnd;
    });
  }, [filter, transactions, startDate, endDate]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const exportToExcel = () => {
    const data = filteredData.map(tx => ({
      Package: tx.package_name || "X1",
      Batch: `Batch #${tx.batch_no || "N/A"}`,
      Type: tx.income_type,
      Date: new Date(tx.created_at).toLocaleDateString(),
      Amount: `$${Number(tx.amount).toFixed(2)}`,
      Balance: `$${Number(tx.balanceAfter).toFixed(2)}`,
      Contract_Progress: tx.progressLabel
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Earnings");
    XLSX.writeFile(workbook, `Profit_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Header>
        <h2><Clock size={22} color="#3ea6ff" /> Earning History</h2>
        <ExportBtn onClick={exportToExcel}><FileSpreadsheet size={18} /> Export Excel</ExportBtn>
      </Header>

      <FilterSection>
        <DatePickerGroup>
          <div>
            <label>Start Date</label><br/>
            <input type="date" value={startDate} onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}} />
          </div>
          <div>
            <label>End Date</label><br/>
            <input type="date" value={endDate} onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}} />
          </div>
          <RefreshCw size={18} color="#555" style={{cursor:'pointer', marginTop:'15px'}} onClick={() => {setStartDate(""); setEndDate(""); setFilter("ALL");}} />
        </DatePickerGroup>

        <FilterWrapper>
          {["ALL", "DAILY", "MONTHLY", "YEARLY"].map((f) => (
            <FilterBtn key={f} active={filter === f} onClick={() => { setFilter(f); setCurrentPage(1); }}>
              {f === "ALL" ? "All Plans" : f}
            </FilterBtn>
          ))}
        </FilterWrapper>
      </FilterSection>

      {loading ? <div style={{textAlign:'center', padding:'60px'}}><RefreshCw size={24} className="spin" /></div> : (
        <>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Package & Plan</Th>
                  <Th>Batch No.</Th>
                  <Th>Payout Date</Th>
                  <Th>Contract Progress</Th>
                  <Th style={{textAlign:'right'}}>Amount</Th>
                  <Th style={{textAlign:'right'}}>Ledger Balance</Th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((tx, i) => (
                  <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                    <Td>
                      <strong>{tx.package_name || "X1"}</strong><br/>
                      <small style={{color:'#3ea6ff', fontWeight: 600}}>{tx.income_type}</small>
                    </Td>
                    <Td><BatchTag>#{tx.batch_no || "N/A"}</BatchTag></Td>
                    <Td>
                        {new Date(tx.created_at).toLocaleDateString()}<br/>
                        <small style={{color:'#555'}}>{new Date(tx.created_at).toLocaleTimeString()}</small>
                    </Td>
                    <Td>
                        <StatusBadge $isMatured={tx.days_remaining <= 0}>
                            <TrendingUp size={12}/>
                            {tx.days_remaining > 0 ? tx.progressLabel : "Matured"}
                        </StatusBadge>
                    </Td>
                    <Td style={{textAlign:'right', color:'#2ecc71', fontWeight:700}}>+${Number(tx.amount).toFixed(2)}</Td>
                    <Td style={{textAlign:'right', fontFamily:'monospace', color:'#888'}}>${Number(tx.balanceAfter).toFixed(2)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <PaginationWrapper>
              <PageBtn disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={20}/></PageBtn>
              <span>Page {currentPage} of {totalPages}</span>
              <PageBtn disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={20}/></PageBtn>
            </PaginationWrapper>
          )}
        </>
      )}
    </Card>
  );
}