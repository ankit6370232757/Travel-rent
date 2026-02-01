import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.soft};
`;

export default function Income() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/income/history").then(res => {
      const grouped = {};
      res.data.forEach(i => {
        const day = i.created_at.split("T")[0];
        grouped[day] = (grouped[day] || 0) + Number(i.amount);
      });
      setData(Object.keys(grouped).map(d => ({ date: d, amount: grouped[d] })));
    }).catch(() => {});
  }, []);

  return (
    <Card>
      <h3 style={{marginBottom: '20px'}}>Earnings Growth</h3>
      <div style={{width: '100%', height: 250}}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff'}} />
            <Line type="monotone" dataKey="amount" stroke="#3ea6ff" strokeWidth={3} dot={{r: 4}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}