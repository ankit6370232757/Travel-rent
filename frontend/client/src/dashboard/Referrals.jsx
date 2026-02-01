import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
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
`;

export default function Referrals() {
  const [tree, setTree] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/referrals/tree")
      .then((res) => {
        console.log("REFERRAL TREE RESPONSE 👉", res.data);

        let data = res.data;

        // ✅ CASE 1: backend returns { success, data }
        if (data?.data) {
          data = data.data;
        }

        // ✅ CASE 2: backend returns ARRAY → convert to tree
        if (Array.isArray(data)) {
          const formatted = {};
          data.forEach((item) => {
            if (!formatted[item.level]) {
              formatted[item.level] = [];
            }
            formatted[item.level].push(item.email);
          });
          setTree(formatted);
        }
        // ✅ CASE 3: backend returns OBJECT (ideal)
        else if (typeof data === "object") {
          setTree(data);
        }
        // ❌ unexpected shape
        else {
          setTree({});
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Referral tree fetch failed ❌", err);
        setError("Failed to load referral tree");
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <Title>Network Tree (D1 – D6)</Title>

      {loading && <EmptyText>Loading referrals…</EmptyText>}

      {!loading && error && <EmptyText>{error}</EmptyText>}

      {!loading && !error && Object.keys(tree).length === 0 && (
        <EmptyText>No referrals found yet.</EmptyText>
      )}

      {!loading &&
        !error &&
        Object.entries(tree).map(([level, users]) => (
          <LevelBlock key={level}>
            <LevelTitle>{level.toUpperCase()}</LevelTitle>

            {users.length === 0 ? (
              <UserItem>No users</UserItem>
            ) : (
              users.map((email, i) => (
                <UserItem key={i}>• {email}</UserItem>
              ))
            )}
          </LevelBlock>
        ))}
    </Card>
  );
}
