import styled from "styled-components";
import Packages from "./Packages";
import Wallet from "./Wallet";
import Withdraw from "./Withdraw";
import Income from "./Income";
import Referrals from "./Referrals";

const PageWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg};
  min-height: 100vh;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
`;

const GridItem = styled.div`
  grid-column: span ${({ desktop }) => desktop || 12};
  
  @media (max-width: 1024px) {
    grid-column: span ${({ tablet }) => tablet || 12};
  }

  @media (max-width: 768px) {
    grid-column: span 12;
  }
`;

export default function Dashboard() {
  return (
    <PageWrapper>
      {/* ⚠️ Remove Navbar below if it is already in App.jsx */}
      <MainContent>
        <GridItem desktop={4} tablet={6}>
          <Wallet />
        </GridItem>
        
        <GridItem desktop={4} tablet={6}>
          <Withdraw />
        </GridItem>

        <GridItem desktop={4} tablet={12}>
          <Referrals />
        </GridItem>

        <GridItem desktop={8} tablet={12}>
          <Income />
        </GridItem>

        <GridItem desktop={4} tablet={12}>
          <Packages />
        </GridItem>
      </MainContent>
    </PageWrapper>
  );
}