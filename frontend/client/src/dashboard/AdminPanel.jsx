import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  margin: 30px 0 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.soft};
  padding-bottom: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.card};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
`;

const Th = styled.th`
  text-align: left;
  padding: 15px;
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.textSoft};
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
  background-color: ${props => props.color === "green" ? "#2ecc71" : "#e74c3c"};
  color: white;
  transition: opacity 0.2s;

  &:hover { opacity: 0.8; }
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  background: ${props => props.bg};
  color: ${props => props.color};
  border: 1px solid ${props => props.color};
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
      // Fetch both Pending Requests AND All Bookings
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
      alert("Success!");
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <Container style={{color: 'white'}}>Loading Admin Dashboard...</Container>;

  return (
    <Container>
      {/* 🟢 SECTION 1: PENDING APPROVALS */}
      <SectionTitle>⚠️ Pending Requests (Deposits & Withdrawals)</SectionTitle>
      {requests.length === 0 ? (
        <p style={{ color: "#666", marginBottom: '40px' }}>No pending requests.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>User ID</Th>
              <Th>Type</Th>
              <Th>Amount</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={`${req.type}-${req.id}`}>
                <Td>{new Date(req.created_at).toLocaleDateString()}</Td>
                <Td>User #{req.user_id}</Td>
                <Td>
                  <Badge 
                    bg={req.type === "DEPOSIT" ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)"}
                    color={req.type === "DEPOSIT" ? "#2ecc71" : "#e74c3c"}
                  >
                    {req.type}
                  </Badge>
                </Td>
                <Td style={{fontWeight: 'bold'}}>${Number(req.amount).toFixed(2)}</Td>
                <Td>
                  <ActionButton color="green" onClick={() => handleAction(req.id, req.type, "APPROVE")}>Approve</ActionButton>
                  <ActionButton color="red" onClick={() => handleAction(req.id, req.type, "REJECT")}>Reject</ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* 🔵 SECTION 2: RECENT BOOKINGS */}
      <SectionTitle>🎫 Recent Seat Bookings</SectionTitle>
      {bookings.length === 0 ? (
        <p style={{ color: "#666" }}>No bookings yet.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Date & Time</Th>
              <Th>User</Th>
              <Th>Package</Th>
              <Th>Seat #</Th>
              <Th>Price</Th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={i}>
                <Td>
                  {new Date(b.booked_at).toLocaleDateString()} <small style={{color:'#666'}}>{new Date(b.booked_at).toLocaleTimeString()}</small>
                </Td>
                <Td>
                  <div>{b.user_name}</div>
                  <small style={{color: '#666'}}>{b.email}</small>
                </Td>
                <Td><Badge bg="rgba(62, 166, 255, 0.1)" color="#3ea6ff">{b.package_name}</Badge></Td>
                <Td>#{b.seat_number}</Td>
                <Td>${Number(b.ticket_price).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}