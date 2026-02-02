import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Network, User, Hash, Layers, 
  BarChart2, IdCard, Share2 
} from "lucide-react";
import api from "../api/axios";

// --- STYLED COMPONENTS ---

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
  color: ${({ theme }) => theme.text || "#fff"};
`;

const Subtitle = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
`;

const Badge = styled.div`
  background: rgba(62, 166, 255, 0.2);
  color: #3ea6ff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(62, 166, 255, 0.3);
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* Ensures table doesn't squish on mobile */
`;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.05);
  
  th {
    padding: 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: #888;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    div {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

const Tr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }

  td {
    padding: 14px 16px;
    font-size: 13px;
    color: #ddd;
    vertical-align: middle;
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ea6ff 0%, #2d55ff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  margin-right: 12px;
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  
  div {
    display: flex;
    flex-direction: column;
    
    strong { color: #fff; font-weight: 500; }
    small { font-size: 11px; color: #666; }
  }
`;

const LevelBadge = styled.span`
  background: ${props => props.level === 1 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)'};
  color: ${props => props.level === 1 ? '#2ecc71' : '#f1c40f'};
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
`;

const UserIdTag = styled.span`
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
  color: #aaa;
  font-size: 11px;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

// --- MAIN COMPONENT ---

export default function MyNetwork() {
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/referrals/my-network")
      .then(res => {
        setNetwork(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Network Error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Card
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <TitleGroup>
          <IconBox>
            <Network size={22} />
          </IconBox>
          <div>
            <Title>My Network</Title>
            <Subtitle>Referral Tree Overview</Subtitle>
          </div>
        </TitleGroup>
        <Badge>{network.length} Members</Badge>
      </Header>

      <TableContainer>
        <Table>
          <Thead>
            <tr>
              <th style={{width: '60px'}}><div><Hash size={14}/> No.</div></th>
              <th><div><User size={14}/> User Name</div></th>
              <th><div><Layers size={14}/> Level</div></th>
              <th><div><BarChart2 size={14}/> Width</div></th>
              <th><div><IdCard size={14}/> User ID</div></th>
            </tr>
          </Thead>
          
          <tbody>
            {loading ? (
               <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#666'}}>Loading data...</td></tr>
            ) : network.length === 0 ? (
               <tr>
                 <td colSpan="5">
                   <EmptyState>
                     <Share2 size={32} style={{opacity:0.3}}/>
                     <span>No members found. Share your link!</span>
                   </EmptyState>
                 </td>
               </tr>
            ) : (
              network.map((user, index) => (
                <Tr 
                  key={user.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* 1. SERIAL NO */}
                  <td><span style={{color: '#666', fontWeight:'600'}}>#{index + 1}</span></td>
                  
                  {/* 2. NAME */}
                  <td>
                    <NameCell>
                      <Avatar>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</Avatar>
                      <div>
                        <strong>{user.name || "Unknown"}</strong>
                        <small>{user.email}</small>
                      </div>
                    </NameCell>
                  </td>

                  {/* 3. LEVEL */}
                  <td>
                    <LevelBadge level={user.level}>Level {user.level}</LevelBadge>
                  </td>

                  {/* 4. WIDTH (Direct Referrals) */}
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <div style={{
                        width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow:'hidden'
                      }}>
                        <div style={{width: `${Math.min((user.referral_count || 0) * 10, 100)}%`, height:'100%', background:'#3ea6ff'}}></div>
                      </div>
                      <span style={{fontSize:'12px', fontWeight:'bold'}}>{user.referral_count || 0}</span>
                    </div>
                  </td>

                  {/* 5. USER ID */}
                  <td>
                    <UserIdTag>{user.id}</UserIdTag>
                  </td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Card>
  );
}