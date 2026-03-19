import React, { useState, useContext } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight } from "lucide-react"; // Switched Mail to User icon for flexibility
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast"; 

// --- STYLED COMPONENTS (No Changes for UI Consistency) ---
const Container = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background-color: #050505; z-index: 1000; overflow: hidden;
`;

const BackgroundGlow = styled.div`
  position: absolute; width: 60vw; height: 60vw; max-width: 800px; max-height: 800px;
  background: radial-gradient(circle, rgba(62, 166, 255, 0.08) 0%, rgba(0,0,0,0) 70%);
  border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 0; pointer-events: none;
`;

const GlassCard = styled(motion.div)`
  background: rgba(30, 30, 30, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08); padding: 50px 40px; border-radius: 24px;
  width: 90%; max-width: 420px; display: flex; flex-direction: column; gap: 25px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6); position: relative; z-index: 1;
`;

const Header = styled.div` text-align: center; margin-bottom: 10px; `;
const Logo = styled.h1` font-size: 32px; font-weight: 800; margin: 0 0 10px 0; color: #fff; letter-spacing: -1px; span { color: #3ea6ff; } `;
const Subtitle = styled.p` color: #888; font-size: 15px; margin: 0; `;
const InputGroup = styled.div` position: relative; `;
const IconWrapper = styled.div` position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #666; display: flex; align-items: center; transition: color 0.2s; `;
const Input = styled.input` width: 100%; background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px 16px 16px 50px; color: #fff; font-size: 15px; outline: none; transition: all 0.2s; box-sizing: border-box; &::placeholder { color: #555; } &:focus { border-color: #3ea6ff; background-color: rgba(0, 0, 0, 0.5); box-shadow: 0 0 0 4px rgba(62, 166, 255, 0.1); } &:focus + ${IconWrapper} { color: #3ea6ff; } `;
const Button = styled(motion.button)` background: linear-gradient(135deg, #3ea6ff 0%, #2563eb 100%); color: #fff; border: none; border-radius: 12px; padding: 16px; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; box-shadow: 0 4px 15px rgba(62, 166, 255, 0.3); transition: box-shadow 0.2s; &:hover { box-shadow: 0 6px 20px rgba(62, 166, 255, 0.4); } `;
const Footer = styled.div` text-align: center; font-size: 14px; color: #666; margin-top: 10px; a { color: #3ea6ff; text-decoration: none; font-weight: 600; margin-left: 5px; &:hover { text-decoration: underline; } } `;

export default function Login() {
  const { login } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState(""); // 🟢 Supports Email or Phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

// Inside your handleSubmit function
const handleSubmit = async () => {
    // 1. Trim the values to remove accidental spaces
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    // 2. Basic Validation (Use the cleaned values)
    if(!cleanIdentifier || !cleanPassword) {
        return toast.error("Please enter your Email/Phone and Password");
    }
    
    setLoading(true);
    const loadingToast = toast.loading("Verifying credentials...");

    try {
      // 3. 🟢 Send cleaned data to backend
      const res = await api.post("/auth/login", { 
          identifier: cleanIdentifier, 
          password: cleanPassword 
      });
      
      login(res.data);
      toast.success("Login Successful!", { id: loadingToast });

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Invalid credentials provided";
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
          <Subtitle>Access your account via Email or Mobile Number</Subtitle>
        </Header>

        <InputGroup>
          <Input 
            placeholder="Email or Mobile Number" 
            type="text" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} 
          />
          <IconWrapper><User size={18} /></IconWrapper>
        </InputGroup>

        <InputGroup>
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} 
          />
          <IconWrapper><Lock size={18} /></IconWrapper>
        </InputGroup>
        
        <Button 
          onClick={handleSubmit} 
          whileTap={{ scale: 0.98 }} 
          whileHover={{ scale: 1.02 }} 
          disabled={loading} 
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Authorizing..." : "Login"}
          {!loading && <ArrowRight size={20} />}
        </Button>
        
        <Footer>Don't have an account? <Link to="/register">Register Now</Link></Footer>
      </GlassCard>
    </Container>
  );
}