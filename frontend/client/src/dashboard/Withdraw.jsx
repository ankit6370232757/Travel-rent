import React, { useState } from "react";
import styled from "styled-components";
import api from "../api/axios";

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 8px;
  color: white;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.accent}; }
`;

const Button = styled.button`
  padding: 12px;
  background: ${({ theme }) => theme.accent};
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;

export default function Withdraw() {
  const [amount, setAmount] = useState("");

  const submit = async () => {
    if (!amount || amount < 300) return alert("Minimum withdrawal is $300");
    try {
      await api.post("/wallet/withdraw", { amount });
      alert("Withdrawal request sent for approval.");
      setAmount("");
    } catch {
      alert("Insufficient balance.");
    }
  };

  return (
    <Card>
      <h3 style={{margin: 0}}>Withdraw Funds</h3>
      <p style={{fontSize: '12px', color: '#aaa'}}>Min: $300 | Fee: 3%</p>
      <Input 
        type="number" 
        placeholder="Enter amount" 
        value={amount}
        onChange={e => setAmount(e.target.value)} 
      />
      <Button onClick={submit}>Submit Request</Button>
    </Card>
  );
}