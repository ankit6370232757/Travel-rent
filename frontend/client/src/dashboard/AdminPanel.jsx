import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  User, 
  FileText, 
  Calendar, 
  AlertCircle 
} from "lucide-react";
import api from "../api/axios";

// ✨ Glassmorphism Container
const Container = styled(motion.div)`
  max-width: 100%;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const Section = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: ${({ theme }) => theme.text};
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
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
  transition: background 0.2s;

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255, 255, 255, 0.03); }
`;

const Td = styled.td`
  padding: 15px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  vertical-align: middle;
`;

const ActionButton = styled(motion.button)`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  background: ${props => props.color === "green" ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)"};
  color: ${props => props.color === "green" ? "#2ecc71" : "#e74c3c"};
  border: 1px solid ${props => props.color === "green" ? "rgba(46, 204, 113, 0.3)" : "rgba(231, 76, 60, 0.3)"};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.color === "green" ? "#2ecc71" : "#e74c3c"};
    color: white;
  }
`;

const Badge = styled.span`
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: ${props => props.bg};
  color: ${props => props.color};
  border: 1px solid ${props => props.border};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  span { font-weight: 600; font-size: 14px; }
  small { color: ${({ theme }) => theme.textSoft}; font-size: 12px; }
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, bookRes] = await Promise.all([
        api.get("/admin/requests"),
        api.get("/booking/all") 
      ]);
      setRequests(reqRes.data);
      setBookings(bookRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Admin fetch error", err);
      setLoading(false);
    }
  };

  const handleAction = async (id, type, action) => {
    if (!window.confirm(`Confirm ${action}?`)) return;
    try {
      await api.post("/admin/handle", { id, type, action });
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return (
    <Container style={{display: 'flex', justifyContent: 'center', paddingTop: '50px'}}>
       <p style={{color: '#888'}}>Loading Admin Console...</p>
    </Container>
  );

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <ShieldCheck size={32} color="#3ea6ff" />
        <Title>Admin Console</Title>
      </Header>

      {/* 🟢 SECTION 1: PENDING APPROVALS */}
      <Section>
        <SectionHeader>
          <Clock size={20} color="#f1c40f" />
          <h3>Pending Requests</h3>
        </SectionHeader>
        
        {requests.length === 0 ? (
          <EmptyState>
            <Check size={40} style={{ opacity: 0.2 }} />
            <p>All caught up! No pending requests.</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>User</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <Tr 
                    key={`${req.type}-${req.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Td>{new Date(req.created_at).toLocaleDateString()}</Td>
                    <Td><User size={14} style={{marginRight:5, verticalAlign:'middle'}}/> User #{req.user_id}</Td>
                    <Td>
                      <Badge 
                        bg={req.type === "DEPOSIT" ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)"}
                        color={req.type === "DEPOSIT" ? "#2ecc71" : "#e74c3c"}
                        border={req.type === "DEPOSIT" ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)"}
                      >
                        {req.type}
                      </Badge>
                    </Td>
                    <Td style={{fontWeight: '700', color: '#fff'}}>${Number(req.amount).toFixed(2)}</Td>
                    <Td>
                      <ActionButton 
                        color="green" 
                        onClick={() => handleAction(req.id, req.type, "APPROVE")}
                        title="Approve"
                      >
                        <Check size={16} />
                      </ActionButton>
                      <ActionButton 
                        color="red" 
                        onClick={() => handleAction(req.id, req.type, "REJECT")}
                        title="Reject"
                      >
                        <X size={16} />
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {/* 🔵 SECTION 2: RECENT BOOKINGS */}
      <Section>
        <SectionHeader>
          <FileText size={20} color="#3ea6ff" />
          <h3>Recent Seat Bookings</h3>
        </SectionHeader>
        
        {bookings.length === 0 ? (
          <EmptyState>
            <AlertCircle size={40} style={{ opacity: 0.2 }} />
            <p>No bookings found.</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>User Details</Th>
                  <Th>Package</Th>
                  <Th>Seat</Th>
                  <Th>Price</Th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <Tr 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Td>
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <Calendar size={14} color="#666"/>
                        <div>
                          <div>{new Date(b.booked_at).toLocaleDateString()}</div>
                          <small style={{color:'#666', fontSize:'11px'}}>{new Date(b.booked_at).toLocaleTimeString()}</small>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <UserInfo>
                        <span>{b.user_name}</span>
                        <small>{b.email}</small>
                      </UserInfo>
                    </Td>
                    <Td>
                      <Badge bg="rgba(62, 166, 255, 0.1)" color="#3ea6ff" border="rgba(62, 166, 255, 0.2)">
                        {b.package_name}
                      </Badge>
                    </Td>
                    <Td style={{fontFamily: 'monospace', fontSize:'15px'}}>#{b.seat_number}</Td>
                    <Td>${Number(b.ticket_price).toLocaleString()}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </Section>
    </Container>
  );
}