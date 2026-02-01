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
  margin-bottom: 20px;
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
`;

const Th = styled.th`
  text-align: left;
  padding: 15px;
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.textSoft};
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.text};
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  margin-right: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  background-color: ${props => props.color === "green" ? "#2ecc71" : "#e74c3c"};
  color: white;

  &:hover {
    opacity: 0.8;
  }
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: ${props => props.type === "DEPOSIT" ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)"};
  color: ${props => props.type === "DEPOSIT" ? "#2ecc71" : "#e74c3c"};
  border: 1px solid ${props => props.type === "DEPOSIT" ? "#2ecc71" : "#e74c3c"};
`;

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // You must be logged in as a user who has access (currently all users can see this route 
      // unless you added specific 'admin' role checks in middleware)
      const res = await api.get("/admin/requests");
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load requests", err);
      setLoading(false);
    }
  };

  const handleAction = async (id, type, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this ${type}?`)) return;

    try {
      await api.post("/admin/handle", { id, type, action });
      alert("Success!");
      fetchRequests(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) return <Container>Loading Admin Panel...</Container>;

  return (
    <Container>
      <SectionTitle>Admin Dashboard (Approvals)</SectionTitle>

      {requests.length === 0 ? (
        <p style={{ color: "#888" }}>No pending requests found.</p>
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
                <Td><Badge type={req.type}>{req.type}</Badge></Td>
                <Td>${Number(req.amount).toFixed(2)}</Td>
                <Td>
                  <ActionButton 
                    color="green" 
                    onClick={() => handleAction(req.id, req.type, "APPROVE")}
                  >
                    Approve
                  </ActionButton>
                  <ActionButton 
                    color="red" 
                    onClick={() => handleAction(req.id, req.type, "REJECT")}
                  >
                    Reject
                  </ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}