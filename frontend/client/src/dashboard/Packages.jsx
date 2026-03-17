import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, TrendingUp, CheckCircle, Zap, Info, Users } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast"; 
import Confetti from "react-confetti";

// --- HELPER FOR DYNAMIC GRADIENTS ---
const getPackageColor = (name) => {
  const n = name.toUpperCase();
  if (n.includes("WATER")) return "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)";
  if (n.includes("EARTH")) return "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)";
  if (n.includes("AIR")) return "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)";
  if (n.includes("FIRE")) return "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)";
  if (n.includes("SPACE")) return "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)";
  return "linear-gradient(135deg, #3ea6ff 0%, #0072ff 100%)";
};

// --- STYLED COMPONENTS ---
const Container = styled.div` width: 100%; `;

const Header = styled.div`
  margin-bottom: 40px;
  h2 { font-size: 32px; color: #fff; font-weight: 800; letter-spacing: -1px; margin: 0; }
  p { color: #666; font-size: 15px; margin-top: 8px; }
`;

const Grid = styled(motion.div)`
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
  gap: 25px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 28px;
  padding: 30px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.04);
  }
`;

const CardTop = styled.div` 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20px;
`;

const SlotBadge = styled.div`
  background: rgba(62, 166, 255, 0.1);
  color: #3ea6ff;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border: 1px solid rgba(62, 166, 255, 0.2);
`;

const Title = styled.h3` font-size: 24px; font-weight: 800; margin: 0; color: #fff; `;
const PriceTag = styled.div` 
    font-size: 32px; font-weight: 900; color: #fff; margin: 15px 0;
    display: flex; align-items: baseline; gap: 4px;
    &::before { content: '$'; font-size: 18px; color: #3ea6ff; }
`;

const DescriptionText = styled.p` 
  color: #777; font-size: 13.5px; line-height: 1.6; margin: 0 0 25px 0; min-height: 40px;
`;

const ProgressSection = styled.div`
  background: rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 18px;
  margin-top: auto;
`;

const ProgressLabel = styled.div` 
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; color: #555; margin-bottom: 10px; font-weight: 700; text-transform: uppercase;
  b { color: #fff; }
`;

const ProgressBar = styled.div` 
  width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 20px; overflow: hidden; 
`;

const ProgressFill = styled(motion.div)` 
  height: 100%; background: ${props => props.$gradient}; border-radius: 20px;
`;

const SeatInfo = styled.div`
  margin-top: 10px; font-size: 11px; color: #444; font-weight: 600;
  display: flex; align-items: center; gap: 5px;
  svg { color: #3ea6ff; }
`;

// --- MODAL STYLES ---
const Overlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;

const Modal = styled(motion.div)`
  background: #0f0f11; border: 1px solid rgba(255,255,255,0.08);
  width: 100%; max-width: 450px; border-radius: 32px; padding: 35px; position: relative;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
`;

const CloseButton = styled.button`
  position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.05); border: none; 
  color: #fff; width: 36px; height: 36px; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: 0.2s;
  &:hover { background: #ff4d4d; transform: rotate(90deg); }
`;

const InfoBox = styled.div`
  background: linear-gradient(145deg, rgba(62, 166, 255, 0.1), rgba(62, 166, 255, 0.02));
  border: 1px solid rgba(62, 166, 255, 0.2);
  padding: 20px; border-radius: 20px; margin: 25px 0;
  display: flex; justify-content: space-around; text-align: center;
  div { display: flex; flex-direction: column; gap: 4px; }
  small { color: #3ea6ff; font-size: 10px; font-weight: 800; text-transform: uppercase; }
  b { color: #fff; font-size: 15px; font-family: monospace; }
`;

const StatGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 25px; `;
const StatBox = styled.div`
  background: ${props => props.$selected ? "rgba(62, 166, 255, 0.15)" : "rgba(255,255,255,0.02)"}; 
  border: 1px solid ${props => props.$selected ? "#3ea6ff" : "rgba(255,255,255,0.06)"};
  padding: 15px 10px; border-radius: 18px; text-align: center; cursor: pointer; transition: 0.2s;
  span { font-size: 10px; color: #555; display: block; margin-bottom: 5px; font-weight: 700; }
  strong { font-size: 15px; color: ${props => props.$selected ? "#fff" : "#aaa"}; }
  &:hover { background: rgba(62, 166, 255, 0.08); }
`;

const ActionButton = styled(motion.button)`
  width: 100%; padding: 18px; border-radius: 18px; border: none;
  background: linear-gradient(90deg, #3ea6ff, #2563eb); color: #fff; font-weight: 700; font-size: 16px; cursor: pointer;
  box-shadow: 0 15px 30px rgba(62, 166, 255, 0.3);
  &:disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; }
`;

// --- MAIN COMPONENT ---
export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [incomeType, setIncomeType] = useState(null); 
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchAllPackages = async () => {
      try {
        const res = await api.get("/admin/packages"); 
        const detailedPackages = await Promise.all(res.data.map(async (p) => {
           try {
             const statusRes = await api.get(`/seats/status/${p.name}`);
             return { ...p, ...statusRes.data };
           } catch (e) { return p; }
        }));
        setPackages(detailedPackages.filter(p => p.is_active !== false));
      } catch (err) { console.error("Load failed", err); }
    };
    fetchAllPackages();
  }, []);

  const calculateNextSeatInfo = (pkg) => {
    const BATCH_SIZE = pkg.total_seats || 180;
    const totalSold = pkg.filledSeats || 0;
    const nextSeat = (totalSold % BATCH_SIZE) + 1;
    const bonus = (parseFloat(pkg.ticket_price) * 0.06) / nextSeat;
    return { seat: nextSeat, bonus: bonus.toFixed(4) };
  };

  const book = async () => {
    if (!selectedPkg || !incomeType || !isAgreed) return;
    setLoading(true);
    const loadToast = toast.loading("Processing Secure Investment...");
    try {
      await api.post("/booking/book-seat", { packageName: selectedPkg.name, incomeType });
      setShowConfetti(true);
      toast.success("Investment Successful!", { id: loadToast });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking Failed", { id: loadToast });
      setLoading(false);
    }
  };

  return (
    <Container>
      {showConfetti && <Confetti numberOfPieces={800} gravity={0.15} style={{zIndex: 9999, position:'fixed'}} />}

      <Header>
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Available Packages</motion.h2>
        <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            Select a high-yield growth plan powered by the travel ecosystem.
        </motion.p>
      </Header>
      
      <Grid initial="hidden" animate="show" variants={{
        show: { transition: { staggerChildren: 0.1 } }
      }}>
        {packages.map(pkg => {
          const filled = pkg.seatsInCurrentBatch || 0;
          const total = pkg.total_seats || 180;
          const percent = Math.min((filled / total) * 100, 100);
          const gradient = getPackageColor(pkg.name);
          
          const date = new Date(pkg.batchStartDate || pkg.created_at);
          const ddmmyy = `${date.getDate().toString().padStart(2,'0')}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getFullYear().toString().slice(-2)}`;
          const slotId = `${pkg.code}${ddmmyy}${pkg.currentBatch || 1}`;

          return (
            <Card 
              key={pkg.id} 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedPkg({ ...pkg, gradient, slotId })}
            >
              <CardTop>
                <Title>{pkg.name}</Title>
                <SlotBadge>{slotId}</SlotBadge>
              </CardTop>

              <DescriptionText>{pkg.description || "Diversified institutional-grade travel asset growth plan."}</DescriptionText>
              <PriceTag>{pkg.ticket_price}</PriceTag>
              
              <ProgressSection>
                <ProgressLabel>
                  <span>Filling Status</span>
                  <span><b>{filled}</b> / {total}</span>
                </ProgressLabel>
                <ProgressBar>
                  <ProgressFill 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }} 
                    transition={{ duration: 1, ease: "easeOut" }}
                    $gradient={gradient} 
                  />
                </ProgressBar>
                <SeatInfo>
                    <Users size={12}/> {Math.round(percent)}% Seats Occupied
                </SeatInfo>
              </ProgressSection>
            </Card>
          );
        })}
      </Grid>

      <AnimatePresence>
        {selectedPkg && (
          <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPkg(null)}>
            <Modal 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton onClick={() => setSelectedPkg(null)}><X size={20}/></CloseButton>
              
              <div style={{ textAlign: 'center' }}>
                <SlotBadge style={{ display: 'inline-block', marginBottom: 15 }}>{selectedPkg.slotId}</SlotBadge>
                <h2 style={{ color: '#fff', fontSize: '32px', margin: 0, fontWeight: 900 }}>{selectedPkg.name}</h2>
                <PriceTag style={{ justifyContent: 'center', margin: '10px 0' }}>{selectedPkg.ticket_price}</PriceTag>
              </div>

              {(() => {
                 const info = calculateNextSeatInfo(selectedPkg);
                 return (
                   <InfoBox>
                     <div><small>Slot ID</small><b>{selectedPkg.slotId}</b></div>
                     <div><small>Your Seat</small><b>#{info.seat}</b></div>
                     <div><small>Bonus</small><b style={{color:'#2ecc71'}}>${info.bonus}</b></div>
                   </InfoBox>
                 );
              })()}

              <div style={{ fontSize: '12px', color: '#555', marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Select Frequency</div>
              <StatGrid>
                {['DAILY', 'MONTHLY', 'YEARLY'].map(type => (
                  <StatBox key={type} $selected={incomeType === type} onClick={() => setIncomeType(type)}>
                    <span>{type}</span>
                    <strong>${selectedPkg[`${type.toLowerCase()}_income`]}</strong>
                  </StatBox>
                ))}
              </StatGrid>

              <div style={{ margin: '25px 0', display:'flex', gap: '12px', alignItems:'flex-start' }}>
                <input 
                    type="checkbox" 
                    checked={isAgreed} 
                    onChange={() => setIsAgreed(!isAgreed)} 
                    style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: '#3ea6ff' }} 
                />
                <label style={{ fontSize: '12.5px', color: '#777', lineHeight: 1.5 }}>
                  I confirm that I have read the investment terms and understand the payout cycles for <b>{selectedPkg.name}</b>.
                </label>
              </div>

              <ActionButton 
                onClick={book} 
                disabled={loading || !incomeType || !isAgreed}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? "Processing..." : "Confirm & Pay Now"}
              </ActionButton>
            </Modal>
          </Overlay>
        )}
      </AnimatePresence>
    </Container>
  );
}