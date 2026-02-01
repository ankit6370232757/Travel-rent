import React, { useState, useContext } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px);
`;

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.soft};
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h2`
  text-align: center;
  font-size: 24px;
  margin: 0;
  color: ${({ theme }) => theme.text};
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
  background-color: ${({ theme }) => theme.accent};
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.9; }
`;

const LinkText = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  margin: 0;
`;

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <Container>
      <Wrapper>
        <Title>Welcome Back</Title>
        <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleSubmit}>Login</Button>
        <LinkText>
          Don't have an account? <Link to="/register" style={{ color: "#3ea6ff", textDecoration: "none" }}>Register</Link>
        </LinkText>
      </Wrapper>
    </Container>
  );
}