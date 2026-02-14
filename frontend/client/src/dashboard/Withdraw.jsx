import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, AlertCircle, CheckCircle, ArrowRight, Plus, Upload, Wallet, ChevronLeft, X } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

// ✨ Glassmorphism Card
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px; 
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 650px;
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex; align-items: center; gap: 15px; margin-bottom: 30px; 
  color: ${({ theme }) => theme.text};
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const Title = styled.h3` margin: 0; font-size: 22px; font-weight: 700; `;

const InfoBox = styled.div`
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px; padding: 25px; margin-bottom: 30px;
  font-size: 15px; color: ${({ theme }) => theme.textSoft};
  display: flex; flex-direction: column; gap: 15px;

  div { display: flex; justify-content: space-between; }
  strong { color: #3ea6ff; font-size: 18px; }
`;

const InputWrapper = styled.div` position: relative; margin-bottom: 25px; `;

const Input = styled.input`
  width: 100%; padding: 18px 22px;
  padding-left: ${props => props.$hasIcon ? '50px' : '22px'};
  border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.4); color: white; outline: none;
  font-size: 16px; font-weight: 500; transition: all 0.2s;
  &:focus { border-color: #3ea6ff; background: rgba(0, 0, 0, 0.6); }
`;

const Select = styled.select`
  width: 100%; padding: 18px 22px;
  border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.4); color: white; outline: none;
  font-size: 16px; margin-bottom: 25px; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 1.5rem center; background-size: 1.2em;
  
  option { background: #121212; color: #fff; padding: 15px; }
  &:focus { border-color: #3ea6ff; }
`;

const UploadBox = styled.label`
  border: 1px dashed rgba(255,255,255,0.2); border-radius: 14px; padding: 25px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  cursor: pointer; color: #aaa; font-size: 14px; background: rgba(0,0,0,0.2);
  margin-bottom: 25px; transition: 0.2s; min-height: 140px;
  &:hover { border-color: #3ea6ff; color: #3ea6ff; }
  input { display: none; }
  img { width: 100%; max-height: 180px; object-fit: contain; border-radius: 10px; }
`;

const DollarSign = styled.span`
  position: absolute; left: 22px; top: 50%; transform: translateY(-50%);
  color: #888; font-weight: 600; font-size: 18px;
`;

const Button = styled(motion.button)`
  width: 100%; padding: 18px;
  background: ${({ theme, disabled }) => disabled ? theme.soft : "#3ea6ff"};
  color: #fff; border: none; border-radius: 14px; font-weight: 700; font-size: 16px;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: opacity 0.2s; margin-top: 10px;
  &:hover { opacity: ${({ disabled }) => disabled ? 1 : 0.9}; }
`;

const ToggleLink = styled.button`
  background: none; border: none; color: #3ea6ff; font-size: 14px;
  font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  width: 100%; justify-content: flex-end; margin-bottom: 25px;
  &:hover { text-decoration: underline; }
`;

const StatusMessage = styled(motion.div)`
  margin-top: 20px; padding: 15px; border-radius: 12px; font-size: 14px;
  display: flex; align-items: center; gap: 10px;
  background: ${props => props.error ? "rgba(255, 77, 77, 0.1)" : "rgba(46, 204, 113, 0.1)"};
  color: ${props => props.error ? "#ff4d4d" : "#2ecc71"};
  border: 1px solid ${props => props.error ? "rgba(255, 77, 77, 0.2)" : "rgba(46, 204, 113, 0.2)"};
`;

export default function Withdraw() {
  const [view, setView] = useState("withdraw"); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  
  const [balance, setBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [adminMethods, setAdminMethods] = useState([]); 
  
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [newAccount, setNewAccount] = useState({ methodName: "", address: "", qrCode: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Get Wallet Balance
      const balRes = await api.get("/wallet");
      setBalance(Number(balRes.data.balance));

      // 2. Get User's Saved Accounts
      const accRes = await api.get("/wallet/withdrawal-accounts");
      setAccounts(accRes.data);

      // 3. Get Allowed Withdrawal Methods (NEW USER ROUTE)
      // 👇 This now points to the User Route, not Admin
      const methodRes = await api.get("/wallet/withdrawal-methods-list"); 
      setAdminMethods(methodRes.data);

    } catch (err) { 
      console.error("Data fetch error", err);
      // Optional: Add toast error if needed
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setNewAccount({ ...newAccount, qrCode: reader.result });
    }
  };

  const saveAccount = async () => {
    if (!newAccount.methodName || !newAccount.address) {
      return setStatus({ type: "error", msg: "Please fill all fields" });
    }
    setLoading(true);
    try {
      await api.post("/wallet/withdrawal-accounts", newAccount);
      toast.success("Account Saved");
      setNewAccount({ methodName: "", address: "", qrCode: "" });
      await fetchData();
      setView("withdraw");
      setStatus({ type: "success", msg: "Account added successfully!" });
    } catch (err) {
      setStatus({ type: "error", msg: "Failed to save account" });
    } finally { setLoading(false); }
  };

  const submitWithdraw = async () => {
    setStatus(null);
    if (!amount || Number(amount) <= 0) return setStatus({ type: "error", msg: "Enter valid amount" });
    if (!selectedAccount) return setStatus({ type: "error", msg: "Select a withdrawal account" });
    if (Number(amount) > balance) return setStatus({ type: "error", msg: "Insufficient Balance" });

    setLoading(true);
    try {
      const acc = accounts.find(a => a.id === Number(selectedAccount));
      await api.post("/transactions/withdraw", { 
        amount, 
        account_details: `${acc.method_name} - ${acc.address}`,
        qr_code: acc.qr_code
      });
      setStatus({ type: "success", msg: "Withdrawal Request Sent!" });
      setAmount("");
      fetchData(); 
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Failed" });
    } finally { setLoading(false); }
  };

  return (
    <Card initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
      
      {/* HEADER */}
      <Header>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
          {view === 'withdraw' ? <CreditCard size={24} color="#fff" /> : <Plus size={24} color="#fff" />}
        </div>
        <Title>{view === 'withdraw' ? "Withdraw Funds" : "Add Withdrawal Method"}</Title>
      </Header>

      <AnimatePresence mode="wait">
        {view === "withdraw" ? (
          // --- VIEW 1: WITHDRAW REQUEST ---
          <motion.div key="withdraw" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            
            <InfoBox>
              <div><span>Available Balance</span><strong>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
              <div><span>Fee</span><span>3%</span></div>
              <div><span>Processing Time</span><span>24 Hours</span></div>
            </InfoBox>

            {/* Select User's Saved Account */}
            {accounts.length === 0 ? (
              <div style={{textAlign:'center', padding:'30px', background:'rgba(255,255,255,0.03)', borderRadius:12, marginBottom:20, border:'1px dashed #444'}}>
                <p style={{color:'#888', marginBottom:15}}>No saved accounts found.</p>
                <Button onClick={() => setView("add")} style={{width:'auto', padding:'12px 25px', fontSize:14}}>+ Add Withdrawal Method</Button>
              </div>
            ) : (
              <>
                <Select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
                  <option value="">-- Select Receiving Account --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.method_name}: {acc.address}</option>
                  ))}
                </Select>
                
                <ToggleLink onClick={() => setView("add")}>
                  <Plus size={14}/> Add New Account
                </ToggleLink>
              </>
            )}

            <InputWrapper>
              <DollarSign>$</DollarSign>
              <Input 
                type="number" $hasIcon
                placeholder="Enter Withdrawal Amount" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                disabled={loading || accounts.length === 0}
              />
            </InputWrapper>

            <Button onClick={submitWithdraw} disabled={loading || accounts.length === 0} whileTap={{ scale: 0.98 }}>
              {loading ? "Processing..." : "Withdraw Now"}
              {!loading && <ArrowRight size={20} />}
            </Button>
          </motion.div>

        ) : (
          // --- VIEW 2: ADD NEW ACCOUNT ---
          <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            
            <div style={{marginBottom: 20, color:'#aaa', fontSize:14}}>
               Select a method provided by Admin to save your details.
            </div>

            {/* 👇 THIS DROPDOWN NOW SHOWS WITHDRAW METHODS */}
            <Select value={newAccount.methodName} onChange={e => setNewAccount({...newAccount, methodName: e.target.value})}>
               <option value="">-- Select Payment Method --</option>
               {adminMethods.map(m => (
                 <option key={m.id} value={m.method_name}>{m.method_name}</option>
               ))}
            </Select>

            {adminMethods.length === 0 && (
               <p style={{color: '#f1c40f', fontSize:12, marginTop:-15, marginBottom:15}}>
                  No methods found. Contact admin to add withdrawal options.
               </p>
            )}

            <InputWrapper>
              <Input 
                placeholder="Wallet Address / Account Number / UPI ID" 
                value={newAccount.address}
                onChange={e => setNewAccount({...newAccount, address: e.target.value})}
              />
            </InputWrapper>

            <UploadBox>
              {newAccount.qrCode ? (
                <>
                  <img src={newAccount.qrCode} alt="QR" />
                  <span style={{color: '#ff4d4d', display:'flex', alignItems:'center', gap:5}} onClick={(e)=>{e.preventDefault(); setNewAccount({...newAccount, qrCode: ""})}}>
                    <X size={14}/> Remove Image
                  </span>
                </>
              ) : (
                <> <Upload size={24} /> <span>Upload Your QR Code (Optional)</span> </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </UploadBox>

            <Button onClick={saveAccount} disabled={loading}>
              {loading ? "Saving..." : "Save Withdrawal Method"}
            </Button>
            
            <div style={{marginTop: 20, textAlign: 'center'}}>
               <span 
                 style={{color: '#888', fontSize: 14, cursor: 'pointer', display:'inline-flex', alignItems:'center', gap:5}} 
                 onClick={() => setView("withdraw")}
               >
                 <ChevronLeft size={16}/> Cancel & Go Back
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATUS MESSAGE */}
      {status && (
        <StatusMessage error={status.type === 'error'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {status.msg}
        </StatusMessage>
      )}

    </Card>
  );
}