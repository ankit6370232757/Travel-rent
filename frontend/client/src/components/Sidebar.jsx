import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, Wallet, Users, LogOut, Box, X, CreditCard,
  History as HistoryIcon, Settings as SettingsIcon,
  BarChart2, FileText, UserCheck, Sliders, Package, ShieldCheck, Share2 ,
  Banknote, TrendingUp,PieChart, ChevronDown, ArrowDownLeft, ArrowUpRight
} from "lucide-react";

const Container = styled(motion.div)`
  width: 280px; height: 100vh; background: rgba(15, 15, 20, 0.95);
  backdrop-filter: blur(25px); border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex; flex-direction: column; padding: 24px; position: fixed;
  left: 0; top: 0; z-index: 100; box-shadow: 10px 0 40px rgba(0, 0, 0, 0.6);
  @media (max-width: 768px) { width: 100%; max-width: 300px; }
`;

const Header = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-left: 10px; flex-shrink: 0; `;
const Logo = styled.h1` color: #fff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; margin: 0; span { color: #3ea6ff; } `;
const CloseButton = styled.div` cursor: pointer; color: #888; display: none; @media (max-width: 768px) { display: block; } `;
const Menu = styled.div` display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; padding-right: 5px; &::-webkit-scrollbar { width: 4px; } `;
const SectionLabel = styled.div` font-size: 10px; font-weight: 700; color: #666; text-transform: uppercase; margin: 25px 0 10px 16px; letter-spacing: 1.2px; `;

const MenuItem = styled(motion.div)`
  display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 12px; cursor: pointer;
  font-weight: 500; font-size: 14px; transition: all 0.3s ease; position: relative;
  color: ${props => props.$active ? (props.$isAdmin ? "#ff6b6b" : "#fff") : "#9ca3af"};
  background: ${props => props.$active ? (props.$isAdmin ? "rgba(255, 107, 107, 0.1)" : "rgba(62, 166, 255, 0.1)") : "transparent"};
  border-left: 3px solid ${props => props.$active ? (props.$isAdmin ? "#ff6b6b" : "#3ea6ff") : "transparent"};
  &:hover { background: rgba(255, 255, 255, 0.03); color: #fff; }
`;

const SubMenuContainer = styled(motion.div)`
  display: flex; flex-direction: column; gap: 4px; padding-left: 20px; margin: 5px 0 10px 0;
`;

const SubMenuItem = styled.div`
  display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 10px;
  cursor: pointer; font-size: 13px; font-weight: 500; color: ${props => props.$active ? "#fff" : "#888"};
  background: ${props => props.$active ? "rgba(255, 255, 255, 0.05)" : "transparent"};
  &:hover { color: #fff; background: rgba(255, 255, 255, 0.02); }
`;

const NotificationBadge = styled.span` background: #ff4757; color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; position: absolute; right: 15px; top: 50%; transform: translateY(-50%); `;
const UserSection = styled.div` margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05); `;
const UserCard = styled.div` display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(255, 255, 255, 0.03); border-radius: 16px; `;
const UserAvatar = styled.div` width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #3ea6ff, #8e2de2); display: flex; align-items: center; justify-content: center; color: white; `;
const UserMeta = styled.div` display: flex; flex-direction: column; strong { font-size: 14px; color: #fff; } span { font-size: 11px; color: #666; } `;

export default function Sidebar({ activeTab, setActiveTab, onLogout, user, isOpen, onClose, pendingCount }) {
  const isAdmin = user && user.role === 'admin';
  const [requestOpen, setRequestOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);

  const handleNav = (id) => {
    setActiveTab(id);
    if (window.innerWidth <= 768) onClose();
  };

 return (
    <AnimatePresence>
      {(isOpen || window.innerWidth > 768) && (
        <Container
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <Header>
            <Logo>Travel<span>Rent</span></Logo>
            <CloseButton onClick={onClose}><X size={24} /></CloseButton>
          </Header>

          <Menu>
            {isAdmin ? (
              <>
                <SectionLabel style={{ color: '#ff6b6b' }}>Administration</SectionLabel>
                
                <MenuItem $isAdmin $active={activeTab === "admin-overview"} onClick={() => handleNav("admin-overview")}>
                  <BarChart2 size={18} /> Admin Dashboard
                </MenuItem>

                {/* 🟢 REQUESTS DROPDOWN MAIN */}
                <MenuItem 
                  $isAdmin 
                  $active={activeTab === "admin-deposits" || activeTab === "admin-withdrawals"} 
                  onClick={() => setRequestOpen(!requestOpen)}
                >
                  <FileText size={18} /> Requests
                  <div style={{ marginLeft: 'auto', display: 'flex', transform: requestOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                    <ChevronDown size={16} />
                  </div>
                  {!requestOpen && pendingCount > 0 && <NotificationBadge>{pendingCount}</NotificationBadge>}
                </MenuItem>

                {/* 🟢 SUB-MENU ITEMS */}
                <AnimatePresence>
                  {requestOpen && (
                    <SubMenuContainer 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <SubMenuItem $active={activeTab === "admin-deposits"} onClick={() => handleNav("admin-deposits")}>
                        <ArrowDownLeft size={14} /> Deposits
                      </SubMenuItem>
                      <SubMenuItem $active={activeTab === "admin-withdrawals"} onClick={() => handleNav("admin-withdrawals")}>
                        <ArrowUpRight size={14} /> Withdrawals
                      </SubMenuItem>
                    </SubMenuContainer>
                  )}
                </AnimatePresence>

                <MenuItem $isAdmin $active={activeTab === "admin-users"} onClick={() => handleNav("admin-users")}>
                  <UserCheck size={18} /> User Manager
                </MenuItem>
                
                <MenuItem $isAdmin $active={activeTab === "admin-settings"} onClick={() => handleNav("admin-settings")}>
                  <Sliders size={18} /> System Settings
                </MenuItem>



                <MenuItem 
                  $isAdmin 
                  $active={activeTab === "admin-packages" || activeTab === "admin-tracker"} 
                  onClick={() => setPlansOpen(!plansOpen)}
                >
                  <Package size={18} /> Manage Plans
                  <div style={{ marginLeft: 'auto', transform: plansOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s', display: 'flex' }}>
                    <ChevronDown size={16} />
                  </div>
                </MenuItem>

                <AnimatePresence>
                  {plansOpen && (
                    <SubMenuContainer 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <SubMenuItem $active={activeTab === "admin-packages"} onClick={() => handleNav("admin-packages")}>
                        <Sliders size={14} /> Configure Packages
                      </SubMenuItem>
                      <SubMenuItem $active={activeTab === "admin-tracker"} onClick={() => handleNav("admin-tracker")}>
                        <PieChart size={14} /> Package Tracker
                      </SubMenuItem>
                    </SubMenuContainer>
                  )}
                </AnimatePresence>



                <MenuItem $isAdmin $active={activeTab === "admin-finance"} onClick={() => handleNav("admin-finance")}>
                  <Banknote size={18} /> Finance Log
                </MenuItem>

                <MenuItem $isAdmin $active={activeTab === "admin-payment-settings"} onClick={() => handleNav("admin-payment-settings")}>
                  <CreditCard size={18} /> Payment Settings
                </MenuItem>

                <MenuItem $isAdmin $active={activeTab === "admin-withdraw-settings"} onClick={() => handleNav("admin-withdraw-settings")}>
                  <Banknote size={18} /> Withdraw Options
                </MenuItem>

                <MenuItem $isAdmin $active={activeTab === "admin-queries"} onClick={() => handleNav("admin-queries")}>
  <Users size={18} /> User Queries
</MenuItem>
              </>
            ) : (
              <>
                {/* 👤 USER SIDE SECTION */}
                <SectionLabel>Main Menu</SectionLabel>
                <MenuItem $active={activeTab === "dashboard"} onClick={() => handleNav("dashboard")}>
                  <Home size={18} /> Dashboard
                </MenuItem>
                <MenuItem $active={activeTab === "wallet"} onClick={() => handleNav("wallet")}>
                  <Wallet size={18} /> My Wallet
                </MenuItem>
                <MenuItem $active={activeTab === "withdraw"} onClick={() => handleNav("withdraw")}>
                  <CreditCard size={18} /> Withdraw
                </MenuItem>
                <MenuItem $active={activeTab === "packages"} onClick={() => handleNav("packages")}>
                  <Box size={18} /> Packages
                </MenuItem>
                <MenuItem $active={activeTab === "my-assets"} onClick={() => handleNav("my-assets")}>
  <ShieldCheck size={18} /> My Active Package
</MenuItem>
                <MenuItem $active={activeTab === "history"} onClick={() => handleNav("history")}>
                  <HistoryIcon size={18} /> History
                </MenuItem>
                <MenuItem $active={activeTab === "network"} onClick={() => handleNav("network")}>
                  <Users size={18} /> My Network
                </MenuItem>
                <MenuItem $active={activeTab === "invite"} onClick={() => handleNav("invite")}>
  <Share2 size={18} /> Invite & Earn
</MenuItem>
                <MenuItem $active={activeTab === "earning-history"} onClick={() => handleNav("earning-history")}>
                  <TrendingUp size={18} /> Earning History
                </MenuItem>
                <MenuItem $active={activeTab === "earnings"} onClick={() => handleNav("earnings")}>
                  <BarChart2 size={18} /> Growth Analytics
                </MenuItem>
                <MenuItem $active={activeTab === "settings"} onClick={() => handleNav("settings")}>
                  <SettingsIcon size={18} /> Settings
                </MenuItem>
              </>
            )}
          </Menu>

          <UserSection>
            <MenuItem onClick={onLogout} style={{ color: '#ff6b6b', marginBottom: '10px' }}>
              <LogOut size={20} /> Logout
            </MenuItem>
            <UserCard>
              <UserAvatar>{user?.name?.charAt(0).toUpperCase() || "U"}</UserAvatar>
              <UserMeta>
                <strong>{user?.name || "User"}</strong>
                <span>{user?.email}</span>
                {isAdmin && <span style={{color: '#ff6b6b', fontSize: '9px', fontWeight: 'bold', marginTop: '2px'}}>ADMIN ACCESS</span>}
              </UserMeta>
            </UserCard>
          </UserSection>
        </Container>
      )}
    </AnimatePresence>
  );
}