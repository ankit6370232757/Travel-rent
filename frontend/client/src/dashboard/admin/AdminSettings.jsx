import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Save, Power, CreditCard, Lock, Bell } from "lucide-react";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Container = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CardHeader = styled.div`
  display: flex; align-items: center; gap: 10px;
  h3 { margin: 0; font-size: 18px; color: #fff; }
  svg { color: #3ea6ff; }
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px;
  label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
  input, select, textarea {
    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
    padding: 12px; border-radius: 10px; color: #fff; outline: none;
    transition: border-color 0.2s;
    &:focus { border-color: #3ea6ff; }
  }
`;

const ToggleSwitch = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.02); padding: 15px; border-radius: 12px;
  border: 1px solid ${props => props.active ? "rgba(46, 204, 113, 0.3)" : "rgba(231, 76, 60, 0.3)"};
  
  span { font-weight: 600; color: ${props => props.active ? "#2ecc71" : "#e74c3c"}; }
  button {
    background: ${props => props.active ? "#2ecc71" : "#333"};
    width: 44px; height: 24px; border-radius: 12px; border: none; position: relative; cursor: pointer;
    transition: background 0.3s;
    &::after {
      content:''; position: absolute; top: 2px; left: ${props => props.active ? "22px" : "2px"};
      width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: left 0.3s;
    }
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #3ea6ff 0%, #2563eb 100%);
  color: white; border: none; padding: 12px; border-radius: 10px;
  font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 10px;
  &:hover { opacity: 0.9; }
`;

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    upiId: "pay.admin@okhdfcbank",
    minWithdraw: 300,
    withdrawStatus: true, // true = ON
    announcement: "Withdrawals are now instant! 🚀"
  });

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setSettings({ ...settings, withdrawStatus: !settings.withdrawStatus });
  };

  const saveSettings = () => {
    const load = toast.loading("Updating System...");
    setTimeout(() => {
      toast.success("Settings Saved!", { id: load });
      // Here you would normally doing api.post('/admin/settings', settings)
    }, 1000);
  };

  return (
    <Container initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      {/* 💳 PAYMENT SETTINGS */}
      <Card>
        <CardHeader><CreditCard size={20}/><h3>Payment Configuration</h3></CardHeader>
        <FormGroup>
          <label>Deposit UPI ID (User sends money here)</label>
          <input name="upiId" value={settings.upiId} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <label>Minimum Withdrawal Limit ($)</label>
          <input type="number" name="minWithdraw" value={settings.minWithdraw} onChange={handleChange} />
        </FormGroup>
      </Card>

      {/* 🔒 SYSTEM CONTROL */}
      <Card>
        <CardHeader><Lock size={20} color="#e74c3c"/><h3>System Controls</h3></CardHeader>
        <ToggleSwitch active={settings.withdrawStatus}>
          <div>
            <div style={{color:'#fff', fontWeight:600}}>Withdrawals</div>
            <div style={{fontSize:11, color:'#888'}}>{settings.withdrawStatus ? "Users can request withdrawals" : "Withdrawals are PAUSED"}</div>
          </div>
          <button onClick={handleToggle} />
        </ToggleSwitch>
        
        <FormGroup style={{marginTop: 15}}>
          <label>Maintenance Mode</label>
          <select style={{color: '#2ecc71'}}>
            <option>System Online (Normal)</option>
            <option>Maintenance (App Closed)</option>
          </select>
        </FormGroup>
      </Card>

      {/* 📢 ANNOUNCEMENTS */}
      <Card>
        <CardHeader><Bell size={20} color="#f1c40f"/><h3>Broadcast Message</h3></CardHeader>
        <FormGroup>
          <label>Dashboard Banner Text</label>
          <textarea rows="3" name="announcement" value={settings.announcement} onChange={handleChange} />
        </FormGroup>
        <SaveButton onClick={saveSettings}>
          <Save size={18} /> Save All Changes
        </SaveButton>
      </Card>

    </Container>
  );
}