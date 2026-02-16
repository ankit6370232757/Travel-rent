import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

// 👇 IMPORT MODULES
import AdminOverview from "./admin/AdminOverview";
import AdminRequests from "./admin/AdminRequests";
import AdminUsers from "./admin/AdminUsers";
import AdminSettings from "./admin/AdminSettings";
import AdminPackages from "./admin/AdminPackages";
import AdminFinance from "./admin/AdminFinance";
import AdminPayments from "./admin/AdminPayments";
import AdminWithdrawSettings from "./admin/AdminWithdrawSettings";

// --- STYLED COMPONENTS ---
const Container = styled.div`
  max-width: 1200px; 
  margin: 0 auto; 
  padding-bottom: 50px;
`;

const Header = styled.div`
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  margin-bottom: 30px; 
  padding-bottom: 20px; 
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const Title = styled.h2`
  font-size: 28px; 
  color: #fff; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

export default function AdminPanel({ initialView = "overview" }) {
  const [activeTab, setActiveTab] = useState(initialView);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]); 
  const [stats, setStats] = useState({ revenue: 0, users: 0, pending: 0 });

  // ⚡ SYNC EFFECT: Matches the ID sent by Sidebar handleNav
  useEffect(() => {
    setActiveTab(initialView);
  }, [initialView]);

  // 1. FETCH DATA
  const fetchData = async () => {
    try {
      const [reqRes, bookRes, userRes] = await Promise.all([
        api.get("/admin/requests"),
        api.get("/booking/all"),
        api.get("/admin/users")
      ]);

      setRequests(reqRes.data || []);
      setBookings(bookRes.data || []);
      setUsers(userRes.data || []);

      const totalRev = (bookRes.data || []).reduce((acc, curr) => acc + Number(curr.ticket_price), 0);
      
      setStats({
        revenue: totalRev,
        users: userRes.data?.length || 0,
        pending: (reqRes.data || []).length
      });

      setLoading(false);
    } catch (err) {
      console.error("Admin fetch error", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. HANDLE ACTIONS
  const handleAction = async (id, type, action) => {
    const loadingToast = toast.loading(`Processing ${action}...`);
    try {
      await api.post("/admin/handle", { id, type, action });
      toast.success(`Request ${action}ED!`, { id: loadingToast });
      setRequests(prev => prev.filter(req => req.id !== id));
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed", { id: loadingToast });
    }
  };

  if (loading) return <div style={{padding:50, textAlign:'center', color:'#888'}}>Loading Admin Console...</div>;

  // Header Title Logic based on activeTab
  const getHeaderTitle = () => {
    switch(activeTab) {
      case "overview": return "Admin Dashboard";
      case "requests": return "System Requests";
      case "users": return "User Management";
      case "settings": return "System Settings";
      case "packages": return "Manage Investment Plans";
      case "finance": return "Finance Logs";
      case "payment-settings": return "Deposit Methods";
      case "withdraw-settings": return "Withdrawal Methods";
      default: return "Admin Console";
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <ShieldCheck size={32} color="#3ea6ff"/> 
          {getHeaderTitle()}
        </Title>
      </Header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <AdminOverview stats={stats} bookings={bookings} />}
          {activeTab === "requests" && <AdminRequests requests={requests} onHandleAction={handleAction} />}
          {activeTab === "users" && <AdminUsers users={users} />}
          {activeTab === "settings" && <AdminSettings />}
          {activeTab === "packages" && <AdminPackages />}
          {activeTab === "finance" && <AdminFinance />}
          {activeTab === "payment-settings" && <AdminPayments />}
          {activeTab === "withdraw-settings" && <AdminWithdrawSettings />}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}