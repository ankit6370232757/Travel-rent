import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  User, 
  FileText, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Layers,
  ChevronRight 
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast"; 

// --- STYLED COMPONENTS ---

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 50px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
`;

// ✨ Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.2s;
  
  /* Conditional styling for clickable cards */
  cursor: ${props => props.$clickable ? "pointer" : "default"};
  &:hover {
    background: ${props => props.$clickable ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.03)"};
    border-color: ${props => props.$clickable ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.08)"};
    transform: ${props => props.$clickable ? "translateY(-5px)" : "none"};
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  h4 { margin: 0; color: #888; font-size: 14px; font-weight: 500; }
  span { margin: 5px 0 0; color: #fff; font-size: 24px; font-weight: 700; }
`;

const Section = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  
  h3 {
    margin: 0;
    font-size: 20px;
    color: #fff;
    font-weight: 600;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px; /* Spacing between rows */
  min-width: 700px;
`;

const Th = styled.th`
  text-align: left;
  padding: 15px;
  color: #888;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const Tr = styled(motion.tr)`
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s;

  &:hover { 
    background: rgba(255, 255, 255, 0.05); 
    transform: translateY(-2px);
  }
`;

const Td = styled.td`
  padding: 16px 15px;
  color: #ddd;
  font-size: 14px;
  vertical-align: middle;
  
  &:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
  &:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
`;

const ActionButton = styled(motion.button)`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  background: ${props => props.color === "green" ? "rgba(46, 204, 113, 0.15)" : "rgba(231, 76, 60, 0.15)"};
  color: ${props => props.color === "green" ? "#2ecc71" : "#e74c3c"};
  border: 1px solid ${props => props.color === "green" ? "rgba(46, 204, 113, 0.3)" : "rgba(231, 76, 60, 0.3)"};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.color === "green" ? "#2ecc71" : "#e74c3c"};
    color: white;
    box-shadow: 0 4px 12px ${props => props.color === "green" ? "rgba(46, 204, 113, 0.4)" : "rgba(231, 76, 60, 0.4)"};
  }
`;

const Badge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.bg};
  color: ${props => props.color};
  border: 1px solid ${props => props.border};
  white-space: nowrap;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  span { font-weight: 600; font-size: 14px; color: #fff; }
  small { color: #888; font-size: 12px; margin-top: 2px; }
`;

const EmptyState = styled.div`
  padding: 50px;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background: rgba(0,0,0,0.2);
  border-radius: 16px;
`;

// --- MODAL COMPONENTS ---
const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;
const ModalContainer = styled(motion.div)`
  background: #121212; border: 1px solid rgba(255,255,255,0.1);
  width: 100%; max-width: 900px; max-height: 85vh; border-radius: 24px; 
  padding: 30px; display: flex; flex-direction: column;
  box-shadow: 0 25px 50px rgba(0,0,0,0.6);
`;
const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
  h3 { margin: 0; font-size: 22px; color: #fff; display: flex; align-items: center; gap: 10px; }
`;
const CloseButton = styled.button`
  background: rgba(255,255,255,0.1); border: none; color: #fff; 
  width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.2); }
`;

// --- HELPER FUNCTION ---
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
};

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [stats, setStats] = useState({ revenue: 0, users: 0, pending: 0 });

  useEffect(() => {
    fetchData();
  }, []);

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
      const totalUsersCount = userRes.data?.length || 0;
      
      setStats({
        revenue: totalRev,
        users: totalUsersCount,
        pending: (reqRes.data || []).length
      });

      setLoading(false);
    } catch (err) {
      console.error("Admin fetch error", err);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  // ⚡ UPDATED: Handles Action with Toast Confirmation UI
  const confirmAction = (id, type, action) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '250px' }}>
        <span style={{ fontWeight: '600', fontSize: '15px' }}>
           {action === "APPROVE" ? "✅ Approve Request?" : "❌ Reject Request?"}
        </span>
        <span style={{ fontSize: '13px', color: '#ccc' }}>
           Are you sure you want to proceed?
        </span>
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              handleAction(id, type, action);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: action === "APPROVE" ? '#2ecc71' : '#e74c3c',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              flex: 1
            }}
          >
            Yes, {action}
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: 'transparent',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: '13px',
              flex: 1
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000, style: { background: '#222', color: '#fff', border: '1px solid #333' } });
  };

  const handleAction = async (id, type, action) => {
    // Show Loading
    const loadingToast = toast.loading(`Processing ${action.toLowerCase()}...`);

    // Optimistic UI Update
    const previousRequests = [...requests];
    setRequests(prev => prev.filter(req => req.id !== id));

    try {
      await api.post("/admin/handle", { id, type, action });
      
      // ✅ Success
      toast.success(`Request ${action}ED successfully!`, { id: loadingToast });
      
      fetchData(); 
    } catch (err) {
      // ❌ Error (Revert UI)
      setRequests(previousRequests);
      const errorMessage = err.response?.data?.message || "Action failed";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  if (loading) return (
    <Container style={{display: 'flex', justifyContent: 'center', alignItems:'center', height:'80vh'}}>
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
         <ShieldCheck size={40} color="#3ea6ff" />
       </motion.div>
    </Container>
  );

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <ShieldCheck size={32} color="#3ea6ff" />
        <Title>Admin Console</Title>
      </Header>

      {/* 📊 STATS GRID */}
      <StatsGrid>
        {/* REVENUE CARD -> Opens Revenue Modal */}
        <StatCard 
          $clickable={true}
          onClick={() => setActiveModal('revenue')}
        >
          <StatIcon bg="rgba(62, 166, 255, 0.1)" color="#3ea6ff"><DollarSign /></StatIcon>
          <StatInfo>
            <h4>Total Revenue</h4>
            <span>${stats.revenue.toLocaleString()}</span>
          </StatInfo>
          <ChevronRight size={20} color="#555" style={{ marginLeft: 'auto' }} />
        </StatCard>

        {/* USERS CARD -> Opens Users Modal */}
        <StatCard 
          $clickable={true}
          onClick={() => setActiveModal('users')}
        >
          <StatIcon bg="rgba(142, 45, 226, 0.1)" color="#8e2de2"><Users /></StatIcon>
          <StatInfo>
            <h4>Total Users</h4>
            <span>{stats.users}</span>
          </StatInfo>
          <ChevronRight size={20} color="#555" style={{ marginLeft: 'auto' }} />
        </StatCard>

        {/* Pending Card (Stays the same) */}
        <StatCard>
          <StatIcon bg="rgba(241, 196, 15, 0.1)" color="#f1c40f"><AlertCircle /></StatIcon>
          <StatInfo>
            <h4>Pending Actions</h4>
            <span>{stats.pending}</span>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* 🟢 SECTION 1: PENDING APPROVALS */}
      <Section>
        <SectionHeader>
          <Clock size={22} color="#f1c40f" />
          <h3>Pending Requests</h3>
        </SectionHeader>
        
        {requests.length === 0 ? (
          <EmptyState>
            <Check size={40} style={{ opacity: 0.3, color: '#2ecc71' }} />
            <p>All caught up! No pending requests.</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>User</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <Tr 
                    key={`${req.type}-${req.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Td>{formatDate(req.created_at)}</Td>
                    <Td>
                      <UserInfo>
                        <span>User #{req.user_id}</span>
                        <small>ID: {req.id}</small>
                      </UserInfo>
                    </Td>
                    <Td>
                      <Badge 
                        bg={req.type === "DEPOSIT" ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)"}
                        color={req.type === "DEPOSIT" ? "#2ecc71" : "#e74c3c"}
                        border={req.type === "DEPOSIT" ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)"}
                      >
                        {req.type === "DEPOSIT" ? <TrendingUp size={12}/> : <TrendingUp size={12} style={{transform:'scaleY(-1)'}}/>}
                        {req.type}
                      </Badge>
                    </Td>
                    <Td style={{fontWeight: '700', color: '#fff', fontSize: '16px'}}>
                      ${Number(req.amount).toLocaleString()}
                    </Td>
                    <Td>
                      <ActionButton 
                        color="green" 
                        onClick={() => confirmAction(req.id, req.type, "APPROVE")} // 👈 Uses Toast Confirm
                        title="Approve"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Check size={18} />
                      </ActionButton>
                      <ActionButton 
                        color="red" 
                        onClick={() => confirmAction(req.id, req.type, "REJECT")} // 👈 Uses Toast Confirm
                        title="Reject"
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={18} />
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {/* 🔵 SECTION 2: RECENT BOOKINGS */}
      <Section>
        <SectionHeader>
          <FileText size={22} color="#3ea6ff" />
          <h3>Recent Seat Bookings</h3>
        </SectionHeader>
        
        {bookings.length === 0 ? (
          <EmptyState>
            <AlertCircle size={40} style={{ opacity: 0.3 }} />
            <p>No bookings found yet.</p>
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              {/* ⚠️ UPDATED TABLE HEADER: Added Plan Column */}
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>User Details</Th>
                  <Th>Package</Th>
                  <Th>Plan</Th> {/* 👈 Added */}
                  <Th>Seat No</Th>
                  <Th>Price</Th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <Tr 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Td>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <Calendar size={16} color="#666"/>
                        <div>
                          <div style={{fontWeight:500}}>{formatDate(b.booked_at)}</div>
                          <small style={{color:'#666', fontSize:'11px'}}>
                            {new Date(b.booked_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </small>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <UserInfo>
                        <span>{b.user_name || "Unknown"}</span>
                        <small>{b.email}</small>
                      </UserInfo>
                    </Td>
                    <Td>
                      <Badge bg="rgba(62, 166, 255, 0.1)" color="#3ea6ff" border="rgba(62, 166, 255, 0.2)">
                        {b.package_name}
                      </Badge>
                    </Td>
                    {/* ⚠️ UPDATED: DISPLAY PLAN TYPE (DAILY, MONTHLY, YEARLY) */}
                    <Td>
                      <Badge bg="rgba(142, 45, 226, 0.1)" color="#8e2de2" border="rgba(142, 45, 226, 0.2)">
                          <Layers size={12} style={{marginRight:5}}/>
                          {b.income_type || "DAILY"}
                      </Badge>
                    </Td>
                    <Td style={{fontFamily: 'monospace', fontSize:'15px', fontWeight: 'bold', color: '#fff'}}>
                      #{b.seat_number}
                    </Td>
                    <Td style={{color: '#2ecc71', fontWeight: 'bold'}}>
                      ${Number(b.ticket_price).toLocaleString()}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {/* 🔥 MODALS START HERE (Users & Revenue) */}
      <AnimatePresence>
        {activeModal && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)}>
            <ModalContainer onClick={e => e.stopPropagation()} layoutId={activeModal}>
              <ModalHeader>
                <h3>
                  {activeModal === 'users' ? <><Users size={24} color="#8e2de2"/> All Registered Users</> : <><DollarSign size={24} color="#3ea6ff"/> Revenue Details (All Bookings)</>}
                </h3>
                <CloseButton onClick={() => setActiveModal(null)}><X size={20}/></CloseButton>
              </ModalHeader>

              <TableContainer style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <Table>
                  {activeModal === 'users' ? (
                    <>
                      <thead><tr><Th>ID</Th><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Balance</Th><Th>Joined</Th></tr></thead>
                      <tbody>
                        {users.map(u => (
                          <Tr key={u.id}>
                            <Td>#{u.id}</Td>
                            <Td><span style={{color:'#fff', fontWeight:600}}>{u.name}</span></Td>
                            <Td>{u.email}</Td>
                            <Td><Badge bg={u.role==='admin' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)'} color={u.role==='admin' ? '#e74c3c' : '#2ecc71'} border="transparent">{u.role}</Badge></Td>
                            <Td style={{color: '#fff', fontWeight:'bold'}}>${Number(u.balance || 0).toLocaleString()}</Td>
                            <Td>{formatDate(u.created_at)}</Td>
                          </Tr>
                        ))}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead><tr><Th>Date</Th><Th>User Details</Th><Th>Package</Th><Th>Plan</Th><Th>Seat</Th><Th>Amount</Th></tr></thead>
                      <tbody>
                        {bookings.map((b, i) => (
                          <Tr key={i}>
                            <Td><div style={{display:'flex',gap:8,alignItems:'center'}}><Calendar size={14} color="#666"/>{formatDate(b.booked_at)}</div></Td>
                            <Td><UserInfo><span>{b.user_name}</span><small>{b.email}</small></UserInfo></Td>
                            <Td><Badge bg="rgba(62,166,255,0.1)" color="#3ea6ff" border="transparent">{b.package_name}</Badge></Td>
                            <Td><Badge bg="rgba(142,45,226,0.1)" color="#8e2de2" border="transparent">{b.income_type || "DAILY"}</Badge></Td>
                            <Td style={{fontFamily:'monospace'}}>#{b.seat_number}</Td>
                            <Td style={{color:'#2ecc71', fontWeight:'bold'}}>${Number(b.ticket_price).toLocaleString()}</Td>
                          </Tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </Table>
              </TableContainer>
            </ModalContainer>
          </Overlay>
        )}
      </AnimatePresence>

    </Container>
  );
}