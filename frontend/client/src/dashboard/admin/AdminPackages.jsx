import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Plus, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  color: #fff;
  width: 100%;
`;

const Card = styled.div`
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 25px;
  width: 100%;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 15px;
  /* Custom Scrollbar */
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 900px; 
  
  th { text-align: left; color: #888; padding: 12px; border-bottom: 1px solid #333; text-transform: uppercase; font-size: 11px; }
  td { padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); vertical-align: middle; }
  tr:hover { background: rgba(255, 255, 255, 0.02); }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  &:focus { border-color: #3ea6ff; outline: none; }
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
  background: transparent;
  color: ${props => props.$color || '#fff'};
  border: none; padding: 6px; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

// --- MAIN COMPONENT ---
export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const initialFormState = {
    name: "", code: "", total_seats: "", ticket_price: "",
    daily_income: "", monthly_income: "", yearly_income: "",
    ots_income: "", created_at: new Date().toISOString().split('T')[0], 
    description: ""
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      const { data } = await api.get("/admin/packages");
      setPackages(data);
    } catch (err) { console.error("Fetch error", err); }
  };

  const handleAdd = async () => {
    const { name, code, ticket_price } = form;
    if (!name || !code || !ticket_price) return toast.error("Name, Code and Price required");
    
    setLoading(true);
    try {
      await api.post("/admin/packages", form);
      toast.success("Package Launched!");
      setForm(initialFormState);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (pkg) => {
    setEditingId(pkg.id);
    setEditForm({ ...pkg });
  };

const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      toast.success("Package Deleted");
      fetchPackages();
    } catch (err) {
      toast.error("Delete failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const toggleStatus = async (pkg) => {
    try {
      // Logic: Send the opposite of current is_active status
      await api.put(`/admin/packages/${pkg.id}/status`, { is_active: !pkg.is_active });
      toast.success(`Package ${!pkg.is_active ? 'Activated' : 'Deactivated'}`);
      fetchPackages();
    } catch (err) {
      toast.error("Toggle failed");
    }
  };

  const saveEdit = async () => {
    try {
      // 🟢 Destructure to remove virtual and internal fields before sending to backend
      const { 
        id, 
        created_at, 
        updated_at, 
        filled_seats, 
        current_batch, 
        referral_width_rules, // Stripping from your DB image
        ...dataToUpdate 
      } = editForm;

      await api.put(`/admin/packages/${editingId}`, dataToUpdate);
      toast.success("Package Updated");
      setEditingId(null);
      fetchPackages();
    } catch (err) {
      // Show actual DB error if possible
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <Container>
      {/* Creation Section */}
      <Card>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Create New Package</h3>
        <FormGrid>
          <FormGroup>
            <Label>Package Name</Label>
            <Input placeholder="e.g. WATER" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </FormGroup>
          <FormGroup>
            <Label>System Code</Label>
            <Input placeholder="e.g. WTR-01" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
          </FormGroup>
          <FormGroup>
            <Label>Price ($)</Label>
            <Input type="number" value={form.ticket_price} onChange={e => setForm({...form, ticket_price: e.target.value})} />
          </FormGroup>
          <FormGroup>
            <Label>Total Capacity</Label>
            <Input type="number" value={form.total_seats} onChange={e => setForm({...form, total_seats: e.target.value})} />
          </FormGroup>
          <FormGroup>
            <Label>Daily ROI</Label>
            <Input type="number" step="0.01" value={form.daily_income} onChange={e => setForm({...form, daily_income: e.target.value})} />
          </FormGroup>
          <FormGroup>
            <Label>Monthly ROI</Label>
            <Input type="number" step="0.01" value={form.monthly_income} onChange={e => setForm({...form, monthly_income: e.target.value})} />
          </FormGroup>
          <FormGroup>
            <Label>Yearly ROI</Label>
            <Input type="number" step="0.01" value={form.yearly_income} onChange={e => setForm({...form, yearly_income: e.target.value})} />
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </FormGroup>
        </FormGrid>
        <ActionButton onClick={handleAdd} disabled={loading}>
          {loading ? "Launching..." : <><Plus size={18}/> Launch Package</>}
        </ActionButton>
      </Card>

      {/* Management Section */}
      <Card>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Live Packages Management</h3>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>SL</th><th>Status</th><th>Name</th><th>Code</th><th>Amount</th>
                <th>Seat</th><th>ROI (D/M/Y)</th><th>Description</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, index) => {
                const isEditing = editingId === pkg.id;
                return (
                  <tr key={pkg.id}>
                    <td>{index + 1}</td>
                    <td>
                    {/* 🟢 Implement toggle button click */}
                    <IconButton onClick={() => toggleStatus(pkg)} $color={pkg.is_active ? '#2ecc71' : '#666'}>
                      {pkg.is_active ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                    </IconButton>
                  </td>

                    {/* Editable Cells */}
                    <td>
                      {isEditing ? <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : pkg.name}
                    </td>
                    <td>
                      {isEditing ? <Input value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} /> : <span style={{color:'#3ea6ff'}}>{pkg.code}</span>}
                    </td>
                    <td>
                      {isEditing ? <Input type="number" value={editForm.ticket_price} onChange={e => setEditForm({...editForm, ticket_price: e.target.value})} /> : `$${pkg.ticket_price}`}
                    </td>
                    <td>
                      {isEditing ? <Input type="number" value={editForm.total_seats} onChange={e => setEditForm({...editForm, total_seats: e.target.value})} /> : pkg.total_seats}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{display:'flex', gap:4}}>
                          <Input type="number" value={editForm.daily_income} onChange={e => setEditForm({...editForm, daily_income: e.target.value})} />
                          <Input type="number" value={editForm.monthly_income} onChange={e => setEditForm({...editForm, monthly_income: e.target.value})} />
                          <Input type="number" value={editForm.yearly_income} onChange={e => setEditForm({...editForm, yearly_income: e.target.value})} />
                        </div>
                      ) : (
                        `${pkg.daily_income} / ${pkg.monthly_income} / ${pkg.yearly_income}`
                      )}
                    </td>
                    <td>
                      {isEditing ? <Input value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /> : <div style={{maxWidth:150, overflow:'hidden', textOverflow:'ellipsis'}}>{pkg.description}</div>}
                    </td>
                    
                    <td>{pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : "N/A"}</td>
                    
                    <td>
                      <div style={{display:'flex', gap:8}}>
                        {isEditing ? (
                          <>
                            <IconButton onClick={saveEdit} $color="#2ecc71"><Check size={18}/></IconButton>
                            <IconButton onClick={() => setEditingId(null)} $color="#e74c3c"><X size={18}/></IconButton>
                          </>
                        ) : (
                          <>
                           <IconButton onClick={() => startEdit(pkg)} $color="#3ea6ff"><Edit2 size={16}/></IconButton>
                           <IconButton onClick={() => handleDelete(pkg.id)} $color="#e74c3c"><Trash2 size={16}/></IconButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
      </Card>
    </Container>
  );
}