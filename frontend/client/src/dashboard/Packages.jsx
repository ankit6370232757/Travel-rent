import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, Mountain, Wind, Flame, Rocket, 
  X, Calendar, TrendingUp
} from "lucide-react";
import api from "../api/axios";

// --- CONFIGURATION ---
const PACKAGES = ["WATER", "EARTH", "AIR", "FIRE", "SPACE"];

const PACKAGE_STYLES = {
  WATER: { color: "#00d2ff", gradient: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)", icon: <Droplets size={24} /> },
  EARTH: { color: "#00b09b", gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)", icon: <Mountain size={24} /> },
  AIR:   { color: "#d4fc79", gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", icon: <Wind size={24} /> },
  FIRE:  { color: "#ff512f", gradient: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)", icon: <Flame size={24} /> },
  SPACE: { color: "#8E2DE2", gradient: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)", icon: <Rocket size={24} /> },
};

// --- STYLED COMPONENTS ---
const Container = styled.div`width: 100%;`;
const Header = styled.div`
  margin-bottom: 25px;
  h2 { font-size: 24px; margin: 0; color: ${({ theme }) => theme.text}; }
  p { color: ${({ theme }) => theme.textSoft}; font-size: 14px; margin-top: 5px; }
`;
const Grid = styled(motion.div)`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
`;
const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px;
  cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;
  transition: all 0.3s ease;
  &:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); border-color: rgba(255, 255, 255, 0.2); }
`;
const IconWrapper = styled.div`
  width: 50px; height: 50px; border-radius: 12px;
  background: ${props => props.$gradient}; display: flex; align-items: center; justify-content: center;
  color: white; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
`;
const Title = styled.h3`font-size: 20px; font-weight: 700; margin: 0; color: ${({ theme }) => theme.text};`;

// NEW: Price Tag Style
const PriceTag = styled.div`
  font-size: 18px; font-weight: 600; color: ${({ theme }) => theme.accent || "#3ea6ff"}; 
  margin-top: 5px;
`;

const ProgressBar = styled.div`width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin-top: 15px;`;
const ProgressFill = styled.div`height: 100%; width: ${props => props.width}%; background: ${props => props.gradient};`;

// --- MODAL STYLES ---
const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;
const Modal = styled(motion.div)`
  background: #121212; border: 1px solid rgba(255,255,255,0.1);
  width: 100%; max-width: 450px; border-radius: 24px; padding: 30px;
  position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
`;
const CloseButton = styled.button`position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: #fff; cursor: pointer;`;
const StatGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 20px 0;`;
const StatBox = styled.div`
  background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  span { font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 5px; }
  strong { font-size: 14px; color: #fff; }
`;
const ActionButton = styled.button`
  width: 100%; padding: 16px; border-radius: 12px; border: none;
  background: ${props => props.$gradient}; color: #fff; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function Packages() {
  const [status, setStatus] = useState({});
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    PACKAGES.forEach(async (pkg) => {
      try {
        const res = await api.get(`/seats/status/${pkg}`);
        setStatus(prev => ({ ...prev, [pkg]: res.data }));
      } catch (err) { console.error("Failed to load status", pkg); }
    });
  }, []);

  // Calculate Potential Bonus for the User
  const calculateNextSeatInfo = (pkgData) => {
    if (!pkgData) return { seat: 1, batch: 1, bonus: 0 };
    
    // Use dynamic batch size (default 180)
    const BATCH_SIZE = pkgData.batchSize || 180; 
    const totalSold = pkgData.filledSeats || 0;
    
    // Calculate NEXT seat info
    const nextBatch = Math.floor(totalSold / BATCH_SIZE) + 1;
    const nextSeatInBatch = (totalSold % BATCH_SIZE) + 1;
    const price = parseFloat(pkgData.ticket_price || 0);
    
    // Bonus Formula: (Price * 6%) / SeatNumber
    const bonus = (price * 0.06) / nextSeatInBatch;

    return { seat: nextSeatInBatch, batch: nextBatch, bonus: bonus.toFixed(4) };
  };

  const book = async () => {
    if(!selectedPkg) return;
    if(!window.confirm(`Confirm purchase of ${selectedPkg.name} for $${selectedPkg.ticket_price}?`)) return;
    setLoading(true);
    try {
      await api.post("/booking/book-seat", { packageName: selectedPkg.name });
      alert("✅ Investment Successful! Seat booked & Instant Bonus credited.");
      window.location.reload(); 
    } catch (err) {
      alert(`Booking Failed: ${err.response?.data?.message || "Error"}`);
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header><h2>Investment Packages</h2><p>Click a package to see income details and book.</p></Header>
      
      <Grid initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        {PACKAGES.map(pkg => {
          const data = status[pkg];
          const style = PACKAGE_STYLES[pkg] || PACKAGE_STYLES.WATER;
          
          // Dynamic Batch Progress
          const batchSize = data ? data.batchSize : 180;
          const seatsInBatch = data ? data.seatsInCurrentBatch : 0;
          const percent = Math.min((seatsInBatch / batchSize) * 100, 100);

          return (
            <Card key={pkg} layoutId={`card-${pkg}`} onClick={() => data && setSelectedPkg({ ...data, style, percent })}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <IconWrapper $gradient={style.gradient}>{style.icon}</IconWrapper>
                {data?.currentBatch && <span style={{fontSize:'12px', background:'rgba(255,255,255,0.1)', padding:'4px 8px', borderRadius:'8px', height:'fit-content'}}>Batch {data.currentBatch}</span>}
              </div>
              
              <Title>{pkg}</Title>
              {/* PRICE DISPLAY */}
              <PriceTag>${data?.ticket_price || "..."}</PriceTag>

              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                  <span>Filled ({seatsInBatch}/{batchSize})</span>
                  <span>{Math.round(percent)}%</span>
                </div>
                <ProgressBar><ProgressFill width={percent} gradient={style.gradient} /></ProgressBar>
              </div>
            </Card>
          );
        })}
      </Grid>

      {/* --- DETAIL POPUP (MODAL) --- */}
      <AnimatePresence>
        {selectedPkg && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPkg(null)}>
            <Modal layoutId={`card-${selectedPkg.name}`} onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setSelectedPkg(null)}><X size={20}/></CloseButton>
              
              {/* Header Info */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <IconWrapper $gradient={selectedPkg.style.gradient} style={{ margin: '0 auto 15px auto' }}>{selectedPkg.style.icon}</IconWrapper>
                <h2 style={{ margin: 0, fontSize: '28px' }}>{selectedPkg.name}</h2>
                <h3 style={{ color: '#fff', fontSize: '32px', margin: '5px 0' }}>${selectedPkg.ticket_price}</h3>
                <p style={{ color: '#888', margin: 0 }}>Entry Fee</p>
              </div>
              
              {/* LIVE PREVIEW BOX */}
              {(() => {
                 const info = calculateNextSeatInfo(selectedPkg);
                 return (
                   <div style={{ background: 'rgba(62, 166, 255, 0.1)', border: '1px solid rgba(62, 166, 255, 0.3)', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                     <div style={{ color: '#3ea6ff', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>⚡ IF YOU JOIN NOW:</div>
                     <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <div><span style={{ fontSize: '11px', color: '#aaa' }}>YOUR BATCH</span><br/><strong style={{ fontSize: '16px' }}>#{info.batch}</strong></div>
                        <div><span style={{ fontSize: '11px', color: '#aaa' }}>YOUR SEAT</span><br/><strong style={{ fontSize: '16px' }}>#{info.seat}</strong></div>
                        <div><span style={{ fontSize: '11px', color: '#2ecc71' }}>INSTANT BONUS</span><br/><strong style={{ fontSize: '16px', color: '#2ecc71' }}>${info.bonus}</strong></div>
                     </div>
                   </div>
                 );
              })()}

              <div style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Potential Income</div>
              
              {/* INCOME BREAKDOWN GRID */}
              <StatGrid>
                <StatBox>
                    <Calendar size={18} color="#3ea6ff"/><br/>
                    <span>Daily</span>
                    <strong>${selectedPkg.daily_income}</strong>
                </StatBox>
                <StatBox>
                    <Calendar size={18} color="#2ecc71"/><br/>
                    <span>Monthly</span>
                    <strong>${selectedPkg.monthly_income}</strong>
                </StatBox>
                <StatBox>
                    <TrendingUp size={18} color="#f1c40f"/><br/>
                    <span>Yearly</span>
                    <strong>${selectedPkg.yearly_income}</strong>
                </StatBox>
              </StatGrid>

              <ActionButton $gradient={selectedPkg.style.gradient} onClick={book} disabled={loading}>
                {loading ? "Processing..." : "Invest Now"}
              </ActionButton>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>
    </Container>
  );
}