import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, 
  Mountain, 
  Wind, 
  Flame, 
  Rocket, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import api from "../api/axios";

// --- CONFIGURATION ---
const PACKAGES = ["WATER", "EARTH", "AIR", "FIRE", "SPACE"];

// Map specific styles/icons to package names
const PACKAGE_STYLES = {
  WATER: { 
    color: "#00d2ff", 
    gradient: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)",
    icon: <Droplets size={24} /> 
  },
  EARTH: { 
    color: "#00b09b", 
    gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
    icon: <Mountain size={24} /> 
  },
  AIR:   { 
    color: "#d4fc79", 
    gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
    icon: <Wind size={24} /> 
  },
  FIRE:  { 
    color: "#ff512f", 
    gradient: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
    icon: <Flame size={24} /> 
  },
  SPACE: { 
    color: "#8E2DE2", 
    gradient: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
    icon: <Rocket size={24} /> 
  },
};

// --- STYLED COMPONENTS ---

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 25px;
  h2 {
    font-size: 24px;
    margin: 0;
    color: ${({ theme }) => theme.text};
  }
  p {
    color: ${({ theme }) => theme.textSoft};
    font-size: 14px;
    margin-top: 5px;
  }
`;

const Grid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.$gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Subtitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProgressSection = styled.div`
  margin: 20px 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.textSoft};
  
  strong {
    color: ${props => props.$color};
  }
`;

const BarBg = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  overflow: hidden;
`;

const BarFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.$gradient};
  border-radius: 10px;
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background: ${({ theme }) => theme.text};
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// --- MAIN COMPONENT ---

export default function Packages() {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState({}); // To track booking state per package

  useEffect(() => {
    PACKAGES.forEach(async (pkg) => {
      try {
        const res = await api.get(`/seats/status/${pkg}`);
        setStatus(prev => ({ ...prev, [pkg]: res.data }));
      } catch (err) {
        console.error("Failed to load status for", pkg);
      }
    });
  }, []);

  const book = async (pkg) => {
    if(!window.confirm(`Confirm booking for ${pkg}?`)) return;

    setLoading(prev => ({ ...prev, [pkg]: true })); // Start loading
    
    try {
      await api.post("/booking/book-seat", { packageName: pkg });
      alert("✅ Seat successfully booked!");
      window.location.reload(); 
    } catch (err) {
      console.error("❌ Booking Failed:", err);
      const errorMsg = err.response?.data?.message || "Connection Error";
      alert(`Booking Failed: ${errorMsg}`);
      setLoading(prev => ({ ...prev, [pkg]: false })); // Stop loading on error
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Container>
      <Header>
        <h2>Investment Packages</h2>
        <p>Select a mode to view availability and book your seat.</p>
      </Header>

      <Grid
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {PACKAGES.map(pkg => {
          const data = status[pkg];
          const style = PACKAGE_STYLES[pkg] || PACKAGE_STYLES.WATER; // Default to water if unknown
          const percent = data ? Math.round((data.filledSeats / data.totalSeats) * 100) : 0;
          const isFull = percent >= 100;
          const isLoading = loading[pkg];

          return (
            <Card 
              key={pkg} 
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div>
                <CardHeader>
                  <IconWrapper $gradient={style.gradient}>
                    {style.icon}
                  </IconWrapper>
                  <Subtitle>{data?.totalSeats || "..."} SEATS</Subtitle>
                </CardHeader>
                
                <Title>{pkg}</Title>
                
                <ProgressSection>
                  <ProgressLabel $color={style.color}>
                    <span>Availability</span>
                    <strong>{percent}% Filled</strong>
                  </ProgressLabel>
                  <BarBg>
                    <BarFill 
                      $gradient={style.gradient}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </BarBg>
                </ProgressSection>
              </div>

              <ActionButton 
                onClick={() => book(pkg)}
                disabled={isFull || isLoading}
                whileTap={{ scale: 0.95 }}
                whileHover={{ opacity: 0.9 }}
              >
                {isLoading ? "Processing..." : isFull ? "Sold Out" : "Book Seat"}
                {!isLoading && !isFull && <CheckCircle size={16} />}
              </ActionButton>
            </Card>
          );
        })}
      </Grid>
    </Container>
  );
}