import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { 
  Plus, Trash2, Edit2, Check, X, 
  PieChart, Info, ToggleLeft, ToggleRight,
  Calendar, DollarSign, Activity, Clock
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Layout = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  color: #fff;
  @media (max-width: 1200px) { grid-template-columns: 1fr; }
`;

const Sidebar = styled.div`display: flex; flex-direction: column; gap: 20px;`;
const MainContent = styled.div`display: flex; flex-direction: column; gap: 25px;`;

const Card = styled.div`
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 25px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 13px;
  th { text-align: left; color: #888; padding: 12px; border-bottom: 1px solid #333; text-transform: uppercase; font-size: 11px; }
  td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
  tr:hover { background: rgba(255,255,255,0.02); }
`;

const CapacityBadge = styled.span`
  padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700;
  background: ${props => props.percent > 90 ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)'};
  color: ${props => props.percent > 90 ? '#e74c3c' : '#2ecc71'};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  &:focus { border-color: #3ea6ff; outline: none; }
`;

const Label = styled.label`
  display: block;
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 6px;
`;

const ActionButton = styled.button`
  background: ${props => props.$color || '#3ea6ff'}; 
  color: white; border: none; padding: 12px 25px; 
  border-radius: 10px; cursor: pointer; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: 0.2s;
  &:hover { opacity: 0.8; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const IconButton = styled.button`
  background: ${props => props.$bg || 'transparent'};
  color: ${props => props.$color || '#fff'};
  border: none; padding: 6px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.1); }
`;

// --- COMPONENT ---
export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    name: "", code: "", total_seats: "", ticket_price: "", 
    daily_income: "", monthly_income: "", yearly_income: "", 
    ots_income: "", effective_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get("/admin/packages");
      setPackages(res.data);
    } catch (err) { console.error("Fetch error", err); }
  };

  const handleAdd = async () => {
    if(!form.name || !form.code || !form.ticket_price) return toast.error("Name, Code and Price required");
    setLoading(true);
    try {
      await api.post("/admin/packages", form);
      toast.success("Package Launched Successfully!");
      setForm({ 
        name: "", code: "", total_seats: "", ticket_price: "", 
        daily_income: "", monthly_income: "", yearly_income: "", 
        ots_income: "", effective_date: new Date().toISOString().split('T')[0] 
      });
      fetchPackages();
    } catch(err) { toast.error(err.response?.data?.message || "Creation failed"); }
    finally { setLoading(false); }
  };

  const startEdit = (pkg) => {
    setEditingId(pkg.id);
    // Format the date for the input field
    const formattedDate = pkg.effective_date ? new Date(pkg.effective_date).toISOString().split('T')[0] : "";
    setEditForm({ ...pkg, effective_date: formattedDate });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/admin/packages/${editingId}`, editForm);
      toast.success("Package Updated");
      setEditingId(null);
      fetchPackages();
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <Layout>
      <Sidebar>
        <Card>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: '18px' }}>
            <PieChart size={20} color="#3ea6ff" /> Tracker
          </h3>
          <Table>
            <thead>
              <tr><th>Plan</th><th>Code</th><th>Fill</th><th>%</th></tr>
            </thead>
            <tbody>
              {packages.map(pkg => {
                const filled = Number(pkg.filled_seats || 0);
                const total = Number(pkg.total_seats || 0);
                const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
                return (
                  <tr key={pkg.id}>
                    <td>{pkg.name}</td>
                    <td style={{color:'#666'}}>{pkg.code}</td>
                    <td>{filled}/{total}</td>
                    <td><CapacityBadge percent={percent}>{percent}%</CapacityBadge></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </Sidebar>

      <MainContent>
        {/* ENHANCED CREATE FORM */}
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Create New Package</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            <div>
              <Label>Package Name</Label>
              <Input placeholder="e.g. WATER" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <Label>System Code</Label>
              <Input placeholder="e.g. WTR-01" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input type="number" placeholder="20.00" value={form.ticket_price} onChange={e => setForm({...form, ticket_price: e.target.value})} />
            </div>
            <div>
              <Label>Total Capacity</Label>
              <Input type="number" placeholder="180" value={form.total_seats} onChange={e => setForm({...form, total_seats: e.target.value})} />
            </div>
            <div>
              <Label>Daily ROI ($)</Label>
              <Input type="number" step="0.01" value={form.daily_income} onChange={e => setForm({...form, daily_income: e.target.value})} />
            </div>
            <div>
              <Label>Monthly ROI ($)</Label>
              <Input type="number" step="0.01" value={form.monthly_income} onChange={e => setForm({...form, monthly_income: e.target.value})} />
            </div>
            <div>
              <Label>Yearly ROI ($)</Label>
              <Input type="number" step="0.01" value={form.yearly_income} onChange={e => setForm({...form, yearly_income: e.target.value})} />
            </div>
            <div>
              <Label>Effective Date</Label>
              <Input type="date" value={form.effective_date} onChange={e => setForm({...form, effective_date: e.target.value})} />
            </div>
          </div>
          <ActionButton onClick={handleAdd} disabled={loading}>
            {loading ? "Launching..." : <><Plus size={18}/> Launch Package</>}
          </ActionButton>
        </Card>

        {/* MANAGEMENT TABLE */}
        <Card>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Live Packages Management</h3>
          <Table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Name/Code</th>
                <th>ROI (D/M/Y)</th>
                <th>OTS</th>
                <th>Effective</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td>
                    <IconButton onClick={() => {/* Toggle Logic */}} $color={pkg.is_active ? '#2ecc71' : '#666'}>
                      {pkg.is_active ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                    </IconButton>
                  </td>
                  <td>
                    {editingId === pkg.id ? (
                      <div style={{display:'flex', flexDirection:'column', gap:4}}>
                        <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                        <Input value={editForm.code} style={{fontSize:11}} onChange={e => setEditForm({...editForm, code: e.target.value})} />
                      </div>
                    ) : (
                      <div>
                        <div style={{fontWeight:600}}>{pkg.name}</div>
                        <div style={{fontSize:10, color:'#3ea6ff'}}>{pkg.code}</div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === pkg.id ? (
                      <div style={{display:'flex', gap:4}}>
                        <Input type="number" step="0.01" value={editForm.daily_income} onChange={e => setEditForm({...editForm, daily_income: e.target.value})} />
                        <Input type="number" step="0.01" value={editForm.monthly_income} onChange={e => setEditForm({...editForm, monthly_income: e.target.value})} />
                        <Input type="number" step="0.01" value={editForm.yearly_income} onChange={e => setEditForm({...editForm, yearly_income: e.target.value})} />
                      </div>
                    ) : (
                      <div style={{display:'flex', gap:8, fontSize:12}}>
                        <span title="Daily">${pkg.daily_income}</span> / 
                        <span title="Monthly">${pkg.monthly_income}</span> / 
                        <span title="Yearly">${pkg.yearly_income}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === pkg.id ? 
                      <Input type="number" value={editForm.ots_income} onChange={e => setEditForm({...editForm, ots_income: e.target.value})} /> 
                      : `$${pkg.ots_income}`}
                  </td>
                  <td>
                    {editingId === pkg.id ? 
                      <Input type="date" value={editForm.effective_date} onChange={e => setEditForm({...editForm, effective_date: e.target.value})} /> 
                      : new Date(pkg.effective_date).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{display:'flex', gap:8}}>
                      {editingId === pkg.id ? (
                        <>
                          <IconButton onClick={saveEdit} $color="#2ecc71"><Check size={18}/></IconButton>
                          <IconButton onClick={() => setEditingId(null)} $color="#e74c3c"><X size={18}/></IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => startEdit(pkg)} $color="#3ea6ff"><Edit2 size={16}/></IconButton>
                          <IconButton onClick={() => {/* Delete Logic */}} $color="#e74c3c"><Trash2 size={16}/></IconButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </MainContent>
    </Layout>
  );
}