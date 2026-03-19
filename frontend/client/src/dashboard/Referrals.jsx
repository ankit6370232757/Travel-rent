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
  padding: 22px; border-radius: 24px;
  display: flex; align-items: center; gap: 18px; 
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { ${props => props.clickable && 'background: rgba(62, 166, 255, 0.08); border-color: rgba(62, 166, 255, 0.3); transform: translateY(-3px);'} }
  .icon-box { background: rgba(62, 166, 255, 0.1); padding: 12px; border-radius: 16px; color: #3ea6ff; }
  .label { font-size: 12px; color: #888; font-weight: 500; margin-bottom: 4px; }
  .val { font-size: 22px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;}
`;

const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;
`;

const Modal = styled(motion.div)`
  background: #0f0f11; border: 1px solid rgba(255,255,255,0.1);
  width: 100%; max-width: 480px; border-radius: 32px; padding: 30px;
  position: relative; box-shadow: 0 50px 100px rgba(0,0,0,0.8);
`;

const ProgressBar = styled.div`
  width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-top: 12px; overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%; width: ${props => props.$percent}%; background: linear-gradient(90deg, #3ea6ff, #00ff88); border-radius: 10px;
  transition: width 1s ease-out;
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
  background: ${props => props.bg || 'rgba(62, 166, 255, 0.08)'}; color: ${props => props.color || '#3ea6ff'};
  padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.05);
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
    Promise.all([
      api.get("/referrals/my-network"),
      api.get("/referrals/stats/width")
    ]).then(([netRes, statRes]) => {
      setNetwork(netRes.data || []);
      setStats(statRes.data || { total_packages: 0, breakdown: [] });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
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

  // 🟢 Professional Filter: Only show packages that have at least 1 booking
  const activeBreakdown = useMemo(() => {
    return stats.breakdown?.filter(pkg => pkg.seat_count > 0) || [];
  }, [stats.breakdown]);

  return (
    <div style={{ paddingBottom: '50px' }}>
      <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: 700 }}>
        <BarChart3 size={22} color="#3ea6ff" /> Direct Width Performance
      </h3>
      
      <GlobalStatsRow>
        <StatMiniCard>
          <div className="icon-box"><Users size={22}/></div>
          <div><div className="label">Direct Partners</div><div className="val">{network.filter(u => u.level === 1).length} <span style={{fontSize: 14, color: '#666'}}>Total</span></div></div>
        </StatMiniCard>

        <StatMiniCard clickable onClick={() => setShowBreakdown(true)}>
          <div className="icon-box"><Layers size={22}/></div>
          <div>
            <div className="label">Active Package Width</div>
            <div className="val">{stats.total_packages || 0} Seats <ArrowRight size={16} style={{marginLeft: 4, color: '#3ea6ff'}}/></div>
          </div>
        </StatMiniCard>

        <StatMiniCard>
          <div className="icon-box"><Target size={22}/></div>
          <div><div className="label">Next Milestone</div><div className="val">18% <span style={{fontSize: 14, color: '#666'}}>Max Cap</span></div></div>
        </StatMiniCard>
      </GlobalStatsRow>

      {/* 🟢 MODAL 1: TOTAL PACKAGE BREAKDOWN (Only show BOOKED seats) */}
      <AnimatePresence>
        {showBreakdown && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBreakdown(false)}>
            <Modal onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <button onClick={() => setShowBreakdown(false)} style={{ position: 'absolute', top: 25, right: 25, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#666', borderRadius: '50%', padding: 6, cursor: 'pointer' }}><X size={18}/></button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 25 }}>
                <div style={{ padding: 10, background: 'rgba(62,166,255,0.1)', borderRadius: 12 }}><Package color="#3ea6ff" size={20}/></div>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: 18 }}>Portfolio Performance</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Active bookings across your direct line</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeBreakdown.length > 0 ? activeBreakdown.map(pkg => (
                  <div key={pkg.package_id} style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.04)', padding: 20, borderRadius: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>{pkg.package_name}</span>
                      <span style={{ color: '#00ff88', fontWeight: 800, fontSize: 16 }}>{pkg.seat_count} <span style={{fontSize: 10, color: '#666'}}>SOLD</span></span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15, fontSize: '11px' }}>
                      <span style={{ color: '#888' }}>Current Yield: <b style={{color: '#3ea6ff'}}>{getCommissionRate(pkg.seat_count)}</b></span>
                      <span style={{ color: '#555', fontWeight: 600 }}>{pkg.seat_count}/8 Max</span>
                    </div>
                    <ProgressBar><ProgressFill $percent={Math.min((pkg.seat_count/8)*100, 100)} /></ProgressBar>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.05)' }}>
                    <Layers size={30} color="#333" style={{ marginBottom: 12 }}/>
                    <p style={{ color: '#666', fontSize: 13, margin: 0 }}>No direct sales data detected yet.</p>
                  </div>
                )}
              </div>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>

      <Card initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
             <div style={{ position: 'relative' }}>
               <Search style={{ position: 'absolute', left: '14px', top: '13px', color: '#555' }} size={18}/>
               <input 
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 12px 12px 45px', borderRadius: '16px', color: '#fff', outline: 'none', width: '280px', fontSize: 14 }}
                 placeholder="Search team member..."
                 onChange={e => setSearchTerm(e.target.value)}
               />
             </div>
             <select 
               style={{ background: '#0a0a0c', color: '#fff', border: '1px solid #222', padding: '10px 20px', borderRadius: '16px', cursor:'pointer', fontSize: 13 }}
               value={levelFilter}
               onChange={e => setLevelFilter(e.target.value)}
             >
               <option value="all">All Levels</option>
               {[1,2,3,4,5,6].map(l => <option key={l} value={l}> Level {l}</option>)}
             </select>
          </div>
          <button style={{ background: 'rgba(62, 166, 255, 0.05)', border: '1px solid rgba(62, 166, 255, 0.1)', color: '#3ea6ff', padding: '12px 24px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: 13 }}>
            <FileSpreadsheet size={18}/> Export Team Data
          </button>
        </div>

        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>SL</th><th>Partner Identity</th><th>System ID</th><th>Depth</th><th>Accumulated Bonus</th><th>Joined</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '80px', color: '#444' }}>Syncing with secure network...</td></tr>
              ) : currentData.length > 0 ? currentData.map((u, i) => (
                <tr key={u.id}>
                  <td>{((currentPage - 1) * itemsPerPage) + i + 1}</td>
                  <td><div style={{ fontWeight: '700', color: '#fff', fontSize: 15 }}>{u.name}</div></td>
                  <td><code style={{ color: '#3ea6ff', background: 'rgba(62,166,255,0.05)', padding: '4px 8px', borderRadius: 6 }}>#{u.id}</code></td>
                  <td><Badge color={u.level === 1 ? "#00ff88" : "#888"} bg={u.level === 1 ? "rgba(0,255,136,0.05)" : "transparent"}>Level-{u.level}</Badge></td>
                  <td><div style={{ fontWeight: '800', color: '#fff', fontSize: 16 }}>${Number(u.total_bonus || 0).toFixed(2)}</div></td>
                  <td style={{ fontSize: '13px', color: '#555' }}>{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <button onClick={() => fetchMemberDetails(u)} style={{ background: 'rgba(62,166,255,0.08)', border: '1px solid rgba(62,166,255,0.15)', color: '#3ea6ff', padding: '8px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      Audit <ArrowRight size={14}/>
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="7" style={{ textAlign: 'center', padding: '80px', color: '#444' }}>No partners found matching your filters.</td></tr>}
            </tbody>
          </StyledTable>
        </TableContainer>
      </Card>

      {/* 🟢 MODAL 2: INDIVIDUAL MEMBER AUDIT */}
      <AnimatePresence>
        {selectedMember && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMember(null)}>
            <Modal onClick={e => e.stopPropagation()} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: 25, right: 25, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', padding: 6, cursor: 'pointer' }}><X size={18}/></button>
              
              <div style={{textAlign: 'center', marginBottom: 25}}>
                <div style={{width: 75, height: 75, background: 'linear-gradient(135deg, rgba(62,166,255,0.15), rgba(0,255,136,0.15))', borderRadius: 24, display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 15px auto', border: '1px solid rgba(255,255,255,0.05)', justifyContent: 'center'}}><ShieldCheck size={38} color="#3ea6ff" /></div>
                <h2 style={{margin: 0, fontSize: 24, color: '#fff'}}>{selectedMember.name}</h2>
                <span style={{ fontSize: 12, color: '#555', marginTop: 4, display: 'block' }}>Ref ID: {selectedMember.id}</span>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20, background: 'rgba(255,255,255,0.02)', padding: '14px 20px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)'}}>
                <span style={{color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8}}><Target size={14}/> Network Position</span>
                <span style={{color: '#fff', fontWeight: 700, fontSize: 13}}>Level {selectedMember.relationshipDepth || selectedMember.level}</span>
              </div>

              <div style={{background: 'rgba(255,255,255,0.01)', padding: 20, borderRadius: 28, border: '1px solid rgba(255,255,255,0.04)'}}>
                <label style={{fontSize: 11, color: '#444', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: 18, letterSpacing: 1}}>Revenue Source Analysis</label>
                <div style={{maxHeight: 300, overflowY: 'auto', paddingRight: 8}}>
                  {memberPackages.length > 0 ? memberPackages.map((p, idx) => (
                    <div key={idx} style={{background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 20, marginBottom: 14, border: '1px solid rgba(255,255,255,0.03)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 10}}><Package size={16} color="#3ea6ff" /><span style={{fontSize: 15, fontWeight: 700, color: '#fff'}}>{p.package_name}</span></div>
                        <span style={{color: '#00ff88', fontWeight: 800, fontSize: 16}}>+${Number(p.commission_earned || 0).toFixed(2)}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 12}}>
                        <span>Price: ${p.ticket_price}</span><span>{new Date(p.booked_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#3ea6ff', fontWeight: 700, background: 'rgba(62,166,255,0.06)', padding: '5px 10px', borderRadius: 8, width: 'fit-content'}}>
                        <Zap size={10}/> {p.referral_type?.replace(/_/g, ' ') || 'Bonus Entry'}
                      </div>
                    </div>
                  )) : <p style={{color: '#444', fontSize: 13, textAlign: 'center', padding: '20px 0'}}>No commission events found for this ID.</p>}
                </div>
              </div>

              <div style={{background: 'rgba(62,166,255,0.05)', marginTop: 15, padding: '15px 20px', borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{ fontSize: 13, color: '#aaa' }}>Total Earned</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>${Number(selectedMember.total_bonus || 0).toFixed(2)}</span>
              </div>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>

      {/* INVITE BOX */}
      <div style={{ background: 'linear-gradient(90deg, rgba(62, 166, 255, 0.05) 0%, rgba(0, 255, 136, 0.03) 100%)', padding: '35px', borderRadius: '32px', border: '1px dashed rgba(62, 166, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '25px', flexWrap: 'wrap', marginTop: 30 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ background: '#3ea6ff', padding: '16px', borderRadius: '20px', color: '#fff', boxShadow: '0 15px 30px rgba(62, 166, 255, 0.2)' }}><Share2 size={30}/></div>
          <div><h3 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: 20 }}>Expand Your Network</h3><p style={{ color: '#666', fontSize: '14px', margin: 0, maxWidth: 400 }}>Every specific package sold to a direct partner increases your permanent commission rate for that tier.</p></div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '320px' }}>
          <div style={{ flex: 1, background: '#000', border: '1px solid #222', padding: '16px', borderRadius: '18px', color: '#3ea6ff', fontSize: '14px', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{inviteLink}</div>
          <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Invite Link Copied!"); }} style={{ background: '#3ea6ff', border: 'none', color: '#fff', padding: '0 30px', borderRadius: '18px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }}>Copy</button>
        </div>
      </div>
    </div>
  );
}