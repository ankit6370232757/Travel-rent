import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet as WalletIcon, Lock, Copy, CreditCard, CheckCircle, QrCode } from "lucide-react";
import api from "../api/axios";
import CountUp from "react-countup";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  height: 100%; 
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;

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
  display: flex; align-items: center; gap: 12px;
  color: #aaa;
  font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;
  margin-bottom: 20px;
`;

const BalanceWrapper = styled.div` margin-bottom: 25px; `;

const Balance = styled.h1`
  font-size: 3.5rem; font-weight: 800; margin: 0; letter-spacing: -1px;
  background: linear-gradient(90deg, #3ea6ff, #8e2de2);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  span { font-size: 1.8rem; color: #555; -webkit-text-fill-color: initial; margin-right: 5px; }
`;

const LockedFunds = styled.div`
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255, 193, 7, 0.1); color: #ffc107;
  padding: 8px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;
  margin-top: 15px; border: 1px solid rgba(255, 193, 7, 0.2);
`;

const Divider = styled.div`
  height: 1px; background: rgba(255, 255, 255, 0.1); margin: 20px 0;
`;

const Footer = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const Label = styled.div` font-size: 13px; color: #888; font-weight: 500; margin-bottom: 5px;`;

const Select = styled.select`
  width: 100%; padding: 14px; background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
  color: #fff; outline: none; font-size: 14px; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em;

  option { background: #121212; color: #fff; padding: 10px; }
  &:focus { border-color: #3ea6ff; background-color: rgba(0,0,0,0.6); }
`;

const DetailsBox = styled(motion.div)`
  background: rgba(62, 166, 255, 0.1); border: 1px dashed rgba(62, 166, 255, 0.3);
  padding: 20px; border-radius: 12px; text-align: center; cursor: pointer;
  transition: all 0.2s;
  
  &:hover { background: rgba(62, 166, 255, 0.15); border-color: #3ea6ff; }
  
  p { margin: 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  
  /* Address Text */
  h3 { 
    margin: 8px 0 0; color: #fff; font-family: monospace; font-size: 16px; 
    display: flex; align-items: center; justify-content: center; gap: 8px; word-break: break-all;
  }

  /* QR Code Image Style */
  .qr-image {
    width: 160px; height: 160px; object-fit: contain;
    background: white; padding: 10px; border-radius: 10px;
    margin: 15px auto 5px auto; display: block;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
`;

const InputGroup = styled.div` display: flex; gap: 12px; `;

const Input = styled.input`
  flex: 1; padding: 14px 16px; border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.4); color: white;
  outline: none; font-size: 15px; font-weight: 500; transition: all 0.2s;
  width: 100%;

  &:focus { border-color: #3ea6ff; background: rgba(0, 0, 0, 0.6); }
  &::placeholder { color: #555; }
`;

const Button = styled(motion.button)`
  padding: 14px 24px; background: #3ea6ff; color: white;
  border: none; border-radius: 12px; font-weight: 700; font-size: 14px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  white-space: nowrap; width: 100%;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0, locked_balance: 0 });
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState(""); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, methodsRes] = await Promise.all([
        api.get("/wallet"),
        api.get("/admin/payment-methods") 
      ]);
      setWallet(walletRes.data);
      setMethods(methodsRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Details Copied!");
  };

  const handlePayment = async () => {
    if (!amount || amount < 1) return toast.error("Enter a valid amount");
    if (!selectedMethod) return toast.error("Please select a payment method");

    setLoading(true);

    if (selectedMethod === "razorpay") {
      toast.error("Razorpay is currently disabled.");
      setLoading(false);
      return;
    }

    if (!txnId) {
      setLoading(false);
      return toast.error("Please enter the Transaction ID (UTR)");
    }

    try {
      await api.post("/wallet/deposit", { 
        amount, 
        method: selectedMethod, 
        transactionId: txnId 
      });
      toast.success("Request Submitted! Admin will verify shortly.");
      setAmount("");
      setTxnId("");
      setSelectedMethod("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const activeMethodDetails = methods.find(m => m.method_name === selectedMethod);
  const isRazorpay = selectedMethod === "razorpay";
  const isManual = selectedMethod && !isRazorpay;

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
            <CountUp start={0} end={Number(wallet.balance)} duration={2.5} separator="," decimals={2} />
          </Balance>
          
          {Number(wallet.locked_balance) > 0 && (
            <LockedFunds>
              <Lock size={14} /> Locked: ₹{Number(wallet.locked_balance).toFixed(2)}
            </LockedFunds>
          )}
        </BalanceWrapper>
      </div>

      <Footer>
        <Divider />
        <Label>Add Funds</Label>
        
        <Select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}>
          <option value="">-- Select Payment Method --</option>
          {methods.map(method => (
            <option key={method.id} value={method.method_name}>
              {method.method_name}
            </option>
          ))}
        </Select>

        <AnimatePresence>
          {isManual && activeMethodDetails && (
            <DetailsBox 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onClick={() => handleCopy(activeMethodDetails.details)}
            >
              <p>Scan to Pay or Copy Address</p>
              
              {activeMethodDetails.qr_code ? (
                <img 
                  src={activeMethodDetails.qr_code} 
                  alt="Scan QR" 
                  className="qr-image"
                />
              ) : (
                <div style={{margin:'10px 0', opacity:0.5}}><QrCode size={40}/></div>
              )}

              <h3>{activeMethodDetails.details} <Copy size={14}/></h3>
              <p style={{fontSize: 10, marginTop: 5, color:'#555'}}>Click address to copy</p>
            </DetailsBox>
          )}
        </AnimatePresence>

        <div style={{display:'flex', flexDirection: 'column', gap: 10}}>
          <InputGroup>
            <Input 
              type="number" 
              placeholder="Amount (e.g. 500)" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </InputGroup>

          {isManual && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Input 
                type="text" 
                placeholder="Enter Transaction ID / Nonce No." 
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
              />
            </motion.div>
          )}
        </div>

        <Button 
          onClick={handlePayment}
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          whileHover={{ opacity: 0.9 }}
        >
          {loading ? "Processing..." : (
            <>
              {isManual ? "Submit Request" : "Pay Now"} 
              {isManual ? <CheckCircle size={18}/> : <CreditCard size={18}/>}
            </>
          )}
        </Button>
      </Footer>
    </Card>
  );
}