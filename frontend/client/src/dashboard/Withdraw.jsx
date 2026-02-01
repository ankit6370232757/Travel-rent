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
  color: ${({ theme }) => theme.text};
  outline: none;
  
  &:focus { 
    border-color: ${({ theme }) => theme.accent}; 
  }
`;

const Button = styled.button`
  padding: 12px;
  background: ${({ theme, disabled }) => disabled ? theme.soft : theme.accent};
  color: ${({ disabled }) => disabled ? "#888" : "#000"};
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  transition: opacity 0.2s;

  &:hover {
    opacity: ${({ disabled }) => disabled ? 1 : 0.9};
  }
`;

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    if (!amount || amount < 300) return alert("Minimum withdrawal is $300");
    
    setIsLoading(true);
    try {
      await api.post("/wallet/withdraw", { amount });
      alert("Withdrawal request sent successfully! Waiting for approval.");
      setAmount("");
    } catch (err) {
      // Show exact error from backend (e.g., "Insufficient balance")
      const msg = err.response?.data?.message || "Withdrawal failed";
      alert(msg);
    } finally {
      setIsLoading(false);
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
        disabled={isLoading}
      />
      
      <Button onClick={submit} disabled={isLoading}>
        {isLoading ? "Processing..." : "Submit Request"}
      </Button>
    </Card>
  );
}