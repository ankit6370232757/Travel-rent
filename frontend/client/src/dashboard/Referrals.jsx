import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Share2, Network, User } from "lucide-react";
import api from "../api/axios";

// ✨ Glassmorphism Card
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 30px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBox = styled.div`
  background: rgba(46, 204, 113, 0.15);
  padding: 10px;
  border-radius: 12px;
  color: #2ecc71;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const Subtitle = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
`;

const Badge = styled.div`
  background: ${({ theme }) => theme.accent};
  color: #000;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(62, 166, 255, 0.3);
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;

  /* Custom Scrollbar */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

const LevelGroup = styled(motion.div)`
  margin-bottom: 20px;
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.05);
  }
`;

const UserRow = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.05);
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #444, #222);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  span { font-size: 14px; color: #fff; font-weight: 500; }
  small { font-size: 11px; color: #666; }
`;

const EmptyState = styled.div`
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
  
  p { margin-top: 15px; font-size: 15px; }
  small { font-size: 13px; opacity: 0.6; }
`;

export default function Referrals() {
  const [tree, setTree] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalRefs, setTotalRefs] = useState(0);

  useEffect(() => {
    api.get("/referrals/tree")
      .then((res) => {
        const rawData = res.data; 
        const grouped = {};
        let count = 0;

        if (Array.isArray(rawData)) {
          rawData.forEach((item) => {
            // Group logic
            const lvlKey = `Level ${item.level}`;
            if (!grouped[lvlKey]) grouped[lvlKey] = [];
            grouped[lvlKey].push(item);
            count++;
          });
        }
        
        // Sort levels naturally (Level 1, Level 2...)
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
            const numA = parseInt(a.replace("Level ", ""));
            const numB = parseInt(b.replace("Level ", ""));
            return numA - numB;
        });

        const sortedGrouped = {};
        sortedKeys.forEach(key => sortedGrouped[key] = grouped[key]);

        setTree(sortedGrouped);
        setTotalRefs(count);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Referral fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Card
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Header>
        <TitleGroup>
          <IconBox>
            <Network size={22} />
          </IconBox>
          <div>
            <Title>My Network</Title>
            <Subtitle>Referral Tree (D1–D6)</Subtitle>
          </div>
        </TitleGroup>
        <Badge>{totalRefs} Members</Badge>
      </Header>

      <ScrollArea>
        {loading ? (
          <EmptyState><p>Loading network...</p></EmptyState>
        ) : Object.keys(tree).length === 0 ? (
          <EmptyState>
            <Share2 size={48} style={{ opacity: 0.2 }} />
            <p>No referrals yet</p>
            <small>Share your referral code to grow your team!</small>
          </EmptyState>
        ) : (
          <AnimatePresence>
            {Object.entries(tree).map(([levelName, users], index) => (
              <LevelGroup 
                key={levelName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LevelHeader>
                  <Share2 size={12} /> {levelName} ({users.length})
                </LevelHeader>
                
                {users.map((u, i) => (
                  <UserRow key={i} whileHover={{ scale: 1.01 }}>
                    <Avatar><User size={16} /></Avatar>
                    <UserInfo>
                      <span>{u.email}</span>
                      <small>Joined: {new Date().toLocaleDateString()}</small> {/* You can add real join_date if backend sends it */}
                    </UserInfo>
                  </UserRow>
                ))}
              </LevelGroup>
            ))}
          </AnimatePresence>
        )}
      </ScrollArea>
    </Card>
  );
}