import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { PieChart } from "lucide-react";
import api from "../../api/axios";

const Card = styled.div`
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 25px;
  color: #fff;
  width: 100%;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 15px;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 700px;
  th { text-align: left; color: #888; padding: 12px; border-bottom: 1px solid #333; text-transform: uppercase; font-size: 11px; }
  td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
`;

const CapacityBadge = styled.span`
  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
  background: ${props => props.percent > 90 ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)'};
  color: ${props => props.percent > 90 ? '#e74c3c' : '#2ecc71'};
`;

export default function AdminPackageTracker() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    api.get("/admin/packages").then(res => setPackages(res.data)).catch(console.error);
  }, []);

  return (
    <Card>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: '20px' }}>
        <PieChart size={24} color="#3ea6ff" /> Package Inventory Tracker
      </h3>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>SL</th>
              <th>Plan Name</th>
              <th>Code</th>
              <th>Batch</th>
              <th>Filling Status</th>
              <th>Batch Progress</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg,index) => {
              const globalFilled = Number(pkg.filled_seats || 0);
              const totalCapacity = Number(pkg.total_seats || 1); // Avoid division by zero
              
              // Logic: global 52 / 50 total -> batchFilled is 2
              // If global 50 / 50 total -> it shows 0/50 (new batch started) or 50/50? 
              // Usually, when exactly full, we show 50/50 until 51 makes it 01/50
              const batchFilled = globalFilled % totalCapacity === 0 && globalFilled > 0 
                ? totalCapacity 
                : globalFilled % totalCapacity;

              // Progress percentage for the current batch specifically
              const batchPercent = Math.round((batchFilled / totalCapacity) * 100);

              return (
                <tr key={pkg.id}>
                  <td>{index+1}</td>
                  <td style={{ fontWeight: 600 }}>{pkg.name}</td>
                  <td style={{ color: '#3ea6ff' }}>{pkg.code}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {pkg.current_batch || 1}
                  </td>
                  <td>
                    {/* Padding with leading zero if below 10 */}
                    {batchFilled.toString().padStart(2, '0')} / {totalCapacity} Seats
                  </td>
                  <td>
                    <CapacityBadge percent={batchPercent}>
                      {batchPercent}% Full
                    </CapacityBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrapper>
    </Card>
  );
}