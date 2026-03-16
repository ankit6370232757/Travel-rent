import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Network, User, Layers, 
  Search, FileSpreadsheet, Copy, Share2, 
  DollarSign, TrendingUp, Award,
  ChevronLeft, ChevronRight, Zap,
  X, Info, CheckCircle, ShieldCheck, Package, ArrowRight, Target, Calendar
} from "lucide-react";
import api from "../api/axios";
import * as XLSX from "xlsx"; 
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%);
  backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px; padding: 30px; margin-bottom: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
`;

const TierGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const TierCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 22px;
  transition: 0.3s;
  &:hover { border-color: rgba(62, 166, 255, 0.3); background: rgba(255, 255, 255, 0.05); }
  .header { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center; }
  .label { font-size: 13px; color: #3ea6ff; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .value { font-size: 28px; font-weight: 800; color: #fff; display: flex; align-items: baseline; gap: 8px; }
`;

const ProgressBar = styled.div`
  width: 100%; height: 8px; background: rgba(255,255,255,0.05); 
  border-radius: 10px; margin: 15px 0 10px 0; overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%; width: ${props => props.$percent}%; 
  background: linear-gradient(90deg, #3ea6ff, #2ecc71);
  border-radius: 10px; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  const [packageStats, setPackageStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberPackages, setMemberPackages] = useState([]);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const inviteLink = `${window.location.origin}/register?ref=${user.referralCode || 'USER'}`;

  useEffect(() => {
    api.get("/referrals/my-network")
      .then(res => { setNetwork(res.data || []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });

    api.get("/referral/stats/width")
      .then(res => { setPackageStats(res.data || []); })
      .catch(err => console.error("Stats error", err));
  }, []);

  const fetchMemberDetails = async (member) => {
    setSelectedMember(member);
    try {
      const res = await api.get(`/referrals/member-packages/${member.id}`);
      setMemberPackages(res.data.packages || []);
      setSelectedMember(prev => ({ ...prev, relationshipDepth: res.data.depth }));
    } catch (err) {
      setMemberPackages([]);
      toast.error("Access denied or member not found");
    }
  };

  const filteredNetwork = useMemo(() => {
    return network.filter(u => {
      const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.id?.toString().includes(searchTerm);
      const matchLevel = levelFilter === "all" || u.level?.toString() === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [network, searchTerm, levelFilter]);

  const currentData = filteredNetwork.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getCommissionRate = (count, isX1) => {
    if (count <= 2) return "11%";
    if (count <= 5) return "13%";
    if (count <= 8) return "15%";
    return isX1 ? "18%" : "17%";
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      
      {/* 📊 PACKAGE WIDTH TRACKER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={22} color="#3ea6ff" /> Referral Width Progression
        </h3>
        <Badge color="#aaa"><Info size={14} style={{marginRight:5}}/> Rates are isolated per package</Badge>
      </div>

      <TierGrid>
        {packageStats.map(pkg => {
          const count = parseInt(pkg.referral_count || 0);
          const percent = Math.min((count / 9) * 100, 100);
          const isX1 = pkg.package_name === 'X1';
          return (
            <TierCard key={pkg.package_id}>
              <div className="header">
                <span className="label">{pkg.package_name}</span>
                <Badge color={count >= 9 ? "#FFD700" : "#2ecc71"}>
                  {getCommissionRate(count, isX1)} Payout
                </Badge>
              </div>
              <div className="value">{count} <span style={{fontSize:'14px', color:'#666', fontWeight:500}}>Referrals</span></div>
              <ProgressBar><ProgressFill $percent={percent} /></ProgressBar>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#555', fontWeight: 600}}>
                <span>Lvl {count > 9 ? 9 : count} Status</span>
                <span style={{color: count < 9 ? '#3ea6ff' : '#2ecc71'}}>
                  {count < 9 ? `Next: ${getCommissionRate(count + 1, isX1)}` : 'MAX REACHED'}
                </span>
              </div>
            </TierCard>
          );
        })}
      </TierGrid>

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
                <th>SL</th>
                <th>Member Identity</th>
                <th>System ID</th>
                <th>Depth Level</th>
                <th>Accumulated Commission</th>
                <th>Joining Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Fetching secure network data...</td></tr>
              ) : currentData.map((u, i) => (
                <tr key={u.id}>
                  <td>{((currentPage - 1) * itemsPerPage) + i + 1}</td>
                  <td><div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{u.name}</div></td>
                  <td><code style={{ color: '#3ea6ff', letterSpacing: '1px' }}>#{u.id}</code></td>
                  <td><Badge color="#2ecc71">Level {u.level}</Badge></td>
                  <td><div style={{ color: '#fff', fontWeight: '800', fontSize: '16px' }}>${Number(u.total_bonus || 0).toFixed(2)}</div></td>
                  <td style={{ fontSize: '13px', color: '#666' }}>{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                  <td>
                    <button 
                      onClick={() => fetchMemberDetails(u)}
                      style={{ background: 'rgba(62,166,255,0.1)', border: '1px solid rgba(62,166,255,0.2)', color: '#3ea6ff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      Analyze <ArrowRight size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>
      </Card>

      {/* 🟢 ADVANCED EARNING BREAKDOWN MODAL */}
      <AnimatePresence>
        {selectedMember && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMember(null)}>
            <Modal onClick={e => e.stopPropagation()} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%', cursor: 'pointer' }}><X size={18}/></button>
              
              <div style={{textAlign: 'center', marginBottom: '25px'}}>
                <div style={{width: '70px', height: '70px', background: 'linear-gradient(135deg, rgba(62,166,255,0.2), rgba(46,204,113,0.2))', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto', border: '1px solid rgba(255,255,255,0.1)'}}>
                  <ShieldCheck size={35} color="#3ea6ff" />
                </div>
                <h2 style={{margin: '0 0 5px 0', fontSize: '24px'}}>{selectedMember.name}</h2>
                <Badge color="#888">UID: {selectedMember.id}</Badge>
              </div>

              {/* 🟢 NETWORK POSITION DISPLAY */}
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)'}}>
                <span style={{color: '#888', display: 'flex', alignItems: 'center', gap: '8px'}}><Target size={14}/> Network Position</span>
                <span style={{color: '#fff', fontWeight: 700}}>Level {selectedMember.relationshipDepth || selectedMember.level} Member</span>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <div style={{background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)'}}>
                  <label style={{fontSize: '11px', color: '#555', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '15px'}}>Detailed Earning Events</label>
                  
                  <div style={{maxHeight: '280px', overflowY: 'auto', paddingRight: '10px'}}>
                    {memberPackages.length > 0 ? memberPackages.map((p, idx) => (
                      <div key={idx} style={{background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '16px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.03)'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <Package size={14} color="#3ea6ff" />
                            <span style={{fontSize: '14px', fontWeight: 700, color: '#fff'}}>{p.package_name} Package</span>
                          </div>
                          <span style={{color: '#2ecc71', fontWeight: 800, fontSize: '14px'}}>+ ${Number(p.commission_earned || 0).toFixed(2)}</span>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', marginBottom: '10px'}}>
                          <span style={{display: 'flex', alignItems: 'center', gap: 4}}><DollarSign size={10}/> Purchase: ${p.ticket_price}</span>
                          <span style={{display: 'flex', alignItems: 'center', gap: 4}}><Calendar size={10}/> {new Date(p.booked_at).toLocaleDateString('en-GB')}</span>
                        </div>

                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#3ea6ff', fontWeight: 600, background: 'rgba(62,166,255,0.05)', padding: '4px 8px', borderRadius: '6px', width: 'fit-content'}}>
                          <Zap size={10}/> {p.referral_type?.replace(/_/g, ' ') || 'Bonus'}
                        </div>
                      </div>
                    )) : <p style={{color: '#444', fontSize: '13px', textAlign: 'center'}}>No active package earnings yet.</p>}
                  </div>
                </div>

                <div style={{background: 'linear-gradient(90deg, rgba(62, 166, 255, 0.1), rgba(46, 204, 113, 0.1))', padding: '20px', borderRadius: '24px', border: '1px solid rgba(62, 166, 255, 0.2)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: '#aaa', fontSize: '14px'}}>Total Earned from Member</span>
                    <span style={{color: '#fff', fontSize: '22px', fontWeight: 900}}>${Number(selectedMember.total_bonus || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div style={{marginTop: '25px', display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255, 193, 7, 0.05)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255, 193, 7, 0.1)'}}>
                 <Info size={16} color="#ffc107" style={{marginTop: 2}}/>
                 <p style={{fontSize: '11px', color: '#aaa', margin: 0, lineHeight: 1.5}}>
                   Commission rates are based on your <strong>{selectedMember.relationshipDepth === 1 ? 'Width Tier' : 'Network Depth'}</strong> logic. Width tiers increase earnings up to 18% based on directs per package.
                 </p>
              </div>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>

      {/* INVITE BOX */}
      <div style={{ background: 'rgba(62, 166, 255, 0.05)', padding: '30px', borderRadius: '28px', border: '1px dashed rgba(62, 166, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '25px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: '#3ea6ff', padding: '15px', borderRadius: '18px', color: '#fff', boxShadow: '0 10px 20px rgba(62, 166, 255, 0.3)' }}><Share2 size={28}/></div>
          <div>
            <h3 style={{ color: '#fff', margin: '0 0 5px 0' }}>Build Your Empire</h3>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Strategic width building increases your direct percentage to 18%.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '320px' }}>
          <div style={{ flex: 1, background: '#000', border: '1px solid #222', padding: '14px', borderRadius: '14px', color: '#3ea6ff', fontSize: '13px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>{inviteLink}</div>
          <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Link Secured!"); }} style={{ background: '#3ea6ff', border: 'none', color: '#fff', padding: '0 25px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}><Copy size={18}/> Copy</button>
        </div>
      </div>
    </div>
  );
}