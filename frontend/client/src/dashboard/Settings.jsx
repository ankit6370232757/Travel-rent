import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { User, Mail, Lock, Save, Shield, CreditCard, Share2, Copy, Check, Headphones, Send } from "lucide-react";
import api from "../api/axios";

// --- STYLED COMPONENTS ---

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 40px;
  max-width: 800px; /* Slightly wider for better spacing */
  margin: 0 auto 40px auto; 
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  div {
    h2 { margin: 0; font-size: 26px; color: #fff; font-weight: 700; }
    p { margin: 6px 0 0; color: #888; font-size: 14px; }
  }
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  color: #3ea6ff;
  margin: 35px 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(62, 166, 255, 0.2);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  label {
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
    color: #ccc;
    font-size: 13px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 16px;
    top: 50%; 
    transform: translateY(-50%);
    color: #666;
    transition: color 0.2s;
  }

  &:focus-within svg {
    color: #3ea6ff;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 50px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: white;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #3ea6ff;
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 0 4px rgba(62, 166, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.02);
  }
  
  &::placeholder { color: #555; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: white;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: #3ea6ff;
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 0 4px rgba(62, 166, 255, 0.1);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #3ea6ff 0%, #2d55ff 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  box-shadow: 0 4px 15px rgba(62, 166, 255, 0.3);
  transition: transform 0.1s;

  &:hover { transform: translateY(-2px); }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const CopyButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: #ccc;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;

  &:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }
`;

const ShareBox = styled.div`
  background: linear-gradient(135deg, rgba(62, 166, 255, 0.1) 0%, rgba(62, 166, 255, 0.05) 100%);
  border: 1px solid rgba(62, 166, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  margin-top: 30px;
  text-align: center;

  h4 { margin: 0; color: #fff; font-size: 16px; }
  p { margin: 8px 0 0; font-size: 13px; color: #bbb; line-height: 1.5; }
`;

const SupportBox = styled.div`
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const Grid = styled.div`
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 25px;
  
  @media (max-width: 768px) { grid-template-columns: 1fr; }
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
  const [tickets, setTickets] = useState([]);
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

      // --- Add this useEffect to fetch tickets ---
      api.get("/support/my-tickets").then(res => setTickets(res.data));
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
    <Card initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
      <Header>
        <div style={{ background: 'rgba(62,166,255,0.15)', padding: '12px', borderRadius: '14px', color: '#3ea6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={32} />
        </div>
        <div>
          <h2>Profile & Security</h2>
          <p>Manage your personal details, wallet, and account settings.</p>
        </div>
      </Header>

      {/* --- PERSONAL DETAILS --- */}
      <SectionTitle><User size={16}/> Personal Details</SectionTitle>
      <Grid>
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
      </Grid>

      {/* --- PAYMENT SETTINGS --- */}
      <SectionTitle><CreditCard size={16}/> Withdrawal Settings</SectionTitle>
      <FormGroup>
        <label>USDT (TRC20) Wallet Address</label>
        <InputWrapper>
          <CreditCard size={18} />
          <Input placeholder="Enter your wallet address" value={form.wallet_address} onChange={(e) => setForm({...form, wallet_address: e.target.value})} />
        </InputWrapper>
      </FormGroup>

      {/* --- REFERRAL & SHARE --- */}
      <SectionTitle><Share2 size={16}/> Referral & Sharing</SectionTitle>
      <Grid>
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
      </Grid>
      
      <ShareBox>
        <h4>🚀 Invite Friends & Earn!</h4>
        <p>Share your link above. When friends register using your link, you earn rewards.</p>
      </ShareBox>

      {/* --- SECURITY --- */}
      <SectionTitle><Lock size={16}/> Security</SectionTitle>
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

      {/* --- HELP & SUPPORT SECTION --- */}
      <SupportBox>
        <SectionTitle><Headphones size={16}/> Help & Support</SectionTitle>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '25px', lineHeight: 1.6 }}>
            Have an issue? Send us a message below or email us directly at <a href="mailto:support@travelrent.com" style={{color: '#3ea6ff', textDecoration: 'none', fontWeight: 600}}>support@travelrent.com</a>.
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
            style={{ marginTop: '15px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }}
        >
            {supportLoading ? "Sending..." : "Send Message"}
            {!supportLoading && <Send size={16} />}
        </Button>

    <div style={{ marginTop: '40px' }}>
    <SectionTitle><Mail size={16}/> My Support Tickets</SectionTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {tickets.length === 0 ? (
            <p style={{color: '#666', textAlign: 'center'}}>No tickets found.</p>
        ) : (
            tickets.map(ticket => (
                <div key={ticket.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ color: '#3ea6ff' }}>{ticket.subject}</strong>
                        <span style={{ fontSize: '12px', color: ticket.status === 'OPEN' ? '#f1c40f' : '#2ecc71' }}>{ticket.status}</span>
                    </div>
                    <p style={{ color: '#ccc', fontSize: '14px', margin: '5px 0' }}>Q: {ticket.message}</p>
                    
                    {ticket.admin_reply && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(62,166,255,0.1)', borderRadius: '10px', borderLeft: '3px solid #3ea6ff' }}>
                            <p style={{ color: '#fff', fontSize: '13px', margin: 0 }}><strong>Admin Reply:</strong> {ticket.admin_reply}</p>
                        </div>
                    )}
                </div>
            ))
        )}
    </div>
</div>

      </SupportBox>

    </Card>
  );
}