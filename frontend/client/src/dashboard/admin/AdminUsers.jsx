import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";

const Section = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 25px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 800px;
  th { text-align: left; padding: 10px; color: #888; font-size: 12px; }
  td { padding: 15px 10px; color: #ddd; font-size: 14px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 10px 0 0 10px; }
  td:last-child { border-radius: 0 10px 10px 0; }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;
  background: ${props => props.bg}; color: ${props => props.color};
`;

const SearchBar = styled.div`
  display: flex; gap: 10px; margin-bottom: 20px;
  input {
    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
    padding: 10px 15px; border-radius: 10px; color: #fff; width: 300px;
  }
`;

export default function AdminUsers({ users }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Section>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:10}}>
            <Users size={20} color="#8e2de2"/> User Management
          </h3>
          <SearchBar>
             <input placeholder="Search users (coming soon)..." disabled />
          </SearchBar>
        </div>

        <Table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Balance</th><th>Joined</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td style={{fontWeight:'bold', color:'#fff'}}>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Badge bg={u.role==='admin' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)'} 
                         color={u.role==='admin' ? '#e74c3c' : '#2ecc71'}>
                    {u.role}
                  </Badge>
                </td>
                <td style={{color:'#fff', fontWeight:'bold'}}>${Number(u.balance || 0).toLocaleString()}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
    </motion.div>
  );
}