import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus, Trash2, Package, ToggleLeft, ToggleRight, DollarSign, Users, Calendar, Activity } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Container = styled.div`
  color: #fff;
`;

const FormCard = styled.div`
  background: rgba(30, 30, 30, 0.6); backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px;
  padding: 30px; margin-bottom: 40px;
`;

const GridForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px;
  label { font-size: 12px; color: #aaa; text-transform: uppercase; font-weight: 700; }
  input {
    padding: 12px; background: rgba(0,0,0,0.3); 
    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;
    &:focus { border-color: #3ea6ff; outline: none; }
  }
`;

const ActionButton = styled.button`
  background: #3ea6ff; color: white; border: none; padding: 12px 25px; 
  border-radius: 10px; cursor: pointer; font-weight: bold;
  display: flex; align-items: center; gap: 8px;
  &:hover { opacity: 0.9; }
`;

const PackagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
`;

const PkgCard = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid ${props => props.active ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 16px; padding: 25px; position: relative; overflow: hidden;
  opacity: ${props => props.active ? 1 : 0.6}; transition: 0.3s;

  &:hover { border-color: #3ea6ff; opacity: 1; }
`;

const PkgHeader = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);

  h3 { margin: 0; font-size: 20px; color: #fff; }
  span { font-size: 24px; font-weight: 800; color: #3ea6ff; }
`;

const StatRow = styled.div`
  display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;
  color: #ccc;
  span.val { font-weight: 600; color: #fff; }
`;

const ToggleBtn = styled.button`
  background: none; border: none; cursor: pointer; color: ${props => props.active ? '#2ecc71' : '#777'};
  display: flex; align-items: center; gap: 5px; font-size: 13px;
  &:hover { color: #fff; }
`;

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State (Matches DB Columns)
  const [form, setForm] = useState({
    name: "",
    total_seats: "",
    ticket_price: "",
    daily_income: "",
    monthly_income: "",
    yearly_income: "",
    ots_income: ""
  });

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get("/admin/packages");
      setPackages(res.data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if(!form.name || !form.ticket_price) return toast.error("Name and Price are required");
    
    setLoading(true);
    try {
      await api.post("/admin/packages", form);
      toast.success("Package Created Successfully!");
      setForm({ name: "", total_seats: "", ticket_price: "", daily_income: "", monthly_income: "", yearly_income: "", ots_income: "" }); // Reset
      fetchPackages();
    } catch(err) {
      toast.error("Failed to add package");
    } finally { setLoading(false); }
  };

  const toggleStatus = async (pkg) => {
    try {
      // Toggle the boolean value
      const newStatus = !pkg.is_active; 
      await api.put(`/admin/packages/${pkg.id}/status`, { is_active: newStatus });
      toast.success(`Package ${newStatus ? 'Activated' : 'Deactivated'}`);
      fetchPackages();
    } catch(err) { toast.error("Update failed"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this package permanently?")) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      toast.success("Deleted");
      fetchPackages();
    } catch(err) { toast.error("Failed"); }
  };

  return (
    <Container>
      <h2 style={{marginTop:0, display:'flex', alignItems:'center', gap:10}}>
        <Package color="#3ea6ff"/> Package Manager
      </h2>

      {/* --- ADD PACKAGE FORM --- */}
      <FormCard>
        <h4 style={{margin:'0 0 20px 0', color:'#888'}}>Create New Investment Plan</h4>
        <GridForm>
          <InputGroup>
            <label>Package Name</label>
            <input name="name" placeholder="e.g. WATER" value={form.name} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <label>Price ($)</label>
            <input name="ticket_price" type="number" placeholder="20.00" value={form.ticket_price} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <label>Total Seats</label>
            <input name="total_seats" type="number" placeholder="180" value={form.total_seats} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <label>Daily Income</label>
            <input name="daily_income" type="number" placeholder="0.04" value={form.daily_income} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <label>Monthly Income</label>
            <input name="monthly_income" type="number" placeholder="1.50" value={form.monthly_income} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <label>Yearly Income</label>
            <input name="yearly_income" type="number" placeholder="24.00" value={form.yearly_income} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <label>OTS Income</label>
            <input name="ots_income" type="number" placeholder="24.00" value={form.ots_income} onChange={handleChange} />
          </InputGroup>
        </GridForm>
        <ActionButton onClick={handleAdd} disabled={loading}>
          {loading ? "Creating..." : <><Plus size={18}/> Create Package</>}
        </ActionButton>
      </FormCard>

      {/* --- PACKAGE LIST --- */}
      <PackagesGrid>
        {packages.map(pkg => (
          <PkgCard key={pkg.id} active={pkg.is_active}>
            <PkgHeader>
              <div>
                <h3>{pkg.name}</h3>
                <div style={{fontSize: 12, color: pkg.is_active ? '#2ecc71' : '#e74c3c', marginTop: 5}}>
                   {pkg.is_active ? "● Active" : "● Inactive"}
                </div>
              </div>
              <span>${pkg.ticket_price}</span>
            </PkgHeader>

            <StatRow><span style={{display:'flex', gap:5, alignItems:'center'}}><Users size={14}/> Seats</span> <span className="val">{pkg.total_seats}</span></StatRow>
            <StatRow><span style={{display:'flex', gap:5, alignItems:'center'}}><Activity size={14}/> Daily</span> <span className="val">${pkg.daily_income}</span></StatRow>
            <StatRow><span style={{display:'flex', gap:5, alignItems:'center'}}><Calendar size={14}/> Monthly</span> <span className="val">${pkg.monthly_income}</span></StatRow>
            <StatRow><span style={{display:'flex', gap:5, alignItems:'center'}}><DollarSign size={14}/> OTS</span> <span className="val">${pkg.ots_income}</span></StatRow>

            <div style={{marginTop: 20, display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop: 15}}>
              <ToggleBtn active={pkg.is_active} onClick={() => toggleStatus(pkg)}>
                {pkg.is_active ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
                {pkg.is_active ? "Disable" : "Enable"}
              </ToggleBtn>
              
              <button 
                onClick={() => handleDelete(pkg.id)}
                style={{background:'rgba(231, 76, 60, 0.1)', color:'#e74c3c', border:'none', padding: '5px 10px', borderRadius: 6, cursor:'pointer'}}
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </PkgCard>
        ))}
      </PackagesGrid>

    </Container>
  );
}