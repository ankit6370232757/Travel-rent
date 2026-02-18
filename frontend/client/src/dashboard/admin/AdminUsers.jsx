import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, AlertCircle, FileSpreadsheet, 
  ChevronLeft, ChevronRight, UserCheck, UserX 
} from "lucide-react";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---

const Section = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 25px;
  overflow-x: auto;
`;

const TableContainer = styled.div`
  width: 100%;
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 950px;
  th { text-align: left; padding: 10px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 15px 10px; color: #ddd; font-size: 14px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 12px 0 0 12px; width: 60px; text-align: center; color: #555; font-weight: bold; }
  td:last-child { border-radius: 0 12px 12px 0; }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;
  background: ${props => props.bg}; color: ${props => props.color};
  text-transform: uppercase;
`;

const SearchBar = styled.div`
  position: relative;
  input {
    background: rgba(0,0,0,0.3); 
    border: 1px solid rgba(255,255,255,0.1);
    padding: 10px 15px 10px 40px; 
    border-radius: 10px; 
    color: #fff; 
    width: 300px;
    outline: none;
    transition: all 0.3s;
    &:focus { border-color: #8e2de2; background: rgba(0,0,0,0.4); }
  }
  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #666; }
`;

const ExportBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  background: rgba(46, 204, 113, 0.1); color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.2);
  padding: 10px 18px; border-radius: 12px;
  font-weight: 600; font-size: 13px; cursor: pointer;
  transition: all 0.3s ease;
  &:hover { background: #2ecc71; color: #fff; }
`;

const ToggleBtn = styled.button`
  background: ${props => props.active ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)'};
  color: ${props => props.active ? '#e74c3c' : '#2ecc71'};
  border: 1px solid ${props => props.active ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)'};
  padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: all 0.2s ease;
  &:hover { transform: scale(1.05); }
`;

const PaginationWrapper = styled.div`
  display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 25px;
  span { color: #888; font-size: 14px; }
`;

const PageBtn = styled.button`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
  &:disabled { opacity: 0.3; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #8e2de2; border-color: #8e2de2; }
`;

// --- COMPONENT ---

export default function AdminUsers({ users = [], onToggleStatus }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // ✅ 1. Filtering Logic
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

  // ✅ 2. Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // ✅ 3. Excel Export Logic
  const handleExport = () => {
    if (filteredUsers.length === 0) {
      toast.error("No data to export");
      return;
    }
    const exportData = filteredUsers.map((u, index) => ({
      "SL No": index + 1,
      "User ID": u.id,
      "Name": u.name || "N/A",
      "Email": u.email,
      "Role": u.role,
      "Balance": Number(u.balance || 0),
      "Status": u.is_active !== false ? "Active" : "Deactivated",
      "Joined Date": new Date(u.created_at).toLocaleDateString()
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users List");
    XLSX.writeFile(wb, `User_Management_${new Date().toLocaleDateString()}.xlsx`);
    toast.success("Excel exported!");
  };

  // ✅ 4. Status Toggle Wrapper (Fixes "Not a function" error)
  const handleToggle = (id, currentStatus) => {
    if (typeof onToggleStatus === 'function') {
      onToggleStatus(id, currentStatus);
    } else {
      console.error("Critical: onToggleStatus prop missing in parent component.");
      toast.error("Status update functionality not linked.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
              <Users size={20} color="#8e2de2" /> User Management
            </h3>
            <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
              Showing {filteredUsers.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} Users
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <SearchBar>
              <Search size={18} />
              <input 
                placeholder="Search name, email, or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>
            <ExportBtn onClick={handleExport}>
              <FileSpreadsheet size={18} /> Export
            </ExportBtn>
          </div>
        </div>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th># SL</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Balance</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {currentItems.length > 0 ? (
                  currentItems.map((u, index) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                    >
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td style={{ color: '#666' }}>#{u.id}</td>
                      <td style={{ fontWeight: 'bold', color: u.is_active === false ? '#ff4d4d' : '#fff' }}>
                        {u.name || "Unknown"} {u.is_active === false && " (Disabled)"}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <Badge 
                          bg={u.role === 'admin' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)'} 
                          color={u.role === 'admin' ? '#e74c3c' : '#2ecc71'}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td style={{ color: '#fff', fontWeight: 'bold' }}>
                        ${Number(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div style={{ color: '#ddd' }}>{new Date(u.created_at).toLocaleDateString()}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{new Date(u.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td>
                        <ToggleBtn 
                          active={u.is_active === false} 
                          onClick={() => handleToggle(u.id, u.is_active !== false)}
                        >
                          {u.is_active !== false ? (
                            <><UserX size={14}/> Deactivate</>
                          ) : (
                            <><UserCheck size={14}/> Activate</>
                          )}
                        </ToggleBtn>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                         <AlertCircle size={30} color="#444" />
                         <span>No users found.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </Table>
        </TableContainer>

        {/* ✅ 5. Pagination Controls */}
        {totalPages > 1 && (
          <PaginationWrapper>
            <PageBtn 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft size={20} />
            </PageBtn>
            
            <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>
            
            <PageBtn 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight size={20} />
            </PageBtn>
          </PaginationWrapper>
        )}
      </Section>
    </motion.div>
  );
}