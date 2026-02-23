import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Network, User, Hash, Layers, 
  BarChart2, IdCard, Share2, Search, 
  FileSpreadsheet, ChevronLeft, ChevronRight,
  Calendar, Filter
} from "lucide-react";
import api from "../api/axios";
import * as XLSX from "xlsx"; 

// --- STYLED COMPONENTS ---

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  @media (max-width: 768px) { padding: 20px; }
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-wrap: wrap; gap: 15px;
`;

const TitleGroup = styled.div`
  display: flex; align-items: center; gap: 12px;
`;

const TotalBadge = styled.div`
  background: linear-gradient(90deg, #3ea6ff, #2d55ff);
  padding: 6px 16px;
  border-radius: 12px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(62, 166, 255, 0.2);
`;

const IconBox = styled.div`
  background: rgba(62, 166, 255, 0.15); padding: 10px; border-radius: 12px;
  color: #3ea6ff; display: flex; align-items: center; justify-content: center;
`;

const Title = styled.h3` margin: 0; font-size: 18px; font-weight: 700; color: #fff; `;

const Subtitle = styled.div` font-size: 13px; color: #888; margin-top: 4px; `;

const ActionGroup = styled.div`
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative; display: flex; align-items: center;
  input {
    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px; padding: 8px 12px 8px 35px; color: #fff; font-size: 13px;
    outline: none; width: 160px; transition: all 0.3s ease;
    &:focus { width: 200px; border-color: #3ea6ff; }
  }
  svg { position: absolute; left: 10px; color: #666; }
`;

const FilterSelect = styled.select`
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; padding: 8px 12px; color: #fff; font-size: 13px; outline: none; cursor: pointer;
  option { background: #141419; color: #fff; }
`;

const ExportBtn = styled.button`
  display: flex; align-items: center; gap: 8px; background: rgba(46, 204, 113, 0.1);
  color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); padding: 8px 16px;
  border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;
  &:hover { background: rgba(46, 204, 113, 0.2); transform: translateY(-2px); }
`;

const TableContainer = styled.div`
  width: 100%; overflow-x: auto; border-radius: 16px; background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Table = styled.table` width: 100%; border-collapse: collapse; min-width: 900px; `;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.02);
  th {
    padding: 18px 24px; text-align: left; font-size: 11px; font-weight: 700;
    text-transform: uppercase; color: #666; letter-spacing: 0.8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    div { display: flex; align-items: center; gap: 6px; }
  }
`;

const Tr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.03); transition: background 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.04); }
  &:last-child { border-bottom: none; }
  td { padding: 18px 24px; font-size: 14px; color: #e0e0e0; vertical-align: middle; }
`;

// 🟢 ADDED MISSING NameCell DEFINITION
const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  div {
    display: flex;
    flex-direction: column;
    strong { color: #fff; font-weight: 600; font-size: 14px; }
    small { font-size: 11px; color: #555; }
  }
`;

const LevelBadge = styled.span`
  background: ${props => props.level === 1 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)'};
  color: ${props => props.level === 1 ? '#2ecc71' : '#f1c40f'};
  padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700;
  border: 1px solid ${props => props.level === 1 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)'};
`;

const UserIdTag = styled.span`
  font-family: 'Courier New', monospace; background: rgba(255, 255, 255, 0.05);
  padding: 6px 10px; border-radius: 6px; color: #ccc; font-size: 12px; font-weight: 600;
`;

const PaginationWrapper = styled.div`
  display: flex; align-items: center; justify-content: center;
  margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05);
  gap: 20px;
  span { color: #666; font-size: 13px; font-weight: 600; }
`;

const PageBtn = styled.button`
  background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1);
  padding: 8px 12px; border-radius: 8px; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:disabled { opacity: 0.3; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #3ea6ff; }
`;

export default function Referrals() {
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [widthFilter, setWidthFilter] = useState("all"); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    api.get("/referrals/my-network")
      .then(res => {
        setNetwork(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Network Error:", err);
        setLoading(false);
      });
  }, []);

  const filteredNetwork = useMemo(() => {
    return network.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === "all" || user.level?.toString() === levelFilter;
      
      let matchesWidth = true;
      const count = Number(user.referral_count || 0);
      if (widthFilter === "0") matchesWidth = count === 0;
      else if (widthFilter === "1-5") matchesWidth = count >= 1 && count <= 5;
      else if (widthFilter === "5+") matchesWidth = count >= 5;
      else if (widthFilter === "10+") matchesWidth = count >= 10;
      
      return matchesSearch && matchesLevel && matchesWidth;
    });
  }, [network, searchTerm, levelFilter, widthFilter]);

  const totalPages = Math.ceil(filteredNetwork.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredNetwork.slice(startIndex, startIndex + itemsPerPage);

  const exportToExcel = () => {
    const dataToExport = filteredNetwork.map((user, index) => ({
      No: index + 1,
      Name: user.name,
      Email: user.email,
      Level: user.level,
      Width: user.referral_count || 0,
      User_ID: user.id,
      Join_Date: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MyNetwork");
    XLSX.writeFile(workbook, `Network_Report.xlsx`);
  };

  return (
    <Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Header>
        <TitleGroup>
          <IconBox><Network size={22} /></IconBox>
          <div><Title>My Network</Title><Subtitle>Referral Tree Overview</Subtitle></div>
          {!loading && <TotalBadge><Users size={14} /> {network.length} Total</TotalBadge>}
        </TitleGroup>

        <ActionGroup>
          <SearchWrapper>
            <Search size={16} />
            <input type="text" placeholder="Search user..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </SearchWrapper>

          <FilterSelect value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">All Levels</option>
            {[1, 2, 3, 4, 5, 6].map(lvl => <option key={lvl} value={lvl}>Level {lvl}</option>)}
          </FilterSelect>

          <FilterSelect value={widthFilter} onChange={(e) => { setWidthFilter(e.target.value); setCurrentPage(1); }}>
            <option value="all">All Widths</option>
            <option value="0">0 Referrals</option>
            <option value="1-5">1-5 Referrals</option>
            <option value="5+">5+ Referrals</option>
          </FilterSelect>

          <ExportBtn onClick={exportToExcel}><FileSpreadsheet size={18} /> Export</ExportBtn>
        </ActionGroup>
      </Header>

      <TableContainer>
        <Table>
          <Thead>
            <tr>
              <th style={{width: '60px'}}><div><Hash size={14}/> No.</div></th>
              <th><div><User size={14}/> User Name</div></th>
              <th><div><Layers size={14}/> Level</div></th>
              <th><div><BarChart2 size={14}/> Width</div></th>
              <th><div><Calendar size={14}/> Join Date</div></th>
              <th><div><IdCard size={14}/> User ID</div></th>
            </tr>
          </Thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#666'}}>Loading...</td></tr>
            ) : currentData.length === 0 ? (
               <tr><td colSpan="6" style={{textAlign:'center', padding:'60px'}}><Share2 size={40} style={{opacity:0.2}}/><p style={{color:'#888'}}>No results found.</p></td></tr>
            ) : (
              currentData.map((user, index) => (
                <Tr key={user.id || index} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td><span style={{color: '#444', fontWeight:'700'}}>#{startIndex + index + 1}</span></td>
                  <td>
                    <NameCell>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3ea6ff, #8e2de2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>{user.name?.charAt(0).toUpperCase()}</div>
                      <div><strong>{user.name}</strong><small>{user.email}</small></div>
                    </NameCell>
                  </td>
                  <td><LevelBadge level={user.level}>Level {user.level}</LevelBadge></td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <div style={{ width: `${Math.min((user.referral_count || 0) * 10, 100)}%`, height: '100%', background: '#3ea6ff', borderRadius: '4px' }} />
                      </div>
                      <span style={{fontSize:'12px', fontWeight:'700'}}>{user.referral_count || 0}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#fff', fontSize: '13px' }}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                      <small style={{ color: '#555', fontSize: '11px' }}>{user.created_at ? new Date(user.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</small>
                    </div>
                  </td>
                  <td><UserIdTag>{user.id}</UserIdTag></td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <PaginationWrapper>
          <PageBtn disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></PageBtn>
          <span>Page {currentPage} of {totalPages}</span>
          <PageBtn disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></PageBtn>
        </PaginationWrapper>
      )}
    </Card>
  );
}