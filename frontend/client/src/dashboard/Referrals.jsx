import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Network, User, Hash, Layers, 
  BarChart2, IdCard, Share2, Search, 
  FileSpreadsheet, ChevronLeft, ChevronRight,
  Calendar, Filter, Copy, CheckCircle2, Info
} from "lucide-react";
import api from "../api/axios";
import * as XLSX from "xlsx"; 
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  @media (max-width: 768px) { padding: 20px; }
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-wrap: wrap; gap: 15px;
`;

const TitleGroup = styled.div` display: flex; align-items: center; gap: 12px; `;

const TotalBadge = styled.div`
  background: linear-gradient(90deg, #3ea6ff, #2d55ff);
  padding: 6px 16px; border-radius: 12px; color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(62, 166, 255, 0.2);
`;

const IconBox = styled.div`
  background: rgba(62, 166, 255, 0.15); padding: 10px; border-radius: 12px;
  color: #3ea6ff; display: flex; align-items: center; justify-content: center;
`;

const Title = styled.h3` margin: 0; font-size: 18px; font-weight: 700; color: #fff; `;
const Subtitle = styled.div` font-size: 13px; color: #888; margin-top: 4px; `;

const ActionGroup = styled.div` display: flex; align-items: center; gap: 12px; flex-wrap: wrap; `;

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
`;

const ExportBtn = styled.button`
  display: flex; align-items: center; gap: 8px; background: rgba(46, 204, 113, 0.1);
  color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); padding: 8px 16px;
  border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer;
  &:hover { background: rgba(46, 204, 113, 0.2); transform: translateY(-2px); }
`;

const TableContainer = styled.div`
  width: 100%; overflow-x: auto; border-radius: 16px; background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 20px;
`;

const Table = styled.table` width: 100%; border-collapse: collapse; min-width: 900px; `;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.02);
  th {
    padding: 18px 24px; text-align: left; font-size: 11px; font-weight: 700;
    text-transform: uppercase; color: #666; letter-spacing: 0.8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const Tr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  &:hover { background: rgba(255, 255, 255, 0.04); }
  td { padding: 18px 24px; font-size: 14px; color: #e0e0e0; }
`;

const NameCell = styled.div`
  display: flex; align-items: center; gap: 12px;
  div { display: flex; flex-direction: column; strong { color: #fff; } small { color: #666; } }
`;

const LevelBadge = styled.span`
  background: ${props => props.level === 1 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)'};
  color: ${props => props.level === 1 ? '#2ecc71' : '#f1c40f'};
  padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700;
`;

const BonusSection = styled.div`
  display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; margin-bottom: 30px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const BonusTable = styled.div`
  background: rgba(255,255,255,0.03); border-radius: 20px; padding: 20px; border: 1px solid rgba(255,255,255,0.05);
  h4 { margin: 0 0 15px 0; color: #3ea6ff; display: flex; align-items: center; gap: 8px; font-size: 15px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
  .row:last-child { border: none; }
  span { color: #888; } b { color: #2ecc71; }
`;

const ReferralLinkBox = styled.div`
  background: linear-gradient(90deg, rgba(62, 166, 255, 0.1), rgba(45, 85, 255, 0.05));
  border: 1px dashed rgba(62, 166, 255, 0.3); border-radius: 16px; padding: 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  @media (max-width: 600px) { flex-direction: column; text-align: center; }
`;

const LinkInput = styled.div`
  flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
  padding: 12px 15px; border-radius: 10px; color: #fff; font-family: monospace; font-size: 13px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const CopyBtn = styled.button`
  background: #3ea6ff; color: #fff; border: none; padding: 12px 25px; border-radius: 10px;
  font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;
  &:hover { transform: scale(1.05); background: #2d55ff; }
`;

export default function Referrals() {
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [widthFilter, setWidthFilter] = useState("all"); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🟢 User Referral Info
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const referralCode = user.referralCode || "USER123";
  const inviteLink = `${window.location.origin}/register?ref=${referralCode}`;

  useEffect(() => {
    api.get("/referrals/my-network")
      .then(res => { setNetwork(res.data || []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Referral link copied!");
  };

  const filteredNetwork = useMemo(() => {
    return network.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.id?.toString().includes(searchTerm);
      const matchesLevel = levelFilter === "all" || user.level?.toString() === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [network, searchTerm, levelFilter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredNetwork.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* 🟢 TOP SECTION: BONUS RULES */}
      <BonusSection>
        <BonusTable>
          <h4><Layers size={18}/> Depth Bonus (D1-D6)</h4>
          {[
            {l: 'Level 1', p: '10%'}, {l: 'Level 2', p: '1%'}, {l: 'Level 3', p: '1%'},
            {l: 'Level 4', p: '0.5%'}, {l: 'Level 5', p: '0.5%'}, {l: 'Level 6', p: '0.5%'}
          ].map(row => (
            <div className="row" key={row.l}><span>{row.l}</span><b>{row.p} of Price</b></div>
          ))}
        </BonusTable>
        <BonusTable>
          <h4><BarChart2 size={18}/> Width Bonus (W1-W9)</h4>
          <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
             {[
               {w: 'W1', r: '$10'}, {w: 'W2', r: '$11'}, {w: 'W3', r: '$12'},
               {w: 'W4', r: '$13'}, {w: 'W5', r: '$14'}, {w: 'W6', r: '$15'},
               {w: 'W7', r: '$16'}, {w: 'W8', r: '$17'}, {w: 'W9', r: '$18'}
             ].map(row => (
               <div className="row" key={row.w} style={{padding:'6px 0'}}><span>Node {row.w}</span><b>{row.r} Reward</b></div>
             ))}
          </div>
        </BonusTable>
      </BonusSection>

      {/* 🟢 MAIN NETWORK TABLE */}
      <Card initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Header>
          <TitleGroup>
            <IconBox><Network size={22} /></IconBox>
            <div><Title>Active Network</Title><Subtitle>Your Team Members</Subtitle></div>
            {!loading && <TotalBadge><Users size={14} /> {network.length} Total</TotalBadge>}
          </TitleGroup>

          <ActionGroup>
            <SearchWrapper>
              <Search size={16} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </SearchWrapper>
            <FilterSelect value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="all">All Levels</option>
              {[1,2,3,4,5,6].map(l => <option value={l} key={l}>Level {l}</option>)}
            </FilterSelect>
          </ActionGroup>
        </Header>

        <TableContainer>
          <Table>
            <Thead>
              <tr>
                <th style={{width:'80px'}}>No.</th>
                <th>User Details</th>
                <th>Rank</th>
                <th>Network Width</th>
                <th>Join Date</th>
                <th>User ID</th>
              </tr>
            </Thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{textAlign:'center', padding:'40px'}}>Syncing...</td></tr> : 
              currentData.map((u, i) => (
                <Tr key={u.id}>
                  <td><span style={{color:'#666', fontWeight:700}}>#{startIndex + i + 1}</span></td>
                  <td>
                    <NameCell>
                       <div style={{width:'35px', height:'35px', borderRadius:'10px', background:'#3ea6ff', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>{u.name?.charAt(0)}</div>
                       <div><strong>{u.name}</strong><small>{u.email}</small></div>
                    </NameCell>
                  </td>
                  <td><LevelBadge level={u.level}>Level {u.level}</LevelBadge></td>
                  <td><div style={{display:'flex', gap:'8px', alignItems:'center'}}><BarChart2 size={14} color="#3ea6ff"/>{u.referral_count || 0} Directs</div></td>
                  <td><Calendar size={14} style={{marginRight:8}}/>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td><code style={{background:'rgba(255,255,255,0.05)', padding:'4px 8px', borderRadius:'6px'}}>{u.id}</code></td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        {/* 🟢 REFERRAL LINK SECTION */}
        <ReferralLinkBox>
          <div style={{display:'flex', alignItems:'center', gap: '15px'}}>
             <div style={{background:'rgba(62, 166, 255, 0.2)', padding:'10px', borderRadius:'50%', color:'#3ea6ff'}}><Share2 size={20}/></div>
             <div>
                <strong style={{display:'block', color:'#fff'}}>Invite New Partners</strong>
                <span style={{fontSize:'12px', color:'#888'}}>Earn up to 10% on every purchase they make.</span>
             </div>
          </div>
          <LinkInput>{inviteLink}</LinkInput>
          <CopyBtn onClick={copyLink}><Copy size={16}/> Copy Link</CopyBtn>
        </ReferralLinkBox>
      </Card>
    </div>
  );
}