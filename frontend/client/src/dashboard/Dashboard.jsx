import React from "react";
import styled, { keyframes } from "styled-components";
import Packages from "./Packages";
import Wallet from "./Wallet";
import Withdraw from "./Withdraw";
import Income from "./Income";
import Referrals from "./Referrals";

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- STYLED COMPONENTS ---
const PageWrapper = styled.div`
  min-height: 100vh;
  /* Dark Modern Gradient Background */
  background: radial-gradient(circle at top right, #1a1a2e, #16213e, #0f3460); 
  color: #fff;
  padding-bottom: 50px;
  font-family: 'Inter', sans-serif;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
`;

const GridItem = styled.div`
  grid-column: span ${({ desktop }) => desktop || 12};
  
  /* Glassmorphism Card Style */
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  /* Entry Animation */
  animation: ${fadeIn} 0.6s ease-out forwards;
  animation-delay: ${({ delay }) => delay || "0s"};
  opacity: 0; /* Start hidden for animation */

  /* Hover Effect */
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 255, 255, 0.2);
  }

  /* Responsive Breakpoints */
  @media (max-width: 1024px) {
    grid-column: span ${({ tablet }) => tablet || 12};
    padding: 20px;
  }

  @media (max-width: 768px) {
    grid-column: span 12;
    padding: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #fff, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: #3ea6ff;
    border-radius: 2px;
    display: block;
  }
`;

export default function Dashboard() {
  return (
    <PageWrapper>
      <MainContent>
        
        {/* Row 1: Quick Actions (Wallet, Withdraw, Referrals) */}
        <GridItem desktop={4} tablet={6} delay="0.1s">
          <SectionTitle>My Wallet</SectionTitle>
          <Wallet />
        </GridItem>
        
        <GridItem desktop={4} tablet={6} delay="0.2s">
          <SectionTitle>Withdrawals</SectionTitle>
          <Withdraw />
        </GridItem>

        <GridItem desktop={4} tablet={12} delay="0.3s">
          <SectionTitle>My Network</SectionTitle>
          <Referrals />
        </GridItem>

        {/* Row 2: Analytics & Plans */}
        <GridItem desktop={8} tablet={12} delay="0.4s">
          <SectionTitle>Income Analytics</SectionTitle>
          <Income />
        </GridItem>

        <GridItem desktop={4} tablet={12} delay="0.5s">
          <SectionTitle>Active Packages</SectionTitle>
          <Packages />
        </GridItem>

      </MainContent>
    </PageWrapper>
  );
}