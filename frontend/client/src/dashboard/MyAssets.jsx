import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Package, Clock, Filter, ChevronDown, Layers } from "lucide-react"; // 🟢 Fixed: Changed layers to Layers
import api from "../api/axios";

// --- STYLED COMPONENTS ---
const FilterSection = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: center;
`;

const SelectWrapper = styled.div`
  position: relative;
  background: #111114;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  transition: 0.3s;
  
  &:hover {
    border-color: rgba(62, 166, 255, 0.5);
  }
  
  select {
    background: transparent;
    border: none;
    color: #fff;
    padding: 12px 35px 12px 0;
    font-size: 13px;
    font-weight: 600;
    outline: none;
    cursor: pointer;
    appearance: none;
    min-width: 140px;

    option {
      background: #111114; /* 🟢 Fixed: Dark background for options */
      color: #fff;
    }
  }

  .icon-chevron {
    position: absolute;
    right: 12px;
    pointer-events: none;
    color: #3ea6ff;
  }
`;

const AssetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px; 
`;

const AssetCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px; padding: 25px;
  position: relative; overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover { transform: translateY(-5px); border-color: rgba(62, 166, 255, 0.3); background: rgba(255, 255, 255, 0.05); }
  &::before {
    content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
    background: #3ea6ff;
  }
`;

export default function MyAssets() {
  const [assets, setAssets] = useState([]);
  const [pkgFilter, setPkgFilter] = useState("All Packages");
  const [typeFilter, setTypeFilter] = useState("All Types");

  useEffect(() => {
    api.get("/booking/my-assets").then(res => setAssets(res.data || [])).catch(err => console.error(err));
  }, []);

  const packageNames = useMemo(() => {
    const names = assets.map(a => a.package_name);
    return ["All Packages", ...new Set(names)];
  }, [assets]);

  const planTypes = useMemo(() => {
    const types = assets.map(a => a.income_type);
    return ["All Types", ...new Set(types)];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchPkg = pkgFilter === "All Packages" || asset.package_name === pkgFilter;
      const matchType = typeFilter === "All Types" || asset.income_type === typeFilter;
      return matchPkg && matchType;
    });
  }, [assets, pkgFilter, typeFilter]);

  const getIncomeDisplay = (daily, type) => {
    const val = Number(daily);
    if (type === "MONTHLY") return { label: "MONTHLY INCOME", val: (val * 30).toFixed(2) };
    if (type === "YEARLY") return { label: "YEARLY INCOME", val: (val * 365).toFixed(2) };
    return { label: "DAILY INCOME", val: val.toFixed(2) };
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontSize: '22px' }}>
          <Package color="#3ea6ff" size={24} /> My Active Packages ({filteredAssets.length})
        </h2>

        <FilterSection>
          <SelectWrapper>
            <Filter size={14} style={{ marginRight: '10px', color: '#3ea6ff' }} />
            <select value={pkgFilter} onChange={(e) => setPkgFilter(e.target.value)}>
              {packageNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="icon-chevron" />
          </SelectWrapper>

          <SelectWrapper>
            <Layers size={14} style={{ marginRight: '10px', color: '#3ea6ff' }} />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {planTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown size={14} className="icon-chevron" />
          </SelectWrapper>
        </FilterSection>
      </div>

      <AssetGrid>
        {filteredAssets.map(asset => {
          const income = getIncomeDisplay(asset.daily_income, asset.income_type);
          
          return (
            <AssetCard key={asset.seat_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '19px' }}>{asset.package_name}</span>
                <span style={{ color: '#00ff88', fontWeight: 800, fontSize: '19px' }}>${Number(asset.ticket_price).toFixed(2)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#555', display: 'block', marginBottom: '4px', fontWeight: 800, letterSpacing: '0.5px' }}>SEAT/BATCH</label>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>S-{asset.seat_number} / B-{asset.batch_number}</span>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#555', display: 'block', marginBottom: '4px', fontWeight: 800, letterSpacing: '0.5px' }}>{income.label}</label>
                  <span style={{ color: '#00ff88', fontSize: '14px', fontWeight: 700 }}>${income.val}</span>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#555', display: 'block', marginBottom: '4px', fontWeight: 800, letterSpacing: '0.5px' }}>PLAN TYPE</label>
                  <span style={{ 
                    color: asset.income_type === 'DAILY' ? '#3ea6ff' : asset.income_type === 'MONTHLY' ? '#8e2de2' : '#f39c12', 
                    fontSize: '11px', 
                    fontWeight: 900,
                    background: 'rgba(255,255,255,0.05)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}>
                    {asset.income_type}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#555', display: 'block', marginBottom: '4px', fontWeight: 800, letterSpacing: '0.5px' }}>REMAINING</label>
                  <span style={{ color: '#ffc107', fontSize: '14px', fontWeight: 700 }}>{asset.days_remaining} Days</span>
                </div>
              </div>

              <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={12} /> 
                <span>Purchased on <b style={{color: '#888'}}>{new Date(asset.booked_at).toLocaleDateString('en-GB')}</b></span>
              </div>
            </AssetCard>
          );
        })}
      </AssetGrid>

      {filteredAssets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '120px 20px', color: '#444', background: 'rgba(255,255,255,0.01)', borderRadius: '30px', marginTop: '20px' }}>
          <Filter size={50} style={{ marginBottom: '15px', opacity: 0.1 }} />
          <p style={{ fontSize: '16px', margin: 0 }}>No matching assets found for this combination.</p>
          <button 
            onClick={() => {setPkgFilter("All Packages"); setTypeFilter("All Types");}}
            style={{ marginTop: '15px', background: 'none', border: '1px solid #3ea6ff', color: '#3ea6ff', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}