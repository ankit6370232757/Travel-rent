import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import api from "../api/axios";

// ✨ Glassmorphism Card
const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
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
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-top: 4px;
`;

const Badge = styled.div`
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(46, 204, 113, 0.2);
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  min-width: 0;
  flex: 1;
`;

const EmptyState = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
  
  svg { margin-bottom: 15px; opacity: 0.5; }
  p { margin: 0; font-size: 15px; color: #aaa; }
  small { font-size: 12px; opacity: 0.6; margin-top: 5px; }
`;

export default function Income() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/income/history")
      .then(res => {
        if (!Array.isArray(res.data)) return;

        // Group data by Date (Sum earnings for the same day)
        const grouped = {};
        res.data.forEach(i => {
          const dateObj = new Date(i.created_at);
          const day = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
          grouped[day] = (grouped[day] || 0) + Number(i.amount);
        });

        // Convert to array and Sort by date
        const formattedData = Object.keys(grouped)
          .map(d => ({ date: d, amount: grouped[d] }))
          .sort((a, b) => new Date(a.date) - new Date(b.date)); 

        setData(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Failed to load income:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Card 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Header>
        <TitleGroup>
          <IconBox>
            <TrendingUp size={22} />
          </IconBox>
          <div>
            <Title>Earnings Analytics</Title>
            <Subtitle>Growth Over Time</Subtitle>
          </div>
        </TitleGroup>
        
        {data.length > 0 && (
          <Badge>
            <Activity size={14} /> Live Data
          </Badge>
        )}
      </Header>

      <ChartContainer>
        {loading ? (
          <EmptyState>
             <Activity size={32} className="spin" style={{marginBottom: 15, color: '#3ea6ff'}}/>
             <p>Analyzing financial data...</p>
          </EmptyState>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ea6ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3ea6ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={12} 
                tickMargin={10} 
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return `${date.getDate()}/${date.getMonth()+1}`;
                }}
              />
              
              <YAxis 
                stroke="#666" 
                fontSize={12} 
                tickFormatter={(number) => `$${number}`}
              />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 25, 0.95)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  padding: '10px 15px'
                }} 
                itemStyle={{ color: '#3ea6ff', fontWeight: '600' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                formatter={(value) => [`$${value.toFixed(2)}`, "Earnings"]}
                labelFormatter={(label) => new Date(label).toDateString()}
              />
              
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3ea6ff" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                activeDot={{ r: 6, fill: '#fff', stroke: '#3ea6ff', strokeWidth: 3 }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState>
            <Activity size={48} />
            <p>No income history found yet</p>
            <small>Your daily earnings will appear here once processed.</small>
          </EmptyState>
        )}
      </ChartContainer>
    </Card>
  );
}