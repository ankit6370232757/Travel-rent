import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";
import api from "../api/axios";

// ✨ Glassmorphism Card
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 500px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  
  h2 { margin: 0; font-size: 22px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 15px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255, 255, 255, 0.03); }
`;

const Td = styled.td`
  padding: 15px;
  font-size: 14px;
  vertical-align: middle;
`;

const TypeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: ${props => props.color};
  
  div {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: ${props => props.bg};
    display: flex; alignItems: center; justifyContent: center;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.bg};
  color: ${props => props.color};
  text-transform: uppercase;
`;

const Amount = styled.span`
  font-weight: 700;
  color: ${props => props.isPositive ? "#2ecc71" : "#fff"};
`;

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/transactions/my-history")
      .then(res => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getTypeStyle = (type) => {
    if (type === 'DEPOSIT') return { color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.2)', icon: <ArrowDownLeft size={16} />, label: 'Deposit' };
    if (type === 'WITHDRAWAL') return { color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.2)', icon: <ArrowUpRight size={16} />, label: 'Withdraw' };
    if (type === 'INVESTMENT') return { color: '#3ea6ff', bg: 'rgba(62, 166, 255, 0.2)', icon: <RefreshCw size={16} />, label: 'Invest' };
    return { color: '#f1c40f', bg: 'rgba(241, 196, 15, 0.2)', icon: <CheckCircle size={16} />, label: 'Income' };
  };

  const getStatusStyle = (status) => {
    if (status === 'APPROVED' || status === 'CREDITED' || status === 'CONFIRMED') return { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' };
    if (status === 'PENDING') return { bg: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' };
    return { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' };
  };

  return (
    <Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Header>
        <h2>Transaction History</h2>
        <Clock size={20} color="#888" />
      </Header>

      {loading ? (
        <p style={{textAlign: 'center', color: '#888', padding: '40px'}}>Loading history...</p>
      ) : transactions.length === 0 ? (
        <p style={{textAlign: 'center', color: '#888', padding: '40px'}}>No transactions found.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Type</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th style={{textAlign: 'right'}}>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => {
              const style = getTypeStyle(tx.type);
              const statusStyle = getStatusStyle(tx.status);
              const isPositive = tx.type === 'DEPOSIT' || tx.type.includes('INCOME') || tx.type === 'DAILY' || tx.type.includes('REFERRAL');

              return (
                <Tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <Td>
                    <TypeBadge color={style.color} bg={style.bg}>
                      <div>{style.icon}</div>
                      {tx.type.replace('_', ' ')}
                    </TypeBadge>
                  </Td>
                  <Td style={{ color: '#aaa', fontSize: '13px' }}>
                    {new Date(tx.date).toLocaleDateString()}
                    <br/>
                    <small>{new Date(tx.date).toLocaleTimeString()}</small>
                  </Td>
                  <Td>
                    <StatusBadge bg={statusStyle.bg} color={statusStyle.color}>
                      {tx.status}
                    </StatusBadge>
                  </Td>
                  <Td style={{ textAlign: 'right' }}>
                    <Amount isPositive={isPositive}>
                      {isPositive ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </Amount>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Card>
  );
}