import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { User, Mail, Lock, Save, Shield, CreditCard, Share2, Copy, Check, Headphones, Send } from "lucide-react";
import api from "../api/axios";

// ✨ Glassmorphism Card
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px;
  max-width: 700px;
  margin: 0 auto 40px auto; 
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;

  h2 { margin: 0; font-size: 24px; }
  p { margin: 5px 0 0; color: ${({ theme }) => theme.textSoft}; font-size: 14px; }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: ${({ theme }) => theme.accent || "#3ea6ff"};
  margin: 30px 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    font-size: 14px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 15px;
    top: 50%; /* Center vertically for single line inputs */
    transform: translateY(-50%);
    color: #666;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 14px 14px 45px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #3ea6ff;
    background: rgba(0, 0, 0, 0.5);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Special Textarea for messages
const TextArea = styled.textarea`
  width: 100%;
  padding: 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: #3ea6ff;
    background: rgba(0, 0, 0, 0.5);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: #3ea6ff;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;

  &:hover { opacity: 0.9; }
`;

const CopyButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s;

  &:hover { background: rgba(255, 255, 255, 0.2); }
`;

const ShareBox = styled.div`
  background: rgba(62, 166, 255, 0.1);
  border: 1px solid rgba(62, 166, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-top: 30px;
  text-align: center;

  p { margin: 10px 0 0; font-size: 13px; color: #ccc; }
`;

const SupportBox = styled.div`
  margin-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 30px;
`;

export default function Settings() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    wallet_address: "",
    referral_code: "" 
  });
  
  const [support, setSupport] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [copied, setCopied] = useState(""); 

  useEffect(() => {
    // 1. Load from LocalStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        setForm(prev => ({ 
            ...prev,
            name: storedUser.name || "", 
            email: storedUser.email || "", 
            wallet_address: storedUser.wallet_address || "",
            referral_code: storedUser.referral_code || "Loading..."
        }));
    }

    // 2. Fetch FRESH Data
    api.get("/auth/profile")
      .then(res => {
        const freshUser = res.data;
        setForm(prev => ({
            ...prev,
            name: freshUser.name,
            email: freshUser.email,
            wallet_address: freshUser.wallet_address || "",
            referral_code: freshUser.referral_code || "N/A"
        }));
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...freshUser }));
      })
      .catch(err => console.error("Failed to fetch profile:", err));

  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await api.put("/auth/update-profile", form);
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...currentUser, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("✅ Profile updated successfully!");
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSupportSubmit = async () => {
    if (!support.subject || !support.message) return alert("Please fill in both subject and message");
    
    setSupportLoading(true);
    try {
        await api.post("/support/create", support);
        alert("✅ Support ticket submitted! We will contact you soon.");
        setSupport({ subject: "", message: "" }); // Clear form
    } catch (err) {
        alert("Failed to send message.");
    } finally {
        setSupportLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const referralLink = `${window.location.origin}/register?ref=${form.referral_code}`;

  return (
    <Card initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Header>
        <div style={{ background: 'rgba(62,166,255,0.2)', padding: '10px', borderRadius: '12px', color: '#3ea6ff' }}>
          <User size={28} />
        </div>
        <div>
          <h2>Profile & Security</h2>
          <p>Manage your account details and referral settings.</p>
        </div>
      </Header>

      {/* --- PERSONAL DETAILS --- */}
      <SectionTitle><User size={18}/> Personal Details</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <FormGroup>
            <label>Full Name</label>
            <InputWrapper>
            <User size={18} />
            <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </InputWrapper>
        </FormGroup>

        <FormGroup>
            <label>Email Address</label>
            <InputWrapper>
            <Mail size={18} />
            <Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
            </InputWrapper>
        </FormGroup>
      </div>

      {/* --- PAYMENT SETTINGS --- */}
      <SectionTitle><CreditCard size={18}/> Withdrawal Settings</SectionTitle>
      <FormGroup>
        <label>USDT (TRC20) Wallet Address</label>
        <InputWrapper>
          <CreditCard size={18} />
          <Input placeholder="Enter your wallet address" value={form.wallet_address} onChange={(e) => setForm({...form, wallet_address: e.target.value})} />
        </InputWrapper>
      </FormGroup>

      {/* --- REFERRAL & SHARE --- */}
      <SectionTitle><Share2 size={18}/> Referral & Sharing</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
         <FormGroup>
            <label>My Referral Code</label>
            <InputWrapper>
            <Shield size={18} />
            <Input value={form.referral_code} disabled />
            <CopyButton onClick={() => copyToClipboard(form.referral_code, "code")}>
                {copied === "code" ? <Check size={16} color="#2ecc71"/> : <Copy size={16}/>}
            </CopyButton>
            </InputWrapper>
        </FormGroup>

        <FormGroup>
            <label>My Invite Link</label>
            <InputWrapper>
            <Share2 size={18} />
            <Input value={referralLink} disabled />
            <CopyButton onClick={() => copyToClipboard(referralLink, "link")}>
                {copied === "link" ? <Check size={16} color="#2ecc71"/> : <Copy size={16}/>}
            </CopyButton>
            </InputWrapper>
        </FormGroup>
      </div>
      <ShareBox>
        <h4 style={{margin:0}}>🚀 Invite Friends & Earn!</h4>
        <p>Share your link above. When friends register using your link, you earn rewards.</p>
      </ShareBox>

      {/* --- SECURITY --- */}
      <SectionTitle><Lock size={18}/> Security</SectionTitle>
      <FormGroup>
        <label>New Password (Optional)</label>
        <InputWrapper>
          <Lock size={18} />
          <Input type="password" placeholder="Leave empty to keep current password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
        </InputWrapper>
      </FormGroup>

      <Button onClick={handleUpdate} whileTap={{ scale: 0.98 }} disabled={loading}>
        {loading ? "Saving Changes..." : "Save Profile"}
        {!loading && <Save size={18} />}
      </Button>

      {/* --- HELP & SUPPORT SECTION (NEW) --- */}
      <SupportBox>
        <SectionTitle><Headphones size={18}/> Help & Support</SectionTitle>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
            Have an issue? Send us a message below or email us directly at <a href="mailto:support@travelrent.com" style={{color: '#3ea6ff'}}>support@travelrent.com</a>.
        </p>

        <FormGroup>
            <label>Subject</label>
            <Input 
                placeholder="What can we help you with?" 
                value={support.subject}
                onChange={(e) => setSupport({...support, subject: e.target.value})}
            />
        </FormGroup>

        <FormGroup>
            <label>Message</label>
            <TextArea 
                placeholder="Describe your issue..." 
                value={support.message}
                onChange={(e) => setSupport({...support, message: e.target.value})}
            />
        </FormGroup>

        <Button 
            onClick={handleSupportSubmit} 
            disabled={supportLoading}
            style={{ marginTop: '10px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
            {supportLoading ? "Sending..." : "Send Message"}
            {!supportLoading && <Send size={16} />}
        </Button>
      </SupportBox>

    </Card>
  );
}