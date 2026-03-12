import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown, Activity, Info, Target } from "lucide-react";
import api from "../api/axios";

// --- STYLED COMPONENTS ---
const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 25px;
  min-height: 500px;
`;

const GrowthIndicator = styled.div`
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 700;
  color: ${props => props.$isPositive ? '#2ecc71' : '#ff4d4d'};
  background: ${props => props.$isPositive ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255, 77, 77, 0.1)'};
  padding: 4px 10px; border-radius: 20px;
`;

const ProgressContainer = styled.div`
  margin: 25px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ProgressBarWrapper = styled.div`
  height: 8px;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #3ea6ff, #2ecc71);
  border-radius: 10px;
`;

const DescriptionBox = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: rgba(62, 166, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #3ea6ff;
  display: flex;
  gap: 12px;
  
  p {
    margin: 0;
    font-size: 13px;
    color: #aaa;
    line-height: 1.5;
  }
`;

export default function Income() {
  const [data, setData] = useState([]);
  const [analytics, setAnalytics] = useState({ growth: 0, thisWeekTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("daily");

  // Define a static or dynamic weekly goal (e.g., $500)
  const WEEKLY_GOAL = 500; 

  useEffect(() => {
    api.get("/income/analytics")
      .then(res => {
        setData(res.data.chartData || []);
        setAnalytics({ 
          growth: res.data.growth, 
          thisWeekTotal: Number(res.data.thisWeekTotal) || 0 
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const processedData = useMemo(() => {
    if (viewType === "daily") return data;
    let total = 0;
    return data.map(item => ({ ...item, amount: (total += item.amount) }));
  }, [data, viewType]);

  const progressPercent = Math.min(100, (analytics.thisWeekTotal / WEEKLY_GOAL) * 100);

  return (
    <Card initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ background: 'rgba(62, 166, 255, 0.1)', padding: '10px', borderRadius: '12px', color: '#3ea6ff' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#fff' }}>Growth Analytics</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: '#666', fontWeight: 700 }}>{viewType.toUpperCase()} REVENUE</span>
              <GrowthIndicator $isPositive={Number(analytics.growth) >= 0}>
                {Number(analytics.growth) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {analytics.growth}%
              </GrowthIndicator>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', height: 'fit-content' }}>
          <button 
            style={{ padding: '6px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: viewType === 'daily' ? '#3ea6ff' : 'transparent', color: viewType === 'daily' ? '#fff' : '#666' }} 
            onClick={() => setViewType("daily")}
          >Daily</button>
          <button 
            style={{ padding: '6px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: viewType === 'total' ? '#3ea6ff' : 'transparent', color: viewType === 'total' ? '#fff' : '#666' }} 
            onClick={() => setViewType("total")}
          >Total</button>
        </div>
      </div>

      {/* 🟢 WEEKLY GOAL PROGRESS BAR */}
      {!loading && (
        <ProgressContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>
              <Target size={16} color="#3ea6ff" /> Weekly Goal
            </div>
            <span style={{ color: '#3ea6ff', fontWeight: 700, fontSize: '14px' }}>
              ${analytics.thisWeekTotal.toLocaleString()} / ${WEEKLY_GOAL}
            </span>
          </div>
          <ProgressBarWrapper>
            <ProgressFill 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercent}%` }} 
              transition={{ duration: 1.5, ease: "easeOut" }} 
            />
          </ProgressBarWrapper>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#666', fontWeight: 600 }}>
            {progressPercent.toFixed(1)}% of goal reached
          </div>
        </ProgressContainer>
      )}

      {/* CHART SECTION */}
      <div style={{ height: '320px', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Activity className="spin" color="#3ea6ff" /></div>
        ) : processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ea6ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#3ea6ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" stroke="#444" fontSize={10} tickFormatter={(val) => val.split('-').reverse().slice(0,2).join('/')} />
              <YAxis stroke="#444" fontSize={10} tickFormatter={(val) => `$${val}`} />
              <Tooltip contentStyle={{ background: '#0f0f13', border: '1px solid #222', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="amount" stroke="#3ea6ff" strokeWidth={3} fill="url(#colorAmt)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px', color: '#444' }}>
            <TrendingUp size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
            <p>No Active cycles detected.</p>
          </div>
        )}
      </div>

      {/* 🔵 GRAPH DESCRIPTION SECTION */}
      <DescriptionBox>
        <Info size={20} color="#3ea6ff" style={{ flexShrink: 0 }} />
        <p>
          <strong>Data Intelligence:</strong> This graph visualizes your net growth trends derived strictly from 
          <strong> Daily, Monthly, and Yearly package mode</strong>. 
          The <strong>Daily</strong> view tracks day-over-day performance, while the <strong>Total</strong> view 
          displays accumulated maturity across all finalized batches. 
          Revenue is logged 24 hours after a batch reaches 100% capacity.
        </p>
      </DescriptionBox>
    </Card>
  );
}