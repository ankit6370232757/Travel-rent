import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { DollarSign, Users, AlertCircle, FileText, Calendar, Layers } from "lucide-react";

// --- STYLED COMPONENTS ---
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatIcon = styled.div`
  width: 50px; height: 50px; border-radius: 14px;
  background: ${props => props.bg}; color: ${props => props.color};
  display: flex; align-items: center; justify-content: center;
`;

const Section = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 25px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 600px;
  th { text-align: left; padding: 10px; color: #888; font-size: 12px; }
  td { padding: 15px 10px; color: #ddd; font-size: 14px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 10px 0 0 10px; }
  td:last-child { border-radius: 0 10px 10px 0; }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;
  background: ${props => props.bg}; color: ${props => props.color};
`;

const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function AdminOverview({ stats, bookings }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* 📊 STATS GRID */}
      <Grid>
        <StatCard>
          <StatIcon bg="rgba(62, 166, 255, 0.1)" color="#3ea6ff"><DollarSign /></StatIcon>
          <div>
            <h4 style={{margin:0, color:'#888'}}>Total Revenue</h4>
            <span style={{fontSize:'24px', fontWeight:'bold'}}>${stats.revenue.toLocaleString()}</span>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon bg="rgba(142, 45, 226, 0.1)" color="#8e2de2"><Users /></StatIcon>
          <div>
            <h4 style={{margin:0, color:'#888'}}>Total Users</h4>
            <span style={{fontSize:'24px', fontWeight:'bold'}}>{stats.users}</span>
          </div>
        </StatCard>
        <StatCard>
          <StatIcon bg="rgba(241, 196, 15, 0.1)" color="#f1c40f"><AlertCircle /></StatIcon>
          <div>
            <h4 style={{margin:0, color:'#888'}}>Pending Actions</h4>
            <span style={{fontSize:'24px', fontWeight:'bold'}}>{stats.pending}</span>
          </div>
        </StatCard>
      </Grid>

      {/* 📋 RECENT BOOKINGS TABLE */}
      <Section>
        <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:10}}>
          <FileText size={20} color="#3ea6ff"/> Recent Bookings
        </h3>
        {bookings.length === 0 ? <p style={{color:'#666'}}>No bookings found.</p> : (
          <Table>
            <thead>
              <tr><th>Date</th><th>User</th><th>Package</th><th>Plan</th><th>Price</th></tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={i}>
                  <td><div style={{display:'flex', gap:6, alignItems:'center'}}><Calendar size={14}/> {formatDate(b.booked_at)}</div></td>
                  <td>{b.user_name || b.email}</td>
                  <td><Badge bg="rgba(62,166,255,0.1)" color="#3ea6ff">{b.package_name}</Badge></td>
                  <td><Badge bg="rgba(142,45,226,0.1)" color="#8e2de2"><Layers size={10} style={{marginRight:4}}/>{b.income_type || "DAILY"}</Badge></td>
                  <td style={{color:'#2ecc71', fontWeight:'bold'}}>${Number(b.ticket_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </motion.div>
  );
}