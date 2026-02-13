import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, Mountain, Wind, Flame, Rocket, Zap, 
  X, Calendar, TrendingUp, CheckCircle
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast"; 
import Confetti from "react-confetti"; // 👈 1. IMPORT CONFETTI

// --- CONFIGURATION ---
const PACKAGES = ["WATER", "EARTH", "AIR", "FIRE", "SPACE", "X1"];

const PACKAGE_STYLES = {
  WATER: { color: "#00d2ff", gradient: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)", icon: <Droplets size={24} /> },
  EARTH: { color: "#00b09b", gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)", icon: <Mountain size={24} /> },
  AIR:   { color: "#d4fc79", gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", icon: <Wind size={24} /> },
  FIRE:  { color: "#ff512f", gradient: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)", icon: <Flame size={24} /> },
  SPACE: { color: "#8E2DE2", gradient: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)", icon: <Rocket size={24} /> },
  X1:    { color: "#FFD700", gradient: "linear-gradient(135deg, #FFD700 0%, #FDB931 100%)", icon: <Zap size={24} /> },
};

// --- STYLED COMPONENTS ---
const Container = styled.div`width: 100%;`;
const Header = styled.div`
  margin-bottom: 25px;
  h2 { font-size: 24px; margin: 0; color: #fff; }
  p { color: #888; font-size: 14px; margin-top: 5px; }
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
const Title = styled.h3`font-size: 20px; font-weight: 700; margin: 0; color: #fff;`;

const PriceTag = styled.div`
  font-size: 18px; font-weight: 600; color: #3ea6ff; margin-top: 5px;
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

const StatGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 15px 0 25px 0;`;

const StatBox = styled.div`
  background: ${props => props.$selected ? "rgba(62, 166, 255, 0.15)" : "rgba(255,255,255,0.05)"}; 
  border: 2px solid ${props => props.$selected ? "#3ea6ff" : "transparent"};
  padding: 12px; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  cursor: pointer; transition: all 0.2s;
  position: relative;

  &:hover {
    background: rgba(255,255,255,0.1);
  }

  span { font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 5px; }
  strong { font-size: 14px; color: #fff; }
`;

const SelectionLabel = styled.div`
  font-size: 13px; color: #aaa; text-align: center; margin-bottom: 10px; letter-spacing: 0.5px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
`;

const ActionButton = styled.button`
  width: 100%; padding: 16px; border-radius: 12px; border: none;
  background: ${props => props.$gradient}; color: #fff; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  transition: opacity 0.2s;
`;

export default function Packages() {
  const [status, setStatus] = useState({});
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [incomeType, setIncomeType] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // 👈 2. ADD STATE

  useEffect(() => {
    PACKAGES.forEach(async (pkg) => {
      try {
        const res = await api.get(`/seats/status/${pkg}`);
        setStatus(prev => ({ ...prev, [pkg]: res.data }));
      } catch (err) { console.error("Failed to load status", pkg); }
    });
  }, []);

  useEffect(() => {
    if (selectedPkg) setIncomeType(null);
  }, [selectedPkg]);

  const calculateNextSeatInfo = (pkgData) => {
    if (!pkgData) return { seat: 1, batch: 1, bonus: 0 };
    const BATCH_SIZE = pkgData.batchSize || 180; 
    const totalSold = pkgData.filledSeats || 0;
    const nextBatch = Math.floor(totalSold / BATCH_SIZE) + 1;
    const nextSeatInBatch = (totalSold % BATCH_SIZE) + 1;
    const price = parseFloat(pkgData.ticket_price || 0);
    const bonus = (price * 0.06) / nextSeatInBatch;
    return { seat: nextSeatInBatch, batch: nextBatch, bonus: bonus.toFixed(4) };
  };

  const book = async () => {
    if(!selectedPkg) return;
    
    if (!incomeType) {
      toast.error("Please select an Income Plan (Daily, Monthly, or Yearly)");
      return;
    }

    if(!window.confirm(`Invest $${selectedPkg.ticket_price} in ${selectedPkg.name} with ${incomeType} payout?`)) return;
    
    setLoading(true);
    const loadingToast = toast.loading("Processing investment...");

    try {
      await api.post("/booking/book-seat", { 
        packageName: selectedPkg.name,
        incomeType: incomeType 
      });
      
      // ✅ 3. TRIGGER CONFETTI ON SUCCESS
      setShowConfetti(true);
      toast.success("Investment Successful! Bonus Credited.", { id: loadingToast });
      
      setLoading(false);
      setSelectedPkg(null);
      
      // Reload logic kept same (1.5s)
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (err) {
      const msg = err.response?.data?.message || "Booking Failed";
      toast.error(msg, { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* 4. RENDER CONFETTI (FULL SCREEN) */}
      {showConfetti && <Confetti numberOfPieces={500} gravity={0.3} style={{zIndex: 9999}} />}

      <Header><h2>Investment Packages</h2><p>Select a package and choose your income plan.</p></Header>
      
      <Grid initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        {PACKAGES.map(pkg => {
          const data = status[pkg];
          const style = PACKAGE_STYLES[pkg] || PACKAGE_STYLES.WATER; 
          
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

      <AnimatePresence>
        {selectedPkg && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPkg(null)}>
            <Modal layoutId={`card-${selectedPkg.name}`} onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setSelectedPkg(null)}><X size={20}/></CloseButton>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <IconWrapper $gradient={selectedPkg.style.gradient} style={{ margin: '0 auto 15px auto' }}>{selectedPkg.style.icon}</IconWrapper>
                <h2 style={{ margin: 0, fontSize: '28px' }}>{selectedPkg.name}</h2>
                <h3 style={{ color: '#fff', fontSize: '32px', margin: '5px 0' }}>${selectedPkg.ticket_price}</h3>
                <p style={{ color: '#888', margin: 0 }}>Entry Fee</p>
              </div>
              
              {(() => {
                 const info = calculateNextSeatInfo(selectedPkg);
                 return (
                   <div style={{ background: 'rgba(62, 166, 255, 0.1)', border: '1px solid rgba(62, 166, 255, 0.3)', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                     <div style={{ color: '#3ea6ff', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>⚡ IF YOU JOIN NOW:</div>
                     <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                       <div><span style={{ fontSize: '11px', color: '#aaa' }}>SLOT</span><br/><strong style={{ fontSize: '16px' }}>#{info.batch}</strong></div>
                       <div><span style={{ fontSize: '11px', color: '#aaa' }}>SEAT</span><br/><strong style={{ fontSize: '16px' }}>#{info.seat}</strong></div>
                       <div><span style={{ fontSize: '11px', color: '#2ecc71' }}>BONUS</span><br/><strong style={{ fontSize: '16px', color: '#2ecc71' }}>${info.bonus}</strong></div>
                     </div>
                   </div>
                 );
              })()}

              <SelectionLabel>
                {incomeType ? <CheckCircle size={14} color="#2ecc71" /> : <TrendingUp size={14} />}
                {incomeType ? "Plan Selected:" : "Choose Your Income Plan"}
              </SelectionLabel>
              
              <StatGrid>
                <StatBox 
                  $selected={incomeType === "DAILY"} 
                  onClick={() => setIncomeType("DAILY")}
                >
                    <Calendar size={18} color={incomeType === "DAILY" ? "#fff" : "#3ea6ff"}/>
                    <br/>
                    <span>Daily</span>
                    <strong>${selectedPkg.daily_income}</strong>
                </StatBox>
                <StatBox 
                  $selected={incomeType === "MONTHLY"} 
                  onClick={() => setIncomeType("MONTHLY")}
                >
                    <Calendar size={18} color={incomeType === "MONTHLY" ? "#fff" : "#2ecc71"}/>
                    <br/>
                    <span>Monthly</span>
                    <strong>${selectedPkg.monthly_income}</strong>
                </StatBox>
                <StatBox 
                  $selected={incomeType === "YEARLY"} 
                  onClick={() => setIncomeType("YEARLY")}
                >
                    <TrendingUp size={18} color={incomeType === "YEARLY" ? "#fff" : "#f1c40f"}/>
                    <br/>
                    <span>Yearly</span>
                    <strong>${selectedPkg.yearly_income}</strong>
                </StatBox>
              </StatGrid>

              <ActionButton 
                $gradient={selectedPkg.style.gradient} 
                onClick={book} 
                disabled={loading || !incomeType} 
              >
                {loading ? "Processing..." : (incomeType ? `Invest with ${incomeType} Plan` : "Select a Plan to Invest")}
              </ActionButton>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>
    </Container>
  );
}