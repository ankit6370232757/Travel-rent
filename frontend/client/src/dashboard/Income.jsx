import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
  display: flex;
  flex-direction: column;
  min-height: 350px;
`;

export default function Income() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/income/history")
      .then(res => {
        console.log("📊 Chart Data Response:", res.data); // CHECK THIS LOG IN BROWSER

        if (!Array.isArray(res.data)) {
          console.error("❌ Data is not an array:", res.data);
          return;
        }

        const grouped = {};
        res.data.forEach(i => {
          // Robust date parsing
          const dateObj = new Date(i.created_at);
          const day = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
          grouped[day] = (grouped[day] || 0) + Number(i.amount);
        });

        const formattedData = Object.keys(grouped).map(d => ({ date: d, amount: grouped[d] }));
        console.log("📈 Processed Chart Data:", formattedData); // CHECK THIS LOG

        setData(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Failed to load income history:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <h3 style={{marginBottom: '20px'}}>Earnings Growth</h3>
      
      {/* Container with fixed height ensures Recharts knows how to render */}
      <div style={{ width: '100%', height: 300, minWidth: 0 }}>
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '100px' }}>Loading chart...</p>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} tick={{fill: '#aaa'}} />
              <YAxis stroke="#888" fontSize={12} tick={{fill: '#aaa'}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff'}} 
                itemStyle={{color: '#fff'}}
                cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2}}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3ea6ff" 
                strokeWidth={3} 
                dot={{r: 4, fill: '#3ea6ff'}} 
                activeDot={{r: 6, fill: '#fff'}}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            flexDirection: "column",
            color: "#666" 
          }}>
            <p>No income history yet</p>
            <small>Earnings appear here after daily processing</small>
          </div>
        )}
      </div>
    </Card>
  );
}