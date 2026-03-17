import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, AlertCircle, FileSpreadsheet, 
  ChevronLeft, ChevronRight, UserCheck, UserX, 
  Eye, EyeOff, Lock, Copy, CheckCircle
} from "lucide-react";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---

const Section = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 15px;
  @media (min-width: 768px) { padding: 25px; }
`;

const TopBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
  @media (min-width: 1024px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
  @media (min-width: 768px) { max-width: 400px; }
  
  input {
    width: 100%;
    background: rgba(0,0,0,0.3); 
    border: 1px solid rgba(255,255,255,0.1);
    padding: 12px 15px 12px 45px; 
    border-radius: 12px; 
    color: #fff; 
    outline: none;
    transition: all 0.3s;
    &:focus { border-color: #3ea6ff; background: rgba(0,0,0,0.4); }
  }
  svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #666; }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  display: none; 
  @media (min-width: 1024px) { display: block; }
`;

const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  @media (min-width: 1024px) { display: none; }
`;

const MobileCard = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 1100px;
  th { text-align: left; padding: 12px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  td { padding: 15px 12px; color: #ddd; font-size: 14px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 12px 0 0 12px; width: 50px; text-align: center; }
  td:last-child { border-radius: 0 12px 12px 0; }
`;

const PasswordWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: #3ea6ff;
  
  .controls {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  button { 
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
    color: #888; cursor: pointer; padding: 5px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    &:hover { color: #fff; background: rgba(255,255,255,0.1); border-color: #3ea6ff; }
  }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 10px; font-size: 10px; font-weight: 700;
  background: ${props => props.bg}; color: ${props => props.color};
  text-transform: uppercase;
`;

const ActionBtn = styled.button`
  background: ${props => props.$active ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)'};
  color: ${props => props.$active ? '#e74c3c' : '#2ecc71'};
  border: 1px solid ${props => props.$active ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)'};
  padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 8px; width: fit-content;
  transition: all 0.2s ease;
  &:hover { background: ${props => props.$active ? '#e74c3c' : '#2ecc71'}; color: #fff; transform: translateY(-2px); }
`;

const PaginationWrapper = styled.div`
  display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 25px;
  span { color: #888; font-size: 13px; }
`;

const PageBtn = styled.button`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  &:disabled { opacity: 0.2; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #3ea6ff; border-color: #3ea6ff; }
`;

// --- COMPONENT ---

export default function AdminUsers({ users = [], onToggleStatus }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePasswords, setVisiblePasswords] = useState({}); 
  const itemsPerPage = 30;

  const togglePassword = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text) => {
    if (!text) return toast.error("No password to copy");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
        icon: '📋',
        style: { background: '#111', color: '#fff', border: '1px solid #333' }
    });
  };

  const filteredUsers = useMemo(() => {
    setCurrentPage(1); 
    if (!searchTerm) return users;
    const lowerSearch = searchTerm.toLowerCase();
    return users.filter(u => 
      u.name?.toLowerCase().includes(lowerSearch) || 
      u.email?.toLowerCase().includes(lowerSearch) ||
      u.id?.toString().includes(lowerSearch)
    );
  }, [users, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Section>
        <TopBar>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
              <Users size={22} color="#3ea6ff" /> User Management
            </h3>
            <p style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>Database contains {filteredUsers.length} total users</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '500px' }}>
            <SearchBar>
              <Search size={18} />
              <input 
                placeholder="Search by ID, Name, or Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>
          </div>
        </TopBar>

        {/* 💻 DESKTOP TABLE VIEW */}
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>SL</th>
                <th>UID</th>
                <th>Full Name</th>
                <th>Plain Password</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Balance</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((u, index) => (
                <tr key={u.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td style={{ color: '#888', fontWeight: 'bold' }}>{u.id}</td>
                  <td style={{ color: u.is_active === false ? '#ff4d4d' : '#fff', fontWeight: '600' }}>
                    {u.name || "N/A"}
                  </td>
                  <td>
                    <PasswordWrapper>
                      <Lock size={12} style={{opacity: 0.3}} />
                      <span style={{minWidth: '85px', fontSize: '13px'}}>
                        {visiblePasswords[u.id] ? u.password : "••••••••"}
                      </span>
                      <div className="controls">
                        <button onClick={() => togglePassword(u.id)} title="Show/Hide">
                            {visiblePasswords[u.id] ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                        <button onClick={() => handleCopy(u.password)} title="Copy Plaintext">
                            <Copy size={14}/>
                        </button>
                      </div>
                    </PasswordWrapper>
                  </td>
                  <td style={{ fontSize: '13px' }}>{u.email}</td>
                  <td>
                    <Badge bg={u.role === 'admin' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)'} color={u.role === 'admin' ? '#e74c3c' : '#2ecc71'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td style={{ color: '#fff', fontWeight: 'bold' }}>${Number(u.balance || 0).toFixed(2)}</td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <ActionBtn $active={u.is_active === false} onClick={() => onToggleStatus(u.id, u.is_active !== false)}>
                      {u.is_active !== false ? <><UserX size={14}/> Disable</> : <><UserCheck size={14}/> Enable</>}
                    </ActionBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        {/* 📱 MOBILE CARD VIEW */}
        <MobileGrid>
          {currentItems.map((u) => (
            <MobileCard key={u.id}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '15px', color: u.is_active === false ? '#ff4d4d' : '#fff'}}>{u.name}</div>
                  <div style={{fontSize: '11px', color: '#888', marginTop: '2px'}}>UID: {u.id} • {u.email}</div>
                </div>
                <Badge bg={u.role === 'admin' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)'} color={u.role === 'admin' ? '#e74c3c' : '#2ecc71'}>
                  {u.role}
                </Badge>
              </div>
              
              <div style={{background: 'rgba(0,0,0,0.2)', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <span style={{fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: 700}}>Password</span>
                 <PasswordWrapper>
                    <span style={{fontSize: '14px'}}>{visiblePasswords[u.id] ? u.password : "••••••••"}</span>
                    <div className="controls">
                        <button onClick={() => togglePassword(u.id)}><Eye size={14}/></button>
                        <button onClick={() => handleCopy(u.password)}><Copy size={14}/></button>
                    </div>
                 </PasswordWrapper>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px'}}>
                <div style={{fontWeight: 'bold', color: '#2ecc71', fontSize: '16px'}}>${Number(u.balance || 0).toFixed(2)}</div>
                <ActionBtn $active={u.is_active === false} onClick={() => onToggleStatus(u.id, u.is_active !== false)}>
                  {u.is_active !== false ? <><UserX size={14}/> Ban</> : <><UserCheck size={14}/> Unban</>}
                </ActionBtn>
              </div>
            </MobileCard>
          ))}
        </MobileGrid>

        {/* 🔢 PAGINATION */}
        {totalPages > 1 && (
          <PaginationWrapper>
            <PageBtn disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft size={18}/>
            </PageBtn>
            <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>
            <PageBtn disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight size={18}/>
            </PageBtn>
          </PaginationWrapper>
        )}
      </Section>
    </motion.div>
  );
}