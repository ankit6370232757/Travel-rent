import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Network, User, Layers, Search, FileSpreadsheet, Copy, Share2, 
  DollarSign, TrendingUp, X, Info, ShieldCheck, Package, ArrowRight, Target, Calendar, BarChart3, Zap
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%);
  backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px; padding: 30px; margin-bottom: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
`;

const GlobalStatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px; margin-bottom: 30px;
`;

const StatMiniCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px; border-radius: 20px;
  display: flex; align-items: center; gap: 15px; 
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: 0.3s;
  &:hover { ${props => props.clickable && 'background: rgba(62, 166, 255, 0.1); border-color: #3ea6ff;'} }
  .icon-box { background: rgba(62, 166, 255, 0.1); padding: 10px; border-radius: 12px; color: #3ea6ff; }
  .label { font-size: 12px; color: #888; }
  .val { font-size: 20px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;}
`;

const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;
`;

const Modal = styled(motion.div)`
  background: #111113; border: 1px solid rgba(255,255,255,0.08);
  width: 100%; max-width: 550px; border-radius: 32px; padding: 35px;
  position: relative; box-shadow: 0 40px 80px rgba(0,0,0,0.9);
`;

const ProgressBar = styled.div`
  width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-top: 10px; overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%; width: ${props => props.$percent}%; background: linear-gradient(90deg, #3ea6ff, #2ecc71); border-radius: 10px;
`;

const TableContainer = styled.div`
  width: 100%; overflow-x: auto; border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(0,0,0,0.2);
`;

const StyledTable = styled.table`
  width: 100%; border-collapse: collapse; min-width: 1000px;
  th { padding: 20px; text-align: left; color: #555; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #222; }
  td { padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); vertical-align: middle; }
`;

const Badge = styled.div`
  background: rgba(62, 166, 255, 0.08); color: ${props => props.color || '#3ea6ff'};
  padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; border: 1px solid rgba(62, 166, 255, 0.15);
`;

export default function Referrals() {
  const [network, setNetwork] = useState([]);
  const [stats, setStats] = useState({ total_packages: 0, breakdown: [] });
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberPackages, setMemberPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const inviteLink = `${window.location.origin}/register?ref=${user.referralCode || 'USER'}`;

  useEffect(() => {
    api.get("/referrals/my-network").then(res => { setNetwork(res.data || []); setLoading(false); });
    api.get("/referrals/stats/width").then(res => setStats(res.data));
  }, []);

  const fetchMemberDetails = async (member) => {
    setSelectedMember(member);
    try {
      const res = await api.get(`/referrals/member-packages/${member.id}`);
      setMemberPackages(res.data.packages || []);
      setSelectedMember(prev => ({ ...prev, relationshipDepth: res.data.depth }));
    } catch (err) { toast.error("Access denied"); }
  };

  const filteredNetwork = useMemo(() => {
    return network.filter(u => {
      const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.id?.toString().includes(searchTerm);
      const matchLevel = levelFilter === "all" || u.level?.toString() === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [network, searchTerm, levelFilter]);

  const currentData = filteredNetwork.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getCommissionRate = (count) => {
    const rate = 10 + count;
    return rate >= 18 ? "18%" : `${rate}%`;
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BarChart3 size={20} color="#3ea6ff" /> Direct Width Performance
      </h3>
      
      <GlobalStatsRow>
        <StatMiniCard>
          <div className="icon-box"><Users size={20}/></div>
          <div><div className="label">Direct Partners</div><div className="val">{network.filter(u => u.level === 1).length} Users</div></div>
        </StatMiniCard>

        {/* 🟢 TOTAL SEATS REFERRED (CLICKABLE) */}
        <StatMiniCard clickable onClick={() => setShowBreakdown(true)}>
          <div className="icon-box"><Layers size={20}/></div>
          <div>
            <div className="label">Total Seats Referred</div>
            <div className="val">{stats.total_packages || 0} Seat <ArrowRight size={14} style={{marginLeft: 4, color: '#3ea6ff'}}/></div>
          </div>
        </StatMiniCard>

        <StatMiniCard>
          <div className="icon-box"><Target size={20}/></div>
          <div><div className="label">Highest Possible Rate</div><div className="val">18% Payout</div></div>
        </StatMiniCard>
      </GlobalStatsRow>

      {/* 🟢 MODAL 1: TOTAL PACKAGE BREAKDOWN (LINEAR TRACKING) */}
      <AnimatePresence>
        {showBreakdown && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBreakdown(false)}>
            <Modal onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <button onClick={() => setShowBreakdown(false)} style={{ position: 'absolute', top: 25, right: 25, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', padding: 5, cursor: 'pointer' }}><X size={18}/></button>
              <h3 style={{ marginBottom: 25, display: 'flex', alignItems: 'center', gap: 10 }}><Package color="#3ea6ff"/> Direct Seat Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.breakdown?.length > 0 ? stats.breakdown.map(pkg => (
                  <div key={pkg.package_id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: 18, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{pkg.package_name}</span>
                      <Badge color="#2ecc71">{pkg.seat_count} Sold</Badge>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15, fontSize: '11px' }}>
                      <span style={{ color: '#888' }}>Current Commission: <b style={{color: '#3ea6ff'}}>{getCommissionRate(pkg.seat_count)}</b></span>
                      <span style={{ color: '#888' }}>{pkg.seat_count}/8 to Max</span>
                    </div>
                    <ProgressBar><ProgressFill $percent={Math.min((pkg.seat_count/8)*100, 100)} /></ProgressBar>
                  </div>
                )) : <div style={{textAlign: 'center', padding: '20px', color: '#444'}}>No package data available.</div>}
              </div>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>

      <Card initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ position: 'relative' }}>
               <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#555' }} size={16}/>
               <input 
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 12px 12px 42px', borderRadius: '14px', color: '#fff', outline: 'none', width: '250px' }}
                 placeholder="Search by ID or Name..."
                 onChange={e => setSearchTerm(e.target.value)}
               />
             </div>
             <select 
               style={{ background: '#0a0a0c', color: '#fff', border: '1px solid #222', padding: '10px 20px', borderRadius: '14px', cursor:'pointer' }}
               value={levelFilter}
               onChange={e => setLevelFilter(e.target.value)}
             >
               <option value="all">Depth: All Levels</option>
               {[1,2,3,4,5,6].map(l => <option key={l} value={l}>Level {l}</option>)}
             </select>
          </div>
          <button style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '10px 20px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <FileSpreadsheet size={18}/> Export Report
          </button>
        </div>

        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>SL</th><th>Member Identity</th><th>System ID</th><th>Depth Level</th><th>Accumulated Commission</th><th>Joining Date</th><th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Fetching secure network data...</td></tr>
              ) : currentData.map((u, i) => (
                <tr key={u.id}>
                  <td>{((currentPage - 1) * itemsPerPage) + i + 1}</td>
                  <td><div style={{ fontWeight: '700', color: '#fff' }}>{u.name}</div></td>
                  <td><code style={{ color: '#3ea6ff' }}>#{u.id}</code></td>
                  <td><Badge color="#2ecc71">Level {u.level}</Badge></td>
                  <td><div style={{ fontWeight: '800' }}>${Number(u.total_bonus || 0).toFixed(2)}</div></td>
                  <td style={{ fontSize: '13px', color: '#666' }}>{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <button onClick={() => fetchMemberDetails(u)} style={{ background: 'rgba(62,166,255,0.1)', border: '1px solid rgba(62,166,255,0.2)', color: '#3ea6ff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Analyze <ArrowRight size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>
      </Card>

      {/* 🟢 MODAL 2: INDIVIDUAL MEMBER ANALYZE */}
      <AnimatePresence>
        {selectedMember && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMember(null)}>
            <Modal onClick={e => e.stopPropagation()} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: 25, right: 25, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', padding: 5, cursor: 'pointer' }}><X size={18}/></button>
              <div style={{textAlign: 'center', marginBottom: 25}}>
                <div style={{width: 70, height: 70, background: 'linear-gradient(135deg, rgba(62,166,255,0.2), rgba(46,204,113,0.2))', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto'}}><ShieldCheck size={35} color="#3ea6ff" /></div>
                <h2 style={{margin: 0, fontSize: 22}}>{selectedMember.name}</h2>
                <Badge color="#888">UID: {selectedMember.id}</Badge>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: 14}}>
                <span style={{color: '#888', display: 'flex', alignItems: 'center', gap: 8}}><Target size={14}/> Network Position</span>
                <span style={{color: '#fff', fontWeight: 700}}>Level {selectedMember.relationshipDepth || selectedMember.level} Member</span>
              </div>

              <div style={{background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)'}}>
                <label style={{fontSize: 11, color: '#555', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 15}}>Detailed Earning Events</label>
                <div style={{maxHeight: 280, overflowY: 'auto', paddingRight: 10}}>
                  {memberPackages.length > 0 ? memberPackages.map((p, idx) => (
                    <div key={idx} style={{background: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 16, marginBottom: 12}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}><Package size={14} color="#3ea6ff" /><span style={{fontSize: 14, fontWeight: 700}}>{p.package_name}</span></div>
                        <span style={{color: '#2ecc71', fontWeight: 800}}>+${Number(p.commission_earned || 0).toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666', marginBottom: 10}}>
                        <span>Price: ${p.ticket_price}</span><span>{new Date(p.booked_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#3ea6ff', fontWeight: 600, background: 'rgba(62,166,255,0.05)', padding: '4px 8px', borderRadius: 6, width: 'fit-content'}}>
                        <Zap size={10}/> {p.referral_type?.replace(/_/g, ' ') || 'Direct Bonus'}
                      </div>
                    </div>
                  )) : <p style={{color: '#444', fontSize: 13, textAlign: 'center'}}>No earnings recorded yet.</p>}
                </div>
              </div>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>

      {/* INVITE BOX */}
      <div style={{ background: 'rgba(62, 166, 255, 0.05)', padding: '30px', borderRadius: '28px', border: '1px dashed rgba(62, 166, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '25px', flexWrap: 'wrap', marginTop: 30 }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: '#3ea6ff', padding: '15px', borderRadius: '18px', color: '#fff' }}><Share2 size={28}/></div>
          <div><h3 style={{ color: '#fff', margin: '0 0 5px 0' }}>Build Your Empire</h3><p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Every direct seat referred increases your rate for that product.</p></div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '320px' }}>
          <div style={{ flex: 1, background: '#000', border: '1px solid #222', padding: '14px', borderRadius: '14px', color: '#3ea6ff', fontSize: '13px', overflow: 'hidden' }}>{inviteLink}</div>
          <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Copied!"); }} style={{ background: '#3ea6ff', border: 'none', color: '#fff', padding: '0 25px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>Copy</button>
        </div>
      </div>
    </div>
  );
}