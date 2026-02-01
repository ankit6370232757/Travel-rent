import React, { useContext } from "react";
import styled from "styled-components";
import { AuthContext } from "../context/AuthContext";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.card};
  border-bottom: 1px solid ${({ theme }) => theme.soft};
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.accent};
  margin: 0;
  letter-spacing: -1px;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const UserEmail = styled.span`
  color: ${({ theme }) => theme.textSoft};
  font-size: 0.9rem;
  font-weight: 500;
`;

const NavButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ variant, theme }) => (variant === "danger" ? theme.danger : theme.soft)};
  background: ${({ variant, theme }) => (variant === "danger" ? "transparent" : theme.soft)};
  color: ${({ variant, theme }) => (variant === "danger" ? theme.danger : theme.text)};

  &:hover {
    background: ${({ variant, theme }) => (variant === "danger" ? theme.danger : theme.accent)};
    color: #000;
    border-color: transparent;
  }
`;

export default function Navbar() {
  const { logout, user, dark, setDark } = useContext(AuthContext);

  return (
    <Nav>
      <Logo>TravelRent</Logo>
      <RightSide>
        <NavButton onClick={() => setDark(!dark)}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </NavButton>
        <UserEmail>{user?.email}</UserEmail>
        <NavButton variant="danger" onClick={logout}>
          Logout
        </NavButton>
      </RightSide>
    </Nav>
  );
}