import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, Users, AlertCircle, FileText, 
  Calendar, Layers, ChevronLeft, ChevronRight, Search, 
  Download 
} from "lucide-react";
import * as XLSX from 'xlsx';
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const StatIcon = styled.div`
  width: 45px; height: 45px; border-radius: 12px;
  background: ${props => props.bg}; color: ${props => props.color};
  display: flex; align-items: center; justify-content: center;
`;

const Section = styled.div`
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 25px;
  overflow-x: auto;
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 350px;
  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 10px 15px 10px 40px;
    color: #fff;
    font-size: 14px;
    outline: none;
    &:focus { border-color: #3ea6ff; }
  }
  svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #666; }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
  select {
    background: #1a1a1a; 
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 8px 12px;
    color: #fff;
    font-size: 13px;
    outline: none;
    cursor: pointer;
    
    option {
      background: #1a1a1a;
      color: #fff;
    }

    &:focus { border-color: #3ea6ff; }
  }
`;

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.2);
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover { background: #2ecc71; color: #fff; }
`;

const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 850px;
  th { text-align: left; padding: 10px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  td { padding: 15px 10px; color: #ddd; font-size: 13px; background: rgba(255,255,255,0.02); }
  td:first-child { border-radius: 10px 0 0 10px; text-align: center; color: #555; font-weight: bold; }
  td:last-child { border-radius: 0 10px 10px 0; }
`;

const Badge = styled.span`
  padding: 4px 10px; border-radius: 10px; font-size: 10px; font-weight: 700;
  background: ${props => props.$bg}; color: ${props => props.$color};
  display: inline-flex; align-items: center; gap: 4px; text-transform: uppercase;
`;

const PaginationWrapper = styled.div`
  display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 25px;
  span { color: #888; font-size: 13px; }
`;

const PageBtn = styled.button`
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
  &:disabled { opacity: 0.2; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #3ea6ff; }
`;

// --- HELPERS ---
const formatDate = (date) => {
  const d = new Date(date);
  return {
    date: d.toLocaleDateString("en-GB"),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};

// 🟢 COLORS UPDATED BASED ON image_1f0889.png
const packageColors = {
  "WATER": { bg: "rgba(0, 210, 255, 0.1)", color: "#00d2ff" },
  "EARTH": { bg: "rgba(46, 204, 113, 0.1)", color: "#2ecc71" },
  "AIR": { bg: "rgba(186, 255, 201, 0.1)", color: "#baffc9" },
  "FIRE": { bg: "rgba(231, 76, 60, 0.1)", color: "#e74c3c" },
  "SPACE": { bg: "rgba(142, 45, 226, 0.1)", color: "#8e2de2" },
  "X1": { bg: "rgba(255, 215, 0, 0.1)", color: "#ffd700" }
};

const planColors = {
  "DAILY": { bg: "rgba(142, 45, 226, 0.1)", color: "#8e2de2" },
  "MONTHLY": { bg: "rgba(241, 196, 15, 0.1)", color: "#f1c40f" },
  "YEARLY": { bg: "rgba(231, 76, 60, 0.1)", color: "#e74c3c" }
};

export default function AdminOverview({ stats, bookings = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pkgFilter, setPkgFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const itemsPerPage = 30;

  // ✅ FILTERING LOGIC
  const filteredData = useMemo(() => {
    setCurrentPage(1);
    return bookings.filter(b => {
      const matchesSearch = 
        (b.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.user_id || "").toString().includes(search);
      
      const matchesPkg = pkgFilter === "ALL" || b.package_name?.toUpperCase() === pkgFilter;
      const matchesPlan = planFilter === "ALL" || (b.income_type || "DAILY").toUpperCase() === planFilter;

      return matchesSearch && matchesPkg && matchesPlan;
    });
  }, [bookings, search, pkgFilter, planFilter]);

  // ✅ EXCEL EXPORT
  const handleExport = () => {
    if (filteredData.length === 0) return toast.error("No data found");
    const exportData = filteredData.map((b, index) => {
      const { date, time } = formatDate(b.booked_at);
      return {
        "SL No": index + 1,
        "Date": date,
        "Time": time,
        "User ID": b.user_id || "N/A", 
        "User Name": b.user_name || "Unknown",
        "Package": b.package_name,
        "Plan": b.income_type || "DAILY",
        "Price": `$${Number(b.ticket_price).toLocaleString()}`
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Bookings_${new Date().toLocaleDateString()}.xlsx`);
    toast.success("Excel exported!");
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPackageStyles = (name) => packageColors[name?.toUpperCase()] || { bg: "rgba(255,255,255,0.05)", color: "#888" };
  const getPlanStyles = (type) => planColors[(type || "DAILY").toUpperCase()] || { bg: "rgba(255,255,255,0.05)", color: "#888" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Grid>
        <StatCard whileHover={{ y: -5 }}>
          <StatIcon bg="rgba(62, 166, 255, 0.1)" color="#3ea6ff"><DollarSign size={20}/></StatIcon>
          <div>
            <h4 style={{margin:0, color:'#666', fontSize: '11px', textTransform: 'uppercase'}}>Revenue</h4>
            <span style={{fontSize:'20px', fontWeight:'bold'}}>${stats.revenue.toLocaleString()}</span>
          </div>
        </StatCard>
        <StatCard whileHover={{ y: -5 }}>
          <StatIcon bg="rgba(142, 45, 226, 0.1)" color="#8e2de2"><Users size={20}/></StatIcon>
          <div>
            <h4 style={{margin:0, color:'#666', fontSize: '11px', textTransform: 'uppercase'}}>Users</h4>
            <span style={{fontSize:'20px', fontWeight:'bold'}}>{stats.users}</span>
          </div>
        </StatCard>
        <StatCard whileHover={{ y: -5 }}>
          <StatIcon bg="rgba(241, 196, 15, 0.1)" color="#f1c40f"><AlertCircle size={20}/></StatIcon>
          <div>
            <h4 style={{margin:0, color:'#666', fontSize: '11px', textTransform: 'uppercase'}}>Total Request</h4>
            <span style={{fontSize:'20px', fontWeight:'bold'}}>{stats.pending}</span>
          </div>
        </StatCard>
      </Grid>

      <Section>
        <ControlsRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <h3 style={{margin: 0, display:'flex', alignItems:'center', gap:8, color: '#fff', fontSize: '18px'}}>
              <FileText size={18} color="#3ea6ff"/> Recent Bookings
            </h3>
            <ExportBtn onClick={handleExport}>
              <Download size={16} /> Export
            </ExportBtn>
          </div>

          <SearchBox>
            <Search size={16} />
            <input 
              placeholder="Search User or 6-digit ID..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchBox>

          <FilterGroup>
            <select value={pkgFilter} onChange={(e) => setPkgFilter(e.target.value)}>
              <option value="ALL">All Packages</option>
              <option value="WATER">WATER</option>
              <option value="EARTH">EARTH</option>
              <option value="AIR">AIR</option>
              <option value="FIRE">FIRE</option>
              <option value="SPACE">SPACE</option>
              <option value="X1">X1</option>
            </select>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="ALL">All Plans</option>
              <option value="DAILY">Daily</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </FilterGroup>
        </ControlsRow>
        
        {filteredData.length === 0 ? <p style={{color:'#444', textAlign: 'center', padding: '40px'}}>No matching records found.</p> : (
          <>
            <Table>
              <thead>
                <tr>
                  <th># SL</th>
                  <th>Date & Time</th>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Package</th>
                  <th>Plan</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paginatedData.map((b, i) => {
                    const pkgStyle = getPackageStyles(b.package_name);
                    const planStyle = getPlanStyles(b.income_type);
                    const { date, time } = formatDate(b.booked_at);

                    return (
                      <motion.tr 
                        key={b.id || i}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: (i % itemsPerPage) * 0.01 }}
                      >
                        <td>{((currentPage - 1) * itemsPerPage) + i + 1}</td>
                        <td>
                          <div style={{color: '#fff'}}>{date}</div>
                          <div style={{fontSize: '10px', color: '#555'}}>{time}</div>
                        </td>
                        <td style={{color: '#8e2de2', fontWeight: 'bold'}}>
                          #{b.user_id || "N/A"}
                        </td>
                        <td style={{fontWeight: '600'}}>{b.user_name || "Unknown"}</td>
                        <td>
                          <Badge $bg={pkgStyle.bg} $color={pkgStyle.color}>{b.package_name}</Badge>
                        </td>
                        <td>
                          <Badge $bg={planStyle.bg} $color={planStyle.color}>
                            <Layers size={10} /> {b.income_type || "DAILY"}
                          </Badge>
                        </td>
                        <td style={{color:'#2ecc71', fontWeight:'800'}}>${Number(b.ticket_price).toLocaleString()}</td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </Table>

            {totalPages > 1 && (
              <PaginationWrapper>
                <PageBtn disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></PageBtn>
                <span>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>
                <PageBtn disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></PageBtn>
              </PaginationWrapper>
            )}
          </>
        )}
      </Section>
    </motion.div>
  );
}