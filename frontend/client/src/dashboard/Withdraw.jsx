import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { CreditCard, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import api from "../api/axios";

// ✨ Glassmorphism Card
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.text};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
`;

const InfoBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 25px;
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  flex-direction: column;
  gap: 8px;

  div {
    display: flex;
    justify-content: space-between;
  }

  strong { color: ${({ theme }) => theme.accent}; }
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  padding-left: 45px; /* Space for icon */
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  outline: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;

  &:focus { 
    border-color: ${({ theme }) => theme.accent}; 
    background: rgba(0, 0, 0, 0.6);
  }
`;

const DollarSign = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-weight: 600;
  font-size: 16px;
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: ${({ theme, disabled }) => disabled ? theme.soft : theme.accent};
  color: ${({ disabled }) => disabled ? "#888" : "#000"};
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: opacity 0.2s;

  &:hover {
    opacity: ${({ disabled }) => disabled ? 1 : 0.9};
  }
`;

const StatusMessage = styled(motion.div)`
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.error ? "rgba(255, 77, 77, 0.1)" : "rgba(46, 204, 113, 0.1)"};
  color: ${props => props.error ? "#ff4d4d" : "#2ecc71"};
  border: 1px solid ${props => props.error ? "rgba(255, 77, 77, 0.2)" : "rgba(46, 204, 113, 0.2)"};
`;

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: '' }

  const submit = async () => {
    setStatus(null);
    if (!amount || Number(amount) < 300) {
      setStatus({ type: "error", msg: "Minimum withdrawal is $300" });
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post("/wallet/withdraw", { amount });
      setStatus({ type: "success", msg: "Request sent! Pending Admin approval." });
      setAmount("");
    } catch (err) {
      const msg = err.response?.data?.message || "Withdrawal failed";
      setStatus({ type: "error", msg: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <Header>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '10px' }}>
            <CreditCard size={20} color="#fff" />
          </div>
          <Title>Withdraw Funds</Title>
        </Header>

        <InfoBox>
          <div>
            <span>Minimum Amount</span>
            <strong>$300.00</strong>
          </div>
          <div>
            <span>Processing Fee</span>
            <span>3%</span>
          </div>
          <div>
            <span>Processing Time</span>
            <span>24 - 48 Hours</span>
          </div>
        </InfoBox>

        <InputWrapper>
          <DollarSign>$</DollarSign>
          <Input 
            type="number" 
            placeholder="300" 
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={isLoading}
          />
        </InputWrapper>

        <Button 
          onClick={submit} 
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? "Processing..." : "Submit Request"}
          {!isLoading && <ArrowRight size={18} />}
        </Button>

        {status && (
          <StatusMessage 
            error={status.type === 'error'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {status.msg}
          </StatusMessage>
        )}
      </div>
    </Card>
  );
}