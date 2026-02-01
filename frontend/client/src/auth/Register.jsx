import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px);
`;

const Wrapper = styled(Container)`
  background-color: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.soft};
  padding: 40px;
  border-radius: 12px;
  height: auto;
  width: 100%;
  max-width: 380px;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h2`
  margin-bottom: 10px;
`;

const Input = styled.input`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 8px;
  padding: 12px;
  color: ${({ theme }) => theme.text};
  width: 100%;
  box-sizing: border-box;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.accent}; }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.success || "#2ba150"};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  &:hover { opacity: 0.9; }
`;

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: ""
  });
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await api.post("/auth/register", form);
      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <Container>
      <Wrapper>
        <Title>Create Account</Title>
        <Input placeholder="Full Name" onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
        <Input placeholder="Referral Code (Optional)" onChange={e => setForm({ ...form, referralCode: e.target.value })} />
        <Button onClick={submit}>Register</Button>
        <div style={{ fontSize: "14px", color: "#aaa" }}>
          Already have an account? <Link to="/login" style={{ color: "#3ea6ff", textDecoration: "none" }}>Login</Link>
        </div>
      </Wrapper>
    </Container>
  );
}