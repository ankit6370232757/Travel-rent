import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, Mountain, Wind, Flame, Rocket, Zap, 
  X, Calendar, TrendingUp, CheckCircle, Info, ShieldCheck 
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast"; 
import Confetti from "react-confetti";

// --- CONFIGURATION ---
const PACKAGES = ["WATER", "EARTH", "AIR", "FIRE", "SPACE", "X1"];

const PACKAGE_STYLES = {
  WATER: { 
    color: "#00d2ff", 
    gradient: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)", 
    shadow: "rgba(0, 210, 255, 0.4)", 
    icon: <Droplets size={28} />,
    description: "Ideal for beginners starting their steady growth journey." 
  },
  EARTH: { 
    color: "#00b09b", 
    gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)", 
    shadow: "rgba(0, 176, 155, 0.4)", 
    icon: <Mountain size={28} />,
    description: "Grounded assets with stable long-term yields."
  },
  AIR: { 
    color: "#d4fc79", 
    gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", 
    shadow: "rgba(212, 252, 121, 0.4)", 
    icon: <Wind size={28} />,
    description: "Agile performance with high-frequency returns."
  },
  FIRE: { 
    color: "#ff512f", 
    gradient: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)", 
    shadow: "rgba(255, 81, 47, 0.4)", 
    icon: <Flame size={28} />,
    description: "Accelerated growth for aggressive portfolio building."
  },
  SPACE: { 
    color: "#8E2DE2", 
    gradient: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)", 
    shadow: "rgba(142, 45, 226, 0.4)", 
    icon: <Rocket size={28} />,
    description: "Next-gen ventures exploring the future of finance."
  },
  X1: { 
    color: "#FFD700", 
    gradient: "linear-gradient(135deg, #FFD700 0%, #FDB931 100%)", 
    shadow: "rgba(255, 215, 0, 0.4)", 
    icon: <Zap size={28} />,
    description: "Premium Tier for elite institutional-grade returns."
  },
};

// --- STYLED COMPONENTS ---
const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 30px;
  h2 { font-size: 26px; margin: 0; color: #fff; font-weight: 700; letter-spacing: -0.5px; }
  p { color: #888; font-size: 14px; margin-top: 6px; }
`;

const Grid = styled(motion.div)`
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 25px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 25px;
  cursor: pointer;
  display: flex; 
  flex-direction: column; 
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 15px 40px -10px ${props => props.$shadow || 'rgba(0,0,0,0.5)'};
  }

  &::before {
    content: "";
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    transition: 0.5s;
  }
  &:hover::before { left: 100%; }
`;

const CardTop = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
`;

const IconWrapper = styled.div`
  width: 56px; height: 56px; border-radius: 16px;
  background: ${props => props.$gradient}; 
  display: flex; align-items: center; justify-content: center;
  color: white; 
  box-shadow: 0 8px 20px -5px rgba(0,0,0,0.5);
`;

const BatchBadge = styled.span`
  font-size: 11px; font-weight: 700;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 6px 10px; border-radius: 8px;
  color: #ccc;
  letter-spacing: 0.5px;
`;

const Title = styled.h3`
  font-size: 22px; font-weight: 700; margin: 20px 0 5px 0; color: #fff;
`;

const DescriptionText = styled.p`
  color: #888;
  font-size: 13px;
  margin: 5px 0 15px 0;
  line-height: 1.4;
`;

const PriceTag = styled.div`
  font-size: 26px; font-weight: 800; color: transparent;
  background: linear-gradient(90deg, #fff, #aaa);
  -webkit-background-clip: text;
  background-clip: text;
`;

const ProgressSection = styled.div`
  margin-top: 25px;
`;

const ProgressLabel = styled.div`
  display: flex; justify-content: space-between; 
  font-size: 12px; color: #888; margin-bottom: 8px; font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%; height: 6px; 
  background: rgba(255,255,255,0.05); 
  border-radius: 10px; overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%; 
  width: ${props => props.width}%; 
  background: ${props => props.gradient};
  border-radius: 10px;
`;

const SeatCounter = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 8px;
  text-align: right;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Overlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;

const Modal = styled(motion.div)`
  background: #141416; 
  border: 1px solid rgba(255,255,255,0.1);
  width: 100%; max-width: 480px; 
  border-radius: 28px; padding: 40px 30px 30px 30px;
  position: relative; 
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.9);
`;

const CloseButton = styled.button`
  position: absolute; 
  top: 15px; 
  right: 15px; 
  background: rgba(255,255,255,0.08); 
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff; 
  cursor: pointer;
  width: 36px; 
  height: 36px; 
  border-radius: 12px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  transition: all 0.2s;
  z-index: 1001;
  &:hover { background: #ff4d4d; border-color: #ff4d4d; transform: rotate(90deg); }
`;

const StatGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0;
`;

const StatBox = styled.div`
  background: ${props => props.$selected ? "rgba(62, 166, 255, 0.12)" : "rgba(255,255,255,0.03)"}; 
  border: 1px solid ${props => props.$selected ? "#3ea6ff" : "rgba(255,255,255,0.08)"};
  padding: 15px 10px; border-radius: 16px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  cursor: pointer; transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255,255,255,0.08);
    transform: translateY(-3px);
  }

  span { font-size: 11px; color: #888; text-transform: uppercase; margin-top: 8px; font-weight: 600; }
  strong { font-size: 15px; color: #fff; margin-top: 4px; }
`;

const InfoBox = styled.div`
  background: rgba(62, 166, 255, 0.08); 
  border: 1px solid rgba(62, 166, 255, 0.2); 
  padding: 18px; border-radius: 20px; 
  margin-bottom: 25px; text-align: center;
  
  h4 { margin: 0 0 12px 0; font-size: 13px; color: #3ea6ff; display: flex; align-items: center; justify-content: center; gap: 6px; }
  
  .grid {
    display: flex; justify-content: space-around;
    div { display: flex; flex-direction: column; }
    small { font-size: 10px; color: #aaa; text-transform: uppercase; margin-bottom: 2px; }
    b { font-size: 16px; color: #fff; }
  }
`;

const AgreementRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 15px 0;
  cursor: pointer;
  
  
  input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: #2db4dd;
    cursor: pointer;
    color: #38adce;
  }
  
  label {
    font-size: 12px;
    color: #ffffff;
    line-height: 1.4;
    user-select: none;
    cursor: pointer;
    b { color: #e64424; }
  }
`;

const ActionButton = styled.button`
  width: 100%; padding: 18px; border-radius: 16px; border: none;
  background: ${props => props.$gradient}; 
  color: #ffffff; font-weight: 700; font-size: 16px; 
  cursor: pointer; margin-top: 10px;
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5);
  opacity: ${props => props.disabled ? 0.4 : 1};
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  transition: all 0.2s;

  &:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
  &:active:not(:disabled) { transform: translateY(0); }
`;

export default function Packages() {
  const [status, setStatus] = useState({});
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [incomeType, setIncomeType] = useState(null); 
  const [isAgreed, setIsAgreed] = useState(false); // ✅ New state for agreement
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    PACKAGES.forEach(async (pkg) => {
      try {
        const res = await api.get(`/seats/status/${pkg}`);
        setStatus(prev => ({ ...prev, [pkg]: res.data }));
      } catch (err) { console.error("Failed to load status", pkg); }
    });
  }, []);

  useEffect(() => {
    if (selectedPkg) {
      setIncomeType(null);
      setIsAgreed(false); // Reset agreement when opening a new modal
    }
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
    
    if (!isAgreed) {
      toast.error("You must agree to the Terms & Conditions.");
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
      
      setShowConfetti(true);
      toast.success("Investment Successful! Bonus Credited.", { id: loadingToast });
      
      setLoading(false);
      setSelectedPkg(null);
      
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (err) {
      const msg = err.response?.data?.message || "Booking Failed";
      toast.error(msg, { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <Container>
      {showConfetti && <Confetti numberOfPieces={800} gravity={0.2} style={{zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%'}} />}

      <Header>
        <h2>Packages</h2>
        <p>Choose a plan that fits your goals.</p>
      </Header>
      
      <Grid initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        {PACKAGES.map(pkg => {
          const data = status[pkg];
          const style = PACKAGE_STYLES[pkg] || PACKAGE_STYLES.WATER; 
          
          const batchSize = data ? data.batchSize : 180;
          const seatsInBatch = data ? data.seatsInCurrentBatch : 0;
          const percent = Math.min((seatsInBatch / batchSize) * 100, 100);

          const currentMonth = new Date().toLocaleString('en-US', { month: '2-digit' });
          const currentYear = new Date().getFullYear().toString().slice(-2);

          return (
            <Card 
              key={pkg} 
              layoutId={`card-${pkg}`} 
              $shadow={style.shadow}
              onClick={() => data && setSelectedPkg({ ...data, style, percent })}
              whileHover={{ scale: 1.02 }}
            >
              <CardTop>
                <IconWrapper $gradient={style.gradient}>{style.icon}</IconWrapper>
                {data?.currentBatch && <BatchBadge> {`SLOT${currentMonth}${data.currentBatch}${currentYear}`}</BatchBadge>}
              </CardTop>

              <div>
                <Title>{pkg}</Title>
                <DescriptionText>{style.description}</DescriptionText>
                <PriceTag>${data?.ticket_price || "..."}</PriceTag>
                
                <ProgressSection>
                  <ProgressLabel>
                    <span>Availability</span>
                    <span>{Math.round(percent)}% Full</span>
                  </ProgressLabel>
                  <ProgressBar>
                    <ProgressFill 
                      initial={{ width: 0 }} 
                      animate={{ width: `${percent}%` }} 
                      gradient={style.gradient} 
                    />
                  </ProgressBar>
                  <SeatCounter>
                    {seatsInBatch} / {batchSize} Seats Booked
                  </SeatCounter>
                </ProgressSection>
              </div>
            </Card>
          );
        })}
      </Grid>

      <AnimatePresence>
        {selectedPkg && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPkg(null)}>
            <Modal layoutId={`card-${selectedPkg.name}`} onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setSelectedPkg(null)} aria-label="Close modal">
                <X size={20}/>
              </CloseButton>
              
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <IconWrapper $gradient={selectedPkg.style.gradient} style={{ margin: '0 auto 15px auto', width: '75px', height: '75px' }}>
                  {React.cloneElement(selectedPkg.style.icon, { size: 40 })}
                </IconWrapper>
                <h2 style={{ margin: 0, fontSize: '32px', color: '#fff', fontWeight: '800' }}>{selectedPkg.name}</h2>
                <p style={{ color: '#888', fontSize: '14px', marginTop: '12px', lineHeight: '1.6', padding: '0 20px' }}>
                  {selectedPkg.style.description}
                </p>
                <div style={{ fontSize: '42px', fontWeight: '900', marginTop: '15px', color: '#fff', letterSpacing: '-1px' }}>
                  ${selectedPkg.ticket_price}
                </div>
              </div>
              
              {(() => {
                 const info = calculateNextSeatInfo(selectedPkg);
                 return (
                   <InfoBox>
                     <h4><Zap size={14}/> LIVE ONBOARDING BONUS</h4>
                     <div className="grid">
                       <div><small>Your Batch</small><b>#{info.batch}</b></div>
                       <div><small>Seat No</small><b>#{info.seat}</b></div>
                       <div><small style={{color:'#2ecc71'}}>Bonus</small><b style={{color:'#2ecc71'}}>${info.bonus}</b></div>
                     </div>
                   </InfoBox>
                 );
              })()}

              <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: '600' }}>
                <CheckCircle size={14} color="#3ea6ff" /> Select Income Frequency:
              </div>
              
              <StatGrid>
                <StatBox $selected={incomeType === "DAILY"} onClick={() => setIncomeType("DAILY")}>
                    <Calendar size={20} color={incomeType === "DAILY" ? "#3ea6ff" : "#fff"} strokeWidth={1.5}/>
                    <span>Daily</span>
                    <strong>${selectedPkg.daily_income}</strong>
                </StatBox>
                <StatBox $selected={incomeType === "MONTHLY"} onClick={() => setIncomeType("MONTHLY")}>
                    <Calendar size={20} color={incomeType === "MONTHLY" ? "#3ea6ff" : "#fff"} strokeWidth={1.5}/>
                    <span>Monthly</span>
                    <strong>${selectedPkg.monthly_income}</strong>
                </StatBox>
                <StatBox $selected={incomeType === "YEARLY"} onClick={() => setIncomeType("YEARLY")}>
                    <TrendingUp size={20} color={incomeType === "YEARLY" ? "#3ea6ff" : "#fff"} strokeWidth={1.5}/>
                    <span>Yearly</span>
                    <strong>${selectedPkg.yearly_income}</strong>
                </StatBox>
              </StatGrid>

              {/* ✅ Terms & Conditions Checkbox */}
              <AgreementRow onClick={() => setIsAgreed(!isAgreed)}>
                <input 
                  type="checkbox" 
                  checked={isAgreed} 
                  onChange={() => setIsAgreed(!isAgreed)} 
                />
                <label>
                  I have read and agree to the <b>Terms & Risks</b>. I understand that payouts are based on current batch cycles.
                </label>
              </AgreementRow>

              <ActionButton 
                $gradient={selectedPkg.style.gradient} 
                onClick={book} 
                disabled={loading || !incomeType || !isAgreed} // ✅ Disabled if not agreed
              >
                {loading ? "Processing Investment..." : "Confirm & Pay"}
              </ActionButton>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>
    </Container>
  );
}