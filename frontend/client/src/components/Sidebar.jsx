import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Wallet, 
  Users, 
  TrendingUp, 
  LogOut, 
  Box, 
  X,
  CreditCard,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Shield 
} from "lucide-react";

// --- STYLED COMPONENTS ---
const Container = styled(motion.div)`
  width: 280px;
  height: 100vh;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  padding: 24px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    width: 100%; 
    max-width: 300px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Logo = styled.h1`
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;

  span {
    color: #3ea6ff;
  }
`;

const CloseButton = styled.div`
  cursor: pointer;
  color: #888;
  display: none;
  &:hover { color: #fff; }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const MenuItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  
  color: ${props => props.$isSpecial ? "#ff4d4d" : (props.$active ? "#fff" : "#888")};
  
  background: ${props => props.$active ? "linear-gradient(90deg, rgba(62, 166, 255, 0.15), rgba(62, 166, 255, 0.05))" : "transparent"};
  border: 1px solid ${props => props.$active ? "rgba(62, 166, 255, 0.2)" : "transparent"};
  
  ${props => props.$isSpecial && `
      border: 1px solid rgba(255, 77, 77, 0.2);
      background: rgba(255, 77, 77, 0.05);
  `}

  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 20px;
    width: 3px;
    background: ${props => props.$isSpecial ? "#ff4d4d" : "#3ea6ff"};
    border-radius: 0 4px 4px 0;
    opacity: ${props => props.$active ? 1 : 0};
    transition: opacity 0.3s;
  }

  &:hover {
    color: ${props => props.$isSpecial ? "#ff1a1a" : "#fff"};
    background: rgba(255, 255, 255, 0.03);
  }
`;

const UserSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
  margin-top: auto;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ea6ff, #8e2de2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 18px;
`;

const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  strong {
    font-size: 14px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span {
    font-size: 12px;
    color: #666;
  }
`;

export default function Sidebar({ activeTab, setActiveTab, onLogout, user, isOpen, onClose }) {
  
  let menuItems = [];

  // 🛡️ LOGIC CHANGE: Exclusively show items based on role
  if (user && user.role === 'admin') {
    // 1. ADMIN MENU
    menuItems = [
      { id: "admin", icon: <Shield size={20} />, label: "Admin Panel", isSpecial: true }
    ];
  } else {
    // 2. USER MENU
    menuItems = [
      { id: "dashboard", icon: <Home size={20} />, label: "Overview" },
      { id: "wallet", icon: <Wallet size={20} />, label: "My Wallet" },
      { id: "withdraw", icon: <CreditCard size={20} />, label: "Withdraw" },
      { id: "history", icon: <HistoryIcon size={20} />, label: "History" },
      { id: "packages", icon: <Box size={20} />, label: "Packages" },
      { id: "network", icon: <Users size={20} />, label: "My Network" },
      { id: "earnings", icon: <TrendingUp size={20} />, label: "Analytics" },
      { id: "settings", icon: <SettingsIcon size={20} />, label: "Settings" },
    ];
  }

  return (
    <AnimatePresence>
      {(isOpen || window.innerWidth > 768) && (
        <Container
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <Header>
            <Logo>Travel<span>Rent</span></Logo>
            <CloseButton onClick={onClose}><X size={24} /></CloseButton>
          </Header>

          <Menu>
            {menuItems.map((item, index) => (
              <MenuItem
                key={item.id}
                $active={activeTab === item.id}
                $isSpecial={item.isSpecial}
                onClick={() => {
                  setActiveTab(item.id); 
                  if (window.innerWidth <= 768) onClose();
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.icon}
                {item.label}
              </MenuItem>
            ))}
          </Menu>

          <UserSection>
            <MenuItem onClick={onLogout} style={{ marginBottom: 10, color: '#ff5c5c' }}>
              <LogOut size={20} />
              Logout
            </MenuItem>
            
            <UserCard>
              <UserAvatar>{user?.name?.charAt(0) || "U"}</UserAvatar>
              <UserMeta>
                <strong>{user?.name || "User"}</strong>
                <span>{user?.email}</span>
                {user?.role === 'admin' && <span style={{color: '#ff4d4d', fontSize: '10px', fontWeight: 'bold'}}>ADMIN ACCESS</span>}
              </UserMeta>
            </UserCard>
          </UserSection>
        </Container>
      )}
    </AnimatePresence>
  );
}