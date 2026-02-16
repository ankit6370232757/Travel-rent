import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { 
  Users, Network, User, Hash, Layers, 
  BarChart2, IdCard, Share2 
} from "lucide-react";
import api from "../api/axios";

// --- STYLED COMPONENTS ---

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBox = styled.div`
  background: rgba(62, 166, 255, 0.15);
  padding: 10px;
  border-radius: 12px;
  color: #3ea6ff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`;

const Subtitle = styled.div`
  font-size: 13px;
  color: #888;
  margin-top: 4px;
`;

const Badge = styled.div`
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(46, 204, 113, 0.2);
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
  min-width: 700px;
`;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.02);
  
  th {
    padding: 18px 24px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #888;
    letter-spacing: 0.8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    
    div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

const Tr = styled(motion.tr)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &:last-child {
    border-bottom: none;
  }

  td {
    padding: 20px 24px;
    font-size: 14px;
    color: #e0e0e0;
    vertical-align: middle;
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3ea6ff 0%, #2d55ff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  margin-right: 14px;
  box-shadow: 0 4px 10px rgba(62, 166, 255, 0.3);
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  
  div {
    display: flex;
    flex-direction: column;
    
    strong { color: #fff; font-weight: 600; font-size: 14px; }
    small { font-size: 12px; color: #777; margin-top: 2px; }
  }
`;

const LevelBadge = styled.span`
  background: ${props => props.level === 1 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(241, 196, 15, 0.15)'};
  color: ${props => props.level === 1 ? '#2ecc71' : '#f1c40f'};
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid ${props => props.level === 1 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)'};
`;

const UserIdTag = styled.span`
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 10px;
  border-radius: 6px;
  color: #ccc;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const EmptyState = styled.div`
  padding: 60px;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  
  span { font-size: 14px; color: #888; }
`;

// --- MAIN COMPONENT ---

export default function Referrals() {
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
               <tr><td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#666'}}>Loading network data...</td></tr>
            ) : network.length === 0 ? (
               <tr>
                 <td colSpan="5">
                   <EmptyState>
                     <Share2 size={40} style={{opacity:0.2, color:'#fff'}}/>
                     <span>No members found in your network yet.</span>
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
                  <td><span style={{color: '#555', fontWeight:'700'}}>#{index + 1}</span></td>
                  
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
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <div style={{
                        width: '50px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow:'hidden'
                      }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((user.referral_count || 0) * 10, 100)}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          style={{height:'100%', background:'#3ea6ff', borderRadius:'4px'}} 
                        />
                      </div>
                      <span style={{fontSize:'12px', fontWeight:'700', color: '#fff'}}>{user.referral_count || 0}</span>
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