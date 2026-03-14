import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Network, User, Layers, 
  BarChart2, Share2, Search, 
  FileSpreadsheet, Calendar, Copy, 
  DollarSign, TrendingUp, Award,
  ChevronLeft, ChevronRight, Info, HelpCircle
} from "lucide-react";
import api from "../api/axios";
import * as XLSX from "xlsx"; // 🟢 Added Excel Export
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%);
  backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px; padding: 30px; margin-bottom: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
`;

const Badge = styled.div`
  background: ${props => props.bg || 'rgba(62, 166, 255, 0.1)'};
  color: ${props => props.color || '#3ea6ff'};
  padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; border: 1px solid ${props => props.border || 'rgba(62, 166, 255, 0.2)'};
`;

const InfoGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const InfoBox = styled.div`
  background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px; border-radius: 20px;
  h4 { color: #3ea6ff; display: flex; align-items: center; gap: 10px; margin: 0 0 15px 0; font-size: 16px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #aaa; }
  b { color: #2ecc71; }
`;

const TableContainer = styled.div`
  width: 100%; overflow-x: auto; border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(0,0,0,0.2);
`;

const StyledTable = styled.table`
  width: 100%; border-collapse: collapse; min-width: 1000px;
  th { padding: 20px; text-align: left; color: #666; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
  td { padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }
`;

const Pagination = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-top: 25px;
  .controls { display: flex; gap: 10px; }
  button { 
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
    color: #fff; padding: 8px 15px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 5px;
    &:disabled { opacity: 0.3; cursor: not-allowed; }
    &:hover:not(:disabled) { background: #3ea6ff; border-color: #3ea6ff; }
  }
`;

export default function Referrals() {
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const inviteLink = `${window.location.origin}/register?ref=${user.referralCode || 'USER'}`;

  useEffect(() => {
    api.get("/referrals/my-network")
      .then(res => { setNetwork(res.data || []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filteredNetwork = useMemo(() => {
    return network.filter(u => {
      const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.id?.toString().includes(searchTerm);
      const matchLevel = levelFilter === "all" || u.level?.toString() === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [network, searchTerm, levelFilter]);

  // 🟢 Pagination Logic
  const totalPages = Math.ceil(filteredNetwork.length / itemsPerPage);
  const currentData = filteredNetwork.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredNetwork.map(u => ({
      ID: u.id, Name: u.name, Level: u.level, Directs: u.referral_count, Earnings: u.total_bonus, Date: u.created_at
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MyNetwork");
    XLSX.writeFile(wb, "Referral_Report.xlsx");
    toast.success("Excel Report Downloaded!");
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      {/* 🟢 TOP INFO SECTION: Level & Width Rules */}
      {/* <InfoGrid>
        <InfoBox>
          <h4><Layers size={18}/> Depth Income (D1 - D6)</h4>
          <div className="row"><span>Level 1 (Direct)</span><b>10% Commission</b></div>
          <div className="row"><span>Level 2 & 3</span><b>1% Commission</b></div>
          <div className="row"><span>Level 4, 5 & 6</span><b>0.5% Commission</b></div>
          <p style={{fontSize:'11px', color:'#555', marginTop:'10px'}}>*Earn on every seat purchase in your downline.</p>
        </InfoBox>
        <InfoBox>
          <h4><Award size={18}/> Width Rewards (Milestones)</h4>
          <div className="row"><span>Node W5 (5 Directs)</span><b>$14.00 Fixed</b></div>
          <div className="row"><span>Node W9 (9 Directs)</span><b>$18.00 Fixed</b></div>
          <div className="row"><span>Node W3 (3 Directs)</span><b>$12.00 Fixed</b></div>
          <p style={{fontSize:'11px', color:'#555', marginTop:'10px'}}>*Unlock fixed bonuses as your direct team grows.</p>
        </InfoBox>
      </InfoGrid> */}

      <Card initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#555' }} size={16}/>
              <input 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 10px 10px 40px', borderRadius: '12px', color: '#fff', outline: 'none', width: '220px' }}
                placeholder="Search team..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select 
              style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '12px', outline: 'none', cursor:'pointer' }}
              value={levelFilter}
              onChange={e => { setLevelFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Levels</option>
              {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
          <button onClick={exportToExcel} style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <FileSpreadsheet size={18}/> Export Excel
          </button>
        </div>

        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>SL</th>
                <th>Member</th>
                 <th>User ID</th>
                <th>Level</th>
                {/* <th>Width </th> */}
                <th>Total Commission</th>
                <th>DOJ</th>
               
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Syncing Network...</td></tr>
              ) : currentData.map((u, i) => (
                <tr key={u.id}>
                  <td>{i+1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'linear-gradient(135deg, #3ea6ff, #2d55ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>{u.name?.charAt(0)}</div> */}
                      <div><div style={{ fontWeight: 'bold', color: '#fff' }}>{u.name}</div></div>
                    </div>
                  </td>
                  <td><code style={{ color: '#3ea6ff', fontSize:'16px' }}>{u.id}</code></td>

                  <td  bg={u.level === 1 ? 'rgba(46, 204, 113, 0.1)' : 'rgba(46, 204, 113, 0.1)'} color={u.level === 1 ? '#2ecc71' : '#2ecc71'} border="transparent"> {u.level}</td>
                  {/* <td>
    {u.level === 1 ? (
      <>
        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
          {u.referral_count} / 9 Nodes
        </div>
        <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
          <div
            style={{
              width: `${Math.min((u.referral_count / 9) * 100, 100)}%`, // Note: Fixed to / 9 based on your label
              height: '100%',
              background: '#3ea6ff',
              borderRadius: '10px',
            }}
          />
        </div>
      </>
    ) : (
      <span style={{ color: '#444' }}>-</span> // Displays a dash for other levels
    )}
  </td> */}

                  <td><div style={{ color: '#2ecc71', fontWeight: '800' }}><DollarSign size={14} style={{marginBottom:-2}}/> {Number(u.total_bonus || 0).toFixed(2)}</div></td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>

        {/* 🟢 PAGINATION CONTROLS */}
        <Pagination>
          <span style={{color:'#666', fontSize:'13px'}}>Showing {currentData.length} of {filteredNetwork.length} members</span>
          <div className="controls">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/> Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next <ChevronRight size={16}/></button>
          </div>
        </Pagination>

        {/* 🟢 INVITE LINK BOX */}
        <div style={{ marginTop: '30px', background: 'rgba(62, 166, 255, 0.05)', padding: '25px', borderRadius: '24px', border: '1px dashed rgba(62, 166, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ background: '#3ea6ff', padding: '12px', borderRadius: '15px', color: '#fff' }}><Share2 size={24}/></div>
            <div><h4 style={{ color: '#fff', margin: 0 }}>Recruit New Partners</h4><p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Grow your Level 1 to unlock maximum passive depth commissions.</p></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px' }}>
            <div style={{ flex: 1, background: '#000', border: '1px solid #222', padding: '12px', borderRadius: '12px', color: '#3ea6ff', fontSize: '13px', overflow: 'hidden' }}>{inviteLink}</div>
            <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Link Copied!"); }} style={{ background: '#3ea6ff', border: 'none', color: '#fff', padding: '0 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}><Copy size={16}/> Copy</button>
          </div>
        </div>
      </Card>
    </div>
  );
}