import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";

const PACKAGES = ["WATER", "EARTH", "AIR", "FIRE", "SPACE"];

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
`;

const Item = styled.div`
  margin-bottom: 20px;
`;

const BarContainer = styled.div`
  height: 8px;
  background: #333;
  border-radius: 4px;
  margin: 8px 0;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${({ theme }) => theme.accent};
  transition: width 0.4s ease;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.accent};
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.98);
  }
`;

export default function Packages() {
  const [status, setStatus] = useState({});

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
    console.log(`🖱 Button Clicked for: ${pkg}`); // CHECK CONSOLE FOR THIS
    
    // Check if user accidentally double-clicks
    if(!window.confirm(`Confirm booking for ${pkg}?`)) return;

    try {
      console.log("🚀 Sending request...");
      const res = await api.post("/booking/book-seat", { packageName: pkg });
      console.log("✅ Success:", res.data);
      alert("Seat successfully booked!");
      window.location.reload(); 
    } catch (err) {
      console.error("❌ Booking Failed:", err);
      // Show the exact error from the backend
      const errorMsg = err.response?.data?.message || "Connection Error";
      alert(`Booking Failed: ${errorMsg}`);
    }
  };

  return (
    <Card>
      <h3 style={{marginBottom: '20px'}}>Available Modes</h3>
      {PACKAGES.map(pkg => {
        const data = status[pkg];
        const percent = data ? Math.round((data.filledSeats / data.totalSeats) * 100) : 0;

        return (
          <Item key={pkg}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px'}}>
              <span>{pkg}</span>
              <span>{percent}% Filled</span>
            </div>
            <BarContainer>
              <BarFill $width={percent} />
            </BarContainer>
            <ActionButton onClick={() => book(pkg)}>Book Now</ActionButton>
          </Item>
        );
      })}
    </Card>
  );
}