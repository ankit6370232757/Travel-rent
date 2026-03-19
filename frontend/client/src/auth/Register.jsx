import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Tag, UserPlus, CheckCircle, X } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

// Phone Input
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// --- STYLED COMPONENTS ---
const Container = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background-color: #050505; z-index: 1000; overflow: hidden;
`;

const BackgroundGlow = styled.div`
  position: absolute; width: 60vw; height: 60vw; max-width: 800px; max-height: 800px;
  background: radial-gradient(circle, rgba(46, 204, 113, 0.08) 0%, rgba(0,0,0,0) 70%);
  border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 0; pointer-events: none;
`;

const GlassCard = styled(motion.div)`
  background: rgba(30, 30, 30, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08); padding: 40px; border-radius: 24px;
  width: 90%; max-width: 420px; display: flex; flex-direction: column; gap: 15px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6); position: relative; z-index: 1;
`;

const Header = styled.div` text-align: center; margin-bottom: 5px; `;
const Logo = styled.h1` font-size: 32px; font-weight: 800; margin: 0 0 5px 0; color: #fff; letter-spacing: -1px; span { color: #2ecc71; } `;
const Subtitle = styled.p` color: #888; font-size: 14px; margin: 0; `;

const InputGroup = styled.div` position: relative; width: 100%; `;
const IconWrapper = styled.div` 
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%); 
  color: #666; display: flex; align-items: center; pointer-events: none; z-index: 10;
`;

const Input = styled.input`
  width: 100%; background-color: rgba(0, 0, 0, 0.3); 
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; 
  padding: 14px 14px 14px 50px; color: #fff; font-size: 15px; outline: none; 
  transition: all 0.2s; box-sizing: border-box;
  &::placeholder { color: #555; }
  &:focus { border-color: #2ecc71; background-color: rgba(0, 0, 0, 0.5); }
`;

const PhoneWrapper = styled.div`
  width: 100%;
  .react-tel-input .form-control {
    width: 100% !important; height: 48px !important;
    background-color: rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important; color: #fff !important;
    padding-left: 58px !important;
  }
  .react-tel-input .flag-dropdown {
    background-color: transparent !important; border: none !important;
    border-right: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 12px 0 0 12px !important;
  }
  .react-tel-input .country-list { background-color: #1a1a1a !important; color: #fff !important; }
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: #fff; border: none; 
  border-radius: 12px; padding: 14px; font-weight: 700; font-size: 16px; cursor: pointer; 
  display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; 
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3); 
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const Footer = styled.div` 
  text-align: center; font-size: 14px; color: #666; margin-top: 10px; 
  a { color: #2ecc71; text-decoration: none; font-weight: 600; margin-left: 5px; } 
`;

const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
`;

const ModalContent = styled(motion.div)`
  background: #111; border: 1px solid #2ecc71; border-radius: 24px;
  padding: 40px; width: 90%; max-width: 400px; text-align: center;
`;

const IdDisplay = styled.div`
  background: rgba(46, 204, 113, 0.1); border: 2px dashed #2ecc71;
  padding: 15px; border-radius: 12px; margin: 20px 0;
  font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #fff;
`;

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", referralCode: "" });
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  const triggerBlossom = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#2ecc71", "#ffffff", "#27ae60"];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const submit = async () => {
    // 1. 🟢 CLEAN DATA: Trim everything and lowercase email
    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPassword = form.password.trim();
    const cleanPhone = phone.trim();
    const cleanReferral = form.referralCode.trim();

    // 2. Validation
    if (!cleanName || !cleanEmail || !cleanPassword || !cleanPhone) {
      return toast.error("Please fill in all required fields");
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating your account...");

    try {
      const payload = { 
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        phoneNumber: cleanPhone,
        referralCode: cleanReferral || null
      };

      const res = await api.post("/auth/register", payload);
      
      toast.success("Account Created Successfully!", { id: loadingToast });
      setSuccessData(res.data.userId);
      triggerBlossom();
    } catch (err) {
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
        transition={{ duration: 0.5 }}
      >
        <Header>
          <Logo>Travel<span>Rent</span></Logo>
          <Subtitle>Join the community and start earning.</Subtitle>
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
          <PhoneWrapper>
            <PhoneInput country={'in'} value={phone} onChange={val => setPhone(val)} enableSearch={true} placeholder="Mobile Number" />
          </PhoneWrapper>
        </InputGroup>

        <InputGroup>
          <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <IconWrapper><Lock size={18} /></IconWrapper>
        </InputGroup>

        <InputGroup>
          <Input placeholder="Referral Code (Optional)" value={form.referralCode} onChange={e => setForm({ ...form, referralCode: e.target.value })} />
          <IconWrapper><Tag size={18} /></IconWrapper>
        </InputGroup>
        
        <Button onClick={submit} whileTap={{ scale: 0.98 }} disabled={loading}>
          {loading ? "Processing..." : "Create Account"}
          {!loading && <UserPlus size={20} />}
        </Button>
        
        <Footer>Already joined? <Link to="/login">Login Here</Link></Footer>
      </GlassCard>

      <AnimatePresence>
        {successData && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <CheckCircle size={60} color="#2ecc71" style={{ marginBottom: 20 }} />
              <h2 style={{ color: '#fff', margin: '0 0 10px 0' }}>Welcome Aboard!</h2>
              <p style={{ color: '#888', fontSize: '14px' }}>Please save your unique 6-digit User ID for login and security purposes.</p>
              <IdDisplay>{successData}</IdDisplay>
              <Button onClick={() => navigate("/login")} style={{ width: '100%' }}>
                Continue to Login <X size={16} />
              </Button>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
}