import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const Balance = styled.h1`
  font-size: 36px;
  color: ${({ theme }) => theme.accent};
  margin: 10px 0;
`;

const Label = styled.div`
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft};
  background: transparent;
  color: ${({ theme }) => theme.text};
  width: 100%;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.accent};
  color: black;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
`;

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0, locked_balance: 0 });
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet");
      setWallet(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return alert("Enter a valid amount");
    try {
      await api.post("/wallet/deposit", { amount });
      alert("Deposit request submitted! Waiting for Admin approval.");
      setAmount("");
    } catch (err) {
      alert(err.response?.data?.message || "Deposit failed");
    }
  };

  return (
    <Card>
      <div>
        <Label>My Wallet</Label>
        <Balance>${Number(wallet.balance).toFixed(2)}</Balance>
        
        <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: "14px" }}>
           <span>Locked Funds:</span>
           <span>${Number(wallet.locked_balance).toFixed(2)}</span>
        </div>
      </div>

      <div style={{ marginTop: "20px", borderTop: "1px solid #333", paddingTop: "15px" }}>
        <Label>Add Funds (Deposit)</Label>
        <InputGroup>
          <Input 
            type="number" 
            placeholder="Amount (e.g. 1000)" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={handleDeposit}>Request</Button>
        </InputGroup>
      </div>
    </Card>
  );
}