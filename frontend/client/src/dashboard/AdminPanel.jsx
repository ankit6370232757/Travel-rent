import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

// 👇 IMPORT MODULES
import AdminOverview from "./admin/AdminOverview";
import AdminRequests from "./admin/AdminRequests";
import AdminUsers from "./admin/AdminUsers";

// --- STYLED COMPONENTS ---
const Container = styled.div`
  max-width: 1200px; margin: 0 auto; padding-bottom: 50px;
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
`;
const Title = styled.h2`
  font-size: 28px; color: #fff; display: flex; align-items: center; gap: 10px; margin: 0;
`;
const TabContainer = styled.div`
  display: flex; gap: 5px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px;
`;
const Tab = styled.button`
  padding: 8px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer;
  background: ${props => props.active ? "#3ea6ff" : "transparent"};
  color: ${props => props.active ? "#fff" : "#888"};
  transition: all 0.2s;
  &:hover { color: #fff; }
`;

// ⚡ UPDATED: Accepts 'initialView' prop to sync with Sidebar
export default function AdminPanel({ initialView = "overview" }) {
  const [activeTab, setActiveTab] = useState(initialView);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]); 
  const [stats, setStats] = useState({ revenue: 0, users: 0, pending: 0 });

  // ⚡ SYNC EFFECT: Updates tab when Sidebar is clicked
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
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. HANDLE ACTIONS (Passed to Requests Module)
  const handleAction = async (id, type, action) => {
    const loadingToast = toast.loading(`Processing ${action}...`);
    try {
      await api.post("/admin/handle", { id, type, action });
      toast.success(`Request ${action}ED!`, { id: loadingToast });
      
      // Remove from local state immediately for speed
      setRequests(prev => prev.filter(req => req.id !== id));
      
      // Refresh background data
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed", { id: loadingToast });
    }
  };

  if (loading) return <div style={{padding:50, textAlign:'center', color:'#888'}}>Loading Admin Panel...</div>;

  return (
    <Container>
      <Header>
        <Title><ShieldCheck size={32} color="#3ea6ff"/> Admin Console</Title>
        <TabContainer>
          <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</Tab>
          <Tab active={activeTab === "requests"} onClick={() => setActiveTab("requests")}>Requests</Tab>
          <Tab active={activeTab === "users"} onClick={() => setActiveTab("users")}>Users</Tab>
        </TabContainer>
      </Header>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
           <AdminOverview key="overview" stats={stats} bookings={bookings} />
        )}
        {activeTab === "requests" && (
           <AdminRequests key="requests" requests={requests} onHandleAction={handleAction} />
        )}
        {activeTab === "users" && (
           <AdminUsers key="users" users={users} />
        )}
      </AnimatePresence>
    </Container>
  );
}