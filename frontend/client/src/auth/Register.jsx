import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Tag, UserPlus } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast"; // 👈 Import Toast

// --- STYLED COMPONENTS (No Changes) ---

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #050505;
  z-index: 1000;
  overflow: hidden;
`;

const BackgroundGlow = styled.div`
  position: absolute;
  width: 60vw;
  height: 60vw;
  max-width: 800px;
  max-height: 800px;
  background: radial-gradient(circle, rgba(46, 204, 113, 0.08) 0%, rgba(0,0,0,0) 70%);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
`;

const GlassCard = styled(motion.div)`
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 50px 40px;
  border-radius: 24px;
  width: 90%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 1;
`;

// ... (Rest of components) ...
const Header = styled.div` text-align: center; margin-bottom: 10px; `;
const Logo = styled.h1` font-size: 32px; font-weight: 800; margin: 0 0 10px 0; color: #fff; letter-spacing: -1px; span { color: #2ecc71; } `;
const Subtitle = styled.p` color: #888; font-size: 15px; margin: 0; `;
const InputGroup = styled.div` position: relative; `;
const IconWrapper = styled.div` position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #666; display: flex; align-items: center; transition: color 0.2s; `;
const Input = styled.input` width: 100%; background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px 16px 16px 50px; color: #fff; font-size: 15px; outline: none; transition: all 0.2s; box-sizing: border-box; &::placeholder { color: #555; } &:focus { border-color: #2ecc71; background-color: rgba(0, 0, 0, 0.5); box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.1); } &:focus + ${IconWrapper} { color: #2ecc71; } `;
const Button = styled(motion.button)` background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: #fff; border: none; border-radius: 12px; padding: 16px; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3); transition: box-shadow 0.2s; &:hover { box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4); } &:disabled { opacity: 0.7; cursor: not-allowed; } `;
const Footer = styled.div` text-align: center; font-size: 14px; color: #666; margin-top: 10px; a { color: #2ecc71; text-decoration: none; font-weight: 600; margin-left: 5px; &:hover { text-decoration: underline; } } `;

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", referralCode: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    // ❌ OLD: alert("Please fill in all required fields");
    // ✅ NEW: Toast Error
    if(!form.name || !form.email || !form.password) return toast.error("Please fill in all required fields");
    
    setLoading(true);
    const loadingToast = toast.loading("Creating your account..."); // Show Loading Spinner

    try {
      await api.post("/auth/register", form);
      
      // ✅ NEW: Success Toast (Replaces Loading)
      toast.success("Registered successfully! Please login.", { id: loadingToast });
      
      navigate("/login");
    } catch (err) {
      // ✅ NEW: Error Toast (Replaces Loading)
      const errorMessage = err.response?.data?.message || "Registration failed";
      toast.error(errorMessage, { id: loadingToast });
      
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundGlow />
      <GlassCard
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Header>
          <Logo>Travel<span>Rent</span></Logo>
          <Subtitle>Create a new account to start investing.</Subtitle>
        </Header>
        <InputGroup>
          <Input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <IconWrapper><User size={18} /></IconWrapper>
        </InputGroup>
        <InputGroup>
          <Input placeholder="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <IconWrapper><Mail size={18} /></IconWrapper>
        </InputGroup>
        <InputGroup>
          <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <IconWrapper><Lock size={18} /></IconWrapper>
        </InputGroup>
        <InputGroup>
          <Input placeholder="Referral Code (Optional)" value={form.referralCode} onChange={e => setForm({ ...form, referralCode: e.target.value })} />
          <IconWrapper><Tag size={18} /></IconWrapper>
        </InputGroup>
        
        <Button onClick={submit} whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} disabled={loading}>
          {loading ? "Creating Account..." : "Register Now"}
          {!loading && <UserPlus size={20} />}
        </Button>
        
        <Footer>Already have an account? <Link to="/login">Login Here</Link></Footer>
      </GlassCard>
    </Container>
  );
}