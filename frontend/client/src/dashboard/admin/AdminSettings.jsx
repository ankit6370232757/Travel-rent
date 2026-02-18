import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Save, Power, CreditCard, Lock, Bell, Percent, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios"; // Adjust path to your axios instance

// --- STYLED COMPONENTS ---
const Container = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 25px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  transition: transform 0.3s ease;
  &:hover { border-color: rgba(62, 166, 255, 0.3); }
`;

const CardHeader = styled.div`
  display: flex; align-items: center; gap: 12px;
  h3 { margin: 0; font-size: 16px; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
  svg { color: #3ea6ff; }
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px;
  label { font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; }
  input, select, textarea {
    background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05);
    padding: 14px; border-radius: 12px; color: #fff; outline: none; font-size: 14px;
    transition: all 0.2s;
    &:focus { border-color: #3ea6ff; background: rgba(0,0,0,0.6); }
  }
`;

const ControlRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.02); padding: 18px; border-radius: 16px;
  border: 1px solid ${props => props.active ? "rgba(46, 204, 113, 0.15)" : "rgba(231, 76, 60, 0.15)"};
  
  .label-group {
      span { display: block; font-weight: 600; color: #fff; font-size: 14px; }
      small { color: #666; font-size: 11px; }
  }
`;

const Switch = styled.button`
  background: ${props => props.active ? "#2ecc71" : "#333"};
  width: 48px; height: 26px; border-radius: 20px; border: none; position: relative; cursor: pointer;
  transition: all 0.3s;
  &::after {
    content:''; position: absolute; top: 3px; left: ${props => props.active ? "25px" : "3px"};
    width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'danger' ? 'rgba(231, 76, 60, 0.1)' : 'linear-gradient(135deg, #3ea6ff 0%, #2563eb 100%)'};
  color: ${props => props.variant === 'danger' ? '#e74c3c' : 'white'};
  border: ${props => props.variant === 'danger' ? '1px solid rgba(231, 76, 60, 0.2)' : 'none'};
  padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.3s;
  &:hover { transform: translateY(-2px); opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    upi_id: "",
    min_withdraw: 0,
    withdraw_status: true,
    deposit_status: true,
    withdraw_fee: 0,
    maintenance_mode: false,
    announcement_text: ""
  });

  // 🔄 1. Fetch Real Data from DB
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/admin/settings");
        if (res.data) setSettings(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to load system settings");
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  // 💾 2. Save Data to DB
  const saveSettings = async () => {
    const load = toast.loading("Syncing System Parameters...");
    try {
      await api.post("/admin/settings", settings);
      toast.success("System Settings Updated!", { id: load });
    } catch (err) {
      toast.error("Database update failed", { id: load });
    }
  };

  if (loading) return <div style={{padding: 50, textAlign: 'center', color: '#666'}}>Initializing System Config...</div>;

  return (
    <Container initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      {/* 💳 FINANCIAL PARAMETERS */}
      <Card>
        <div>
            <CardHeader><CreditCard size={18}/><h3>Financial Config</h3></CardHeader>
            <FormGroup style={{marginTop: 20}}>
                <label>Global Deposit UPI ID</label>
                <input name="upi_id" value={settings.upi_id} onChange={handleChange} placeholder="e.g. merchant@upi" />
            </FormGroup>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 15, marginTop: 15}}>
                <FormGroup>
                    <label>Min Withdraw ($)</label>
                    <input type="number" name="min_withdraw" value={settings.min_withdraw} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <label>Withdraw Fee (%)</label>
                    <div style={{position:'relative'}}>
                        <input type="number" name="withdraw_fee" value={settings.withdraw_fee} onChange={handleChange} style={{width:'100%'}} />
                        <Percent size={14} style={{position:'absolute', right:12, top:15, color:'#444'}}/>
                    </div>
                </FormGroup>
            </div>
        </div>
      </Card>

      {/* 🔒 STATUS CONTROLS */}
      <Card>
        <div>
            <CardHeader><Power size={18} color="#e74c3c"/><h3>Gateway Status</h3></CardHeader>
            <div style={{display:'flex', flexDirection:'column', gap: 12, marginTop: 20}}>
                <ControlRow active={settings.withdraw_status}>
                    <div className="label-group">
                        <span>Withdrawal Gateway</span>
                        <small>{settings.withdraw_status ? "Operational" : "Disabled by Admin"}</small>
                    </div>
                    <Switch active={settings.withdraw_status} onClick={() => handleToggle('withdraw_status')} />
                </ControlRow>

                <ControlRow active={settings.deposit_status}>
                    <div className="label-group">
                        <span>Deposit Gateway</span>
                        <small>{settings.deposit_status ? "Active" : "Under Review"}</small>
                    </div>
                    <Switch active={settings.deposit_status} onClick={() => handleToggle('deposit_status')} />
                </ControlRow>
            </div>
        </div>
      </Card>

      {/* 📢 BROADCAST & SECURITY */}
      <Card>
        <div>
            <CardHeader><Bell size={18} color="#f1c40f"/><h3>Broadcast Console</h3></CardHeader>
            <FormGroup style={{marginTop: 20}}>
                <label>Dashboard Alert Banner</label>
                <textarea rows="2" name="announcement_text" value={settings.announcement_text} onChange={handleChange} placeholder="Update users about server status or events..." />
            </FormGroup>
            
            <FormGroup style={{marginTop: 15}}>
                <label>System Integrity</label>
                <select name="maintenance_mode" value={settings.maintenance_mode} onChange={(e) => setSettings({...settings, maintenance_mode: e.target.value === 'true'})} 
                        style={{color: settings.maintenance_mode ? '#e74c3c' : '#2ecc71', fontWeight:'bold'}}>
                    <option value="false">🟢 LIVE: Production Mode</option>
                    <option value="true">🔴 MAINTENANCE: Restricted Access</option>
                </select>
            </FormGroup>
        </div>

        <ActionButton onClick={saveSettings}>
          <Save size={18} /> Push Global Updates
        </ActionButton>
      </Card>

    </Container>
  );
}