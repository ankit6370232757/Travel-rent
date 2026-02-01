import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
  max-height: 500px;
  overflow-y: auto; /* Allow scrolling if list is long */
`;

const Title = styled.h3`
  margin-bottom: 20px;
`;

const LevelBlock = styled.div`
  padding: 12px;
  border-left: 3px solid ${({ theme }) => theme.accent};
  background: rgba(62, 166, 255, 0.06);
  margin-bottom: 12px;
  border-radius: 6px;
`;

const LevelTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.text};
`;

const UserItem = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  margin-left: 10px;
  line-height: 1.6;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  text-align: center;
  margin-top: 20px;
`;

export default function Referrals() {
  const [tree, setTree] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/referrals/tree")
      .then((res) => {
        const rawData = res.data; // Expecting Array: [{level: 1, email: "..."}, ...]
        
        const grouped = {};
        
        // Ensure data is array before mapping
        if (Array.isArray(rawData)) {
          rawData.forEach((item) => {
            const lvlKey = `Level ${item.level}`;
            if (!grouped[lvlKey]) grouped[lvlKey] = [];
            grouped[lvlKey].push(item.email);
          });
        }
        
        setTree(grouped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Referral fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <Title>Network Tree (D1 – D6)</Title>

      {loading && <EmptyText>Loading network...</EmptyText>}

      {!loading && Object.keys(tree).length === 0 && (
        <EmptyText>No referrals found yet.</EmptyText>
      )}

      {!loading && Object.entries(tree).map(([levelName, emails]) => (
        <LevelBlock key={levelName}>
          <LevelTitle>{levelName}</LevelTitle>
          {emails.map((email, idx) => (
            <UserItem key={idx}>• {email}</UserItem>
          ))}
        </LevelBlock>
      ))}
    </Card>
  );
}