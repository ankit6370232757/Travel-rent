import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.soft};
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  color: ${({ theme }) => theme.textSoft};
`;

const BalanceText = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
`;

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0, locked_balance: 0 });

  useEffect(() => {
    api.get("/wallet").then(res => setWallet(res.data)).catch(() => {});
  }, []);

  return (
    <Card>
      <Title>My Wallet</Title>
      <BalanceText>${wallet.balance || 0}</BalanceText>
      <InfoRow>
        <span>Locked Funds</span>
        <span>${wallet.locked_balance || 0}</span>
      </InfoRow>
    </Card>
  );
}