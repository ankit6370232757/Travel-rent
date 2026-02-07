import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, Lock } from "lucide-react";
import api from "../api/axios";
import CountUp from "react-countup"; // 👈 1. Import CountUp

// ✨ Glassmorphism Card Style (No Changes)
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 30px;
  height: 100%; 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

  /* Subtle inner glow */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(62, 166, 255, 0.05) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 20px;
`;

const BalanceWrapper = styled.div`
  margin-bottom: 25px;
`;

const Balance = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -1px;
  /* Premium Gradient Text */
  background: linear-gradient(90deg, #3ea6ff, #8e2de2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  span { 
    font-size: 1.8rem; 
    color: #555; 
    -webkit-text-fill-color: initial; 
    margin-right: 5px;
  }
`;

const LockedFunds = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 15px;
  border: 1px solid rgba(255, 193, 7, 0.2);
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 20px 0;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.div`
  font-size: 13px;
  color: #888;
  font-weight: 500;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &:focus { 
    border-color: #3ea6ff; 
    background: rgba(0, 0, 0, 0.6);
  }
  &::placeholder { color: #555; }
`;

const Button = styled(motion.button)`
  padding: 0 24px;
  background: ${({ theme }) => theme.accent};
  color: black;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0, locked_balance: 0 });
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      await api.post("/wallet/deposit", { amount });
      alert("✅ Deposit request submitted! Admin will approve shortly.");
      setAmount("");
    } catch (err) {
      alert(err.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      whileHover={{ y: -5, boxShadow: "0 15px 40px rgba(0,0,0,0.4)" }} 
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div>
        <Header>
          <WalletIcon size={18} color="#3ea6ff" /> My Wallet
        </Header>
        
        <BalanceWrapper>
          <Balance>
            <span>$</span>
            {/* 2. REPLACED STATIC NUMBER WITH ROLLING COUNTUP */}
            <CountUp 
              start={0} 
              end={Number(wallet.balance)} 
              duration={2.5} 
              separator="," 
              decimals={2}
            />
          </Balance>
          
          {Number(wallet.locked_balance) > 0 && (
            <LockedFunds>
              <Lock size={14} /> Locked: ${Number(wallet.locked_balance).toFixed(2)}
            </LockedFunds>
          )}
        </BalanceWrapper>
      </div>

      <Footer>
        <Divider />
        <Label>Add Funds (Deposit)</Label>
        <InputGroup>
          <Input 
            type="number" 
            placeholder="Amount (e.g. 500)" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button 
            onClick={handleDeposit}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            whileHover={{ opacity: 0.9 }}
          >
            {loading ? "..." : <>Add <ArrowUpRight size={18}/></>}
          </Button>
        </InputGroup>
      </Footer>
    </Card>
  );
}