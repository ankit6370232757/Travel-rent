import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus, Trash2, CreditCard, Upload, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---

const Container = styled.div`
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 30px;
  color: #fff;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;
  h2 { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.5rem; }
  p { margin: 0; color: #888; font-size: 0.9rem; }
`;

// --- FORM SECTION ---
const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2fr 150px auto; /* Responsive Grid */
  gap: 15px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus { border-color: #3ea6ff; background: rgba(0, 0, 0, 0.5); }
  &::placeholder { color: #666; }
`;

const UploadBtn = styled.label`
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: ${props => props.hasFile ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.hasFile ? '#2ecc71' : '#aaa'};
  border: 1px dashed ${props => props.hasFile ? '#2ecc71' : 'rgba(255, 255, 255, 0.2)'};
  padding: 11px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  height: 42px; /* Match Input Height */
  white-space: nowrap;
  
  &:hover { border-color: #3ea6ff; color: #3ea6ff; }
  input { display: none; }
`;

const AddButton = styled.button`
  background: #3ea6ff; color: white; border: none; 
  padding: 0 24px; height: 44px; border-radius: 10px; 
  cursor: pointer; font-weight: 600; font-size: 14px;
  display: flex; align-items: center; gap: 8px; white-space: nowrap;
  transition: opacity 0.2s;
  
  &:hover { opacity: 0.9; }
`;

// --- TABLE SECTION ---
const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(0,0,0,0.2);
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  color: #aaa;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.08);
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: #eee;
  font-size: 14px;
  vertical-align: middle;

  &.actions { text-align: right; }
`;

const QRPreview = styled.img`
  width: 36px; height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.2);
  object-fit: contain;
  background: #fff;
  padding: 2px;
`;

// --- TOGGLE SWITCH ---
const ToggleSwitch = styled.label`
  position: relative; display: inline-block; width: 40px; height: 22px;
  input { opacity: 0; width: 0; height: 0; }
  span {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background-color: #333; transition: .3s; border-radius: 24px;
    border: 1px solid #555;
  }
  span:before {
    position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px;
    background-color: white; transition: .3s; border-radius: 50%;
  }
  input:checked + span { background-color: #2ecc71; border-color: #2ecc71; }
  input:checked + span:before { transform: translateX(18px); }
`;

const StatusBadge = styled.span`
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; padding: 4px 10px; border-radius: 20px;
  font-weight: 600; letter-spacing: 0.5px;
  background: ${props => props.active ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)'};
  color: ${props => props.active ? '#2ecc71' : '#e74c3c'};
`;

const DeleteBtn = styled.button`
  background: rgba(231, 76, 60, 0.15); color: #e74c3c;
  border: none; padding: 8px; border-radius: 8px; cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #e74c3c; color: white; }
`;

export default function AdminPayments() {
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState({ methodName: "", details: "", qrCode: "" });
  const [loading, setLoading] = useState(false);

  // 1. Fetch Data
  const fetchMethods = async () => {
    try {
      const res = await api.get("/admin/payment-methods");
      setMethods(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMethods(); }, []);

  // 2. Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setForm({ ...form, qrCode: reader.result });
      };
    }
  };

  // 3. Add Method
  const handleAdd = async () => {
    if(!form.methodName || !form.details) return toast.error("Please fill Name and Address");
    setLoading(true);
    try {
      await api.post("/admin/payment-methods", form);
      toast.success("Payment Method Added Successfully");
      setForm({ methodName: "", details: "", qrCode: "" });
      fetchMethods();
    } catch(err) { 
      toast.error("Failed to add method"); 
    } finally {
      setLoading(false);
    }
  };

  // 4. Toggle Status
  const handleToggle = async (id, currentStatus) => {
    try {
      // Optimistic UI Update
      setMethods(prev => prev.map(m => m.id === id ? { ...m, status: !currentStatus } : m));
      await api.put(`/admin/payment-methods/${id}/status`, { status: !currentStatus });
      toast.success(currentStatus ? "Method Deactivated" : "Method Activated");
    } catch (err) {
      toast.error("Update failed");
      fetchMethods(); // Revert
    }
  };

  // 5. Delete Method
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this payment method?")) return;
    try {
      await api.delete(`/admin/payment-methods/${id}`);
      toast.success("Method Deleted");
      fetchMethods();
    } catch(err) { toast.error("Delete failed"); }
  };

  return (
    <Container>
      <Header>
        <div>
          <h2><CreditCard color="#3ea6ff" size={24}/> Payment Configuration</h2>
          <p>Manage deposit methods.</p>
        </div>
      </Header>

      {/* --- ADD NEW METHOD FORM --- */}
      <FormCard>
        <FormRow>
          <Input 
            placeholder="Method Name" 
            value={form.methodName} 
            onChange={e => setForm({...form, methodName: e.target.value})} 
          />
          <Input 
            placeholder="Wallet Address" 
            value={form.details} 
            onChange={e => setForm({...form, details: e.target.value})} 
          />
          
          <UploadBtn hasFile={!!form.qrCode}>
             {form.qrCode ? <CheckCircle size={16}/> : <Upload size={16}/>}
             {form.qrCode ? "Image Added" : "Upload QR"}
             <input type="file" accept="image/*" onChange={handleFileChange} />
             {form.qrCode && (
               <XCircle 
                 size={16} 
                 style={{marginLeft:5, color:'#e74c3c'}} 
                 onClick={(e) => { e.preventDefault(); setForm({...form, qrCode: ""}); }}
               />
             )}
          </UploadBtn>

          <AddButton onClick={handleAdd} disabled={loading}>
            <Plus size={18}/> {loading ? "Adding..." : "Add Method"}
          </AddButton>
        </FormRow>
      </FormCard>

      {/* --- DATA TABLE --- */}
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th style={{width: '60px'}}>SL</Th> {/* 👈 Added Header */}
              <Th>Method Name</Th>
              <Th>Payment Details</Th>
              <Th>QR Code</Th>
              <Th>Status</Th>
              <Th style={{textAlign:'right'}}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {methods.length > 0 ? (
              methods.map((m, index) => ( // 👈 Get Index here
                <tr key={m.id} style={{ opacity: m.status ? 1 : 0.5 }}>
                  <Td style={{color: '#888', fontWeight:'bold'}}>{index + 1}</Td> {/* 👈 Display S.No */}
                  <Td><strong>{m.method_name}</strong></Td>
                  <Td style={{fontFamily: 'monospace', color:'#bbb'}}>{m.details}</Td>
                  <Td>
                    {m.qr_code ? (
                      <QRPreview src={m.qr_code} alt="QR" />
                    ) : (
                      <ImageIcon size={24} color="#555" />
                    )}
                  </Td>
                  <Td>
                    <StatusBadge active={m.status}>
                      {m.status ? "Active" : "Disabled"}
                    </StatusBadge>
                  </Td>
                  <Td className="actions">
                    <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap: 15}}>
                      <ToggleSwitch>
                        <input 
                          type="checkbox" 
                          checked={m.status} 
                          onChange={() => handleToggle(m.id, m.status)} 
                        />
                        <span></span>
                      </ToggleSwitch>
                      
                      <DeleteBtn onClick={() => handleDelete(m.id)}>
                        <Trash2 size={16} />
                      </DeleteBtn>
                    </div>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="6" style={{textAlign:'center', padding:30, color:'#666'}}>
                  No payment methods configured yet.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrapper>

    </Container>
  );
}