import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  Plus, Trash2, Package, ToggleLeft, ToggleRight, 
  DollarSign, Users, Calendar, Activity, Info, PieChart 
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---

const Layout = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr; /* Left: Inventory, Right: Management */
  gap: 30px;
  color: #fff;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const Card = styled.div`
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 25px;
`;

const InventoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 13px;

  th { text-align: left; color: #888; padding: 10px; border-bottom: 1px solid #333; text-transform: uppercase; }
  td { padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }
`;

const CapacityBadge = styled.span`
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.percent > 90 ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)'};
  color: ${props => props.percent > 90 ? '#e74c3c' : '#2ecc71'};
`;

const GridForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  label { font-size: 11px; color: #888; text-transform: uppercase; font-weight: 700; }
  input {
    padding: 10px; background: rgba(0,0,0,0.3); 
    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;
    &:focus { border-color: #3ea6ff; outline: none; }
  }
`;

const ActionButton = styled.button`
  background: #3ea6ff; color: white; border: none; padding: 12px 25px; 
  border-radius: 10px; cursor: pointer; font-weight: bold;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PackagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const PkgCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${props => props.active ? 'rgba(62, 166, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 16px; padding: 20px; transition: 0.3s;
  opacity: ${props => props.active ? 1 : 0.6};
  &:hover { border-color: #3ea6ff; opacity: 1; }
`;

// --- COMPONENT ---

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", total_seats: "", ticket_price: "", daily_income: "",
    monthly_income: "", yearly_income: "", ots_income: ""
  });

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      // ✅ This should point to your backend route that returns packages + filled_seats count
      const res = await api.get("/admin/packages");
      setPackages(res.data);
    } catch (err) { console.error("Error fetching packages", err); }
  };

  const handleAdd = async () => {
    if(!form.name || !form.ticket_price) return toast.error("Name and Price required");
    setLoading(true);
    try {
      await api.post("/admin/packages", form);
      toast.success("Package Created Successfully!");
      setForm({ name: "", total_seats: "", ticket_price: "", daily_income: "", monthly_income: "", yearly_income: "", ots_income: "" });
      fetchPackages();
    } catch(err) { toast.error("Add failed"); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (pkg) => {
    try {
      const newStatus = !pkg.is_active; 
      await api.put(`/admin/packages/${pkg.id}/status`, { is_active: newStatus });
      fetchPackages();
      toast.success(`Package ${newStatus ? 'Activated' : 'Deactivated'}`);
    } catch(err) { toast.error("Update failed"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete permanently?")) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      fetchPackages();
      toast.success("Package deleted");
    } catch(err) { toast.error("Delete failed"); }
  };

  return (
    <Layout>
      {/* 📊 LEFT SIDE: SEAT INVENTORY TRACKER */}
      <Sidebar>
        <Card>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: '18px' }}>
            <PieChart size={20} color="#3ea6ff" /> Seat Inventory
          </h3>
          <p style={{ fontSize: 12, color: '#666', marginTop: 5 }}>Real-time usage tracking</p>
          
          <InventoryTable>
            <thead>
              <tr>
                <th>Package</th>
                <th>Filled</th>
                <th>Empty</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => {
                const filled = Number(pkg.filled_seats || 0); // Requires backend JOIN with seats table
                const total = Number(pkg.total_seats || 0);
                const empty = total - filled;
                const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
                
                return (
                  <tr key={pkg.id}>
                    <td style={{ fontWeight: 600 }}>{pkg.name}</td>
                    <td style={{ color: '#2ecc71' }}>{filled}</td>
                    <td style={{ color: '#aaa' }}>{empty < 0 ? 0 : empty}</td>
                    <td><CapacityBadge percent={percent}>{percent}%</CapacityBadge></td>
                  </tr>
                );
              })}
            </tbody>
          </InventoryTable>
          {packages.length === 0 && <p style={{textAlign:'center', color:'#444', fontSize:12, marginTop:20}}>No data available</p>}
        </Card>

        <Card style={{ background: 'rgba(62, 166, 255, 0.05)' }}>
           <div style={{ display: 'flex', gap: 12 }}>
              <Info size={20} color="#3ea6ff" />
              <div style={{ fontSize: 13, color: '#ccc', lineHeight: '1.5' }}>
                <strong>Dashboard Note:</strong> Seats are marked "Filled" automatically when users book tickets. Percentage turns red when capacity exceeds 90%.
              </div>
           </div>
        </Card>
      </Sidebar>

      {/* ⚙️ RIGHT SIDE: PACKAGE MANAGEMENT */}
      <MainContent>
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Create New Plan</h3>
          <GridForm>
            <InputGroup><label>Plan Name</label><input name="name" placeholder="WATER" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></InputGroup>
            <InputGroup><label>Price ($)</label><input name="ticket_price" type="number" placeholder="20" value={form.ticket_price} onChange={e => setForm({...form, ticket_price: e.target.value})} /></InputGroup>
            <InputGroup><label>Total Seats</label><input name="total_seats" type="number" placeholder="180" value={form.total_seats} onChange={e => setForm({...form, total_seats: e.target.value})} /></InputGroup>
            <InputGroup><label>Daily ROI</label><input name="daily_income" type="number" step="0.01" value={form.daily_income} onChange={e => setForm({...form, daily_income: e.target.value})} /></InputGroup>
            <InputGroup><label>Monthly ROI</label><input name="monthly_income" type="number" step="0.1" value={form.monthly_income} onChange={e => setForm({...form, monthly_income: e.target.value})} /></InputGroup>
            <InputGroup><label>OTS Bonus</label><input name="ots_income" type="number" step="0.1" value={form.ots_income} onChange={e => setForm({...form, ots_income: e.target.value})} /></InputGroup>
          </GridForm>
          <ActionButton onClick={handleAdd} disabled={loading}>
            {loading ? "Syncing..." : <><Plus size={18}/> Create Package</>}
          </ActionButton>
        </Card>

        <PackagesGrid>
          {packages.map(pkg => (
            <PkgCard key={pkg.id} active={pkg.is_active}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18 }}>{pkg.name}</h4>
                  <div style={{fontSize: 11, color: pkg.is_active ? '#2ecc71' : '#666', marginTop: 4}}>
                     {pkg.is_active ? "● System Active" : "● Offline"}
                  </div>
                </div>
                <span style={{ color: '#3ea6ff', fontWeight: 800, fontSize: 18 }}>${pkg.ticket_price}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#aaa' }}>
                  <span style={{display:'flex', alignItems:'center', gap:5}}><Activity size={12}/> Daily ROI</span>
                  <span style={{ color: '#fff' }}>${pkg.daily_income}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#aaa' }}>
                  <span style={{display:'flex', alignItems:'center', gap:5}}><Calendar size={12}/> Monthly ROI</span>
                  <span style={{ color: '#fff' }}>${pkg.monthly_income}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#aaa' }}>
                  <span style={{display:'flex', alignItems:'center', gap:5}}><DollarSign size={12}/> OTS Bonus</span>
                  <span style={{ color: '#fff' }}>${pkg.ots_income}</span>
                </div>
              </div>

              <div style={{ marginTop: 20, display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop: 15, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button onClick={() => toggleStatus(pkg)} style={{ background: 'none', border: 'none', color: pkg.is_active ? '#2ecc71' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 600 }}>
                  {pkg.is_active ? <ToggleRight size={26}/> : <ToggleLeft size={26}/>}
                  {pkg.is_active ? "Live" : "Paused"}
                </button>
                <button onClick={() => handleDelete(pkg.id)} style={{ color: '#e74c3c', background: 'rgba(231,76,60,0.1)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </PkgCard>
          ))}
        </PackagesGrid>
      </MainContent>
    </Layout>
  );
}