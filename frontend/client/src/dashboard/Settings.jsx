import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { User, Mail, Lock, Save, Shield } from "lucide-react";
import api from "../api/axios";

// ✨ Glassmorphism Card
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto; /* Center it */
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

const FormGroup = styled.div`
  margin-bottom: 25px;
  
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
    top: 50%;
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
    border-color: ${({ theme }) => theme.accent};
    background: rgba(0, 0, 0, 0.5);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.accent};
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;

  &:hover { opacity: 0.9; }
`;

export default function Settings() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current user data
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setForm({ name: user.name, email: user.email, password: "" });
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await api.put("/auth/update-profile", form);
      
      // Update local storage with new info
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

  return (
    <Card initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Header>
        <div style={{ background: 'rgba(62,166,255,0.2)', padding: '10px', borderRadius: '12px', color: '#3ea6ff' }}>
          <User size={28} />
        </div>
        <div>
          <h2>Profile Settings</h2>
          <p>Update your personal information and security.</p>
        </div>
      </Header>

      <FormGroup>
        <label>Full Name</label>
        <InputWrapper>
          <User size={18} />
          <Input 
            value={form.name} 
            onChange={(e) => setForm({...form, name: e.target.value})} 
          />
        </InputWrapper>
      </FormGroup>

      <FormGroup>
        <label>Email Address</label>
        <InputWrapper>
          <Mail size={18} />
          <Input 
            value={form.email} 
            onChange={(e) => setForm({...form, email: e.target.value})} 
          />
        </InputWrapper>
      </FormGroup>

      <div style={{ margin: "30px 0 20px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}></div>

      <Header style={{ border: 'none', marginBottom: '20px', padding: 0 }}>
        <Shield size={20} color="#f1c40f" />
        <h3 style={{ fontSize: '18px', margin: 0 }}>Security</h3>
      </Header>

      <FormGroup>
        <label>New Password (Optional)</label>
        <InputWrapper>
          <Lock size={18} />
          <Input 
            type="password" 
            placeholder="Leave empty to keep current password"
            value={form.password} 
            onChange={(e) => setForm({...form, password: e.target.value})} 
          />
        </InputWrapper>
      </FormGroup>

      <Button onClick={handleUpdate} whileTap={{ scale: 0.98 }} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
        {!loading && <Save size={18} />}
      </Button>
    </Card>
  );
}