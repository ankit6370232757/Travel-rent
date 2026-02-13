import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus, Trash2, CreditCard, Upload, Image as ImageIcon } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Container = styled.div`
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px; padding: 30px; color: #fff;
`;

const Form = styled.div`
  display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;
  background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);

  .row { display: flex; gap: 15px; }

  input[type="text"] {
    flex: 1; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #fff; outline: none;
    &:focus { border-color: #3ea6ff; }
  }

  button.add-btn {
    background: #3ea6ff; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;
    font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
    &:hover { opacity: 0.9; }
  }
`;

const UploadBox = styled.label`
  border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; padding: 10px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  cursor: pointer; color: #aaa; font-size: 14px; transition: all 0.2s;
  background: rgba(0,0,0,0.2); height: 45px;
  &:hover { border-color: #3ea6ff; color: #3ea6ff; }
  input { display: none; }
`;

const PreviewImage = styled.img`
  width: 40px; height: 40px; border-radius: 4px; object-fit: cover; border: 1px solid #555;
`;

const List = styled.div`
  display: flex; flex-direction: column; gap: 10px;
`;

// 👇 CUSTOM TOGGLE SWITCH STYLES
const ToggleSwitch = styled.label`
  position: relative; display: inline-block; width: 44px; height: 24px;
  
  input { opacity: 0; width: 0; height: 0; }
  
  span {
    position: absolute; cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #444; transition: .4s; border-radius: 24px;
  }
  
  span:before {
    position: absolute; content: "";
    height: 18px; width: 18px; left: 3px; bottom: 3px;
    background-color: white; transition: .4s; border-radius: 50%;
  }
  
  input:checked + span { background-color: #2ecc71; }
  input:checked + span:before { transform: translateX(20px); }
`;

const Item = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; 
  border: 1px solid rgba(255,255,255,0.05);
  
  /* Dim item if inactive */
  opacity: ${props => props.active ? 1 : 0.5}; 
  transition: opacity 0.3s;
  
  .left { display: flex; align-items: center; gap: 15px; }

  .qr-preview {
    width: 50px; height: 50px; background: #fff; border-radius: 6px; padding: 2px;
    img { width: 100%; height: 100%; object-fit: contain; }
  }

  .info {
    h4 { margin: 0; font-size: 16px; color: #fff; display: flex; align-items: center; gap: 10px;}
    p { margin: 5px 0 0; color: #888; font-size: 13px; font-family: monospace; }
  }
  
  .actions {
    display: flex; align-items: center; gap: 15px;
  }
  
  button.delete-btn {
    background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: none; padding: 8px; 
    border-radius: 6px; cursor: pointer; transition: 0.2s;
    &:hover { background: #e74c3c; color: white; }
  }
`;

const StatusBadge = styled.span`
  font-size: 10px; padding: 2px 6px; border-radius: 4px;
  background: ${props => props.active ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
  color: ${props => props.active ? '#2ecc71' : '#e74c3c'};
  font-weight: bold; text-transform: uppercase;
`;

export default function AdminPayments() {
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState({ methodName: "", details: "", qrCode: "" });

  // 1. Fetch Methods (Includes 'status' field from DB)
  const fetchMethods = async () => {
    try {
      const res = await api.get("/admin/payment-methods");
      setMethods(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMethods(); }, []);

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

  const handleAdd = async () => {
    if(!form.methodName || !form.details) return toast.error("Please fill Name and Address");
    try {
      await api.post("/admin/payment-methods", form);
      toast.success("Payment Method Added");
      setForm({ methodName: "", details: "", qrCode: "" });
      fetchMethods();
    } catch(err) { toast.error("Failed to add"); }
  };

  // 2. Toggle Status Handler
  const handleToggle = async (id, currentStatus) => {
    try {
      // Optimistic Update (Immediate UI change)
      setMethods(methods.map(m => m.id === id ? { ...m, status: !currentStatus } : m));
      
      // API Call
      await api.put(`/admin/payment-methods/${id}/status`, { status: !currentStatus });
      toast.success(currentStatus ? "Method Deactivated" : "Method Activated");
    } catch (err) {
      toast.error("Failed to update status");
      fetchMethods(); // Revert on error
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently delete this method?")) return;
    try {
      await api.delete(`/admin/payment-methods/${id}`);
      toast.success("Deleted");
      fetchMethods();
    } catch(err) { toast.error("Failed delete"); }
  };

  return (
    <Container>
      <h2 style={{marginTop:0, display:'flex', alignItems:'center', gap:10}}>
        <CreditCard color="#3ea6ff"/> Payment Methods
      </h2>
      <p style={{color:'#888', marginBottom:20}}>Manage Deposit Options</p>

      <Form>
        <div className="row">
          <input 
            type="text" 
            placeholder="Method Name (e.g. USDT TRC20)" 
            value={form.methodName} 
            onChange={e => setForm({...form, methodName: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Wallet Address / UPI ID" 
            value={form.details} 
            onChange={e => setForm({...form, details: e.target.value})} 
          />
        </div>

        <div className="row">
           <UploadBox>
             {form.qrCode ? (
               <>
                 <PreviewImage src={form.qrCode} alt="Preview" />
                 <span style={{color:'#2ecc71'}}>Image Selected</span>
               </>
             ) : (
               <> <Upload size={18}/> Upload QR Image </>
             )}
             <input type="file" accept="image/*" onChange={handleFileChange} />
           </UploadBox>
           
           {form.qrCode && (
             <button onClick={() => setForm({...form, qrCode: ""})} style={{background:'transparent', border:'1px solid #e74c3c', color:'#e74c3c', borderRadius:8, padding:'0 15px', cursor:'pointer'}}>Clear</button>
           )}
        </div>

        <button className="add-btn" onClick={handleAdd}>
          <Plus size={18}/> Add Payment Method
        </button>
      </Form>

      <List>
        {methods.map(m => (
          <Item key={m.id} active={m.status}>
            <div className="left">
              {m.qr_code ? (
                <div className="qr-preview"><img src={m.qr_code} alt="QR" /></div>
              ) : (
                <div className="qr-preview" style={{background:'#333', display:'flex', alignItems:'center', justifyContent:'center'}}>
                   <ImageIcon size={20} color="#555"/>
                </div>
              )}

              <div className="info">
                <h4>
                  {m.method_name} 
                  <StatusBadge active={m.status}>{m.status ? 'Active' : 'Inactive'}</StatusBadge>
                </h4>
                <p>{m.details}</p>
              </div>
            </div>

            <div className="actions">
              {/* TOGGLE SWITCH */}
              <ToggleSwitch>
                <input 
                  type="checkbox" 
                  checked={m.status} 
                  onChange={() => handleToggle(m.id, m.status)} 
                />
                <span></span>
              </ToggleSwitch>

              {/* DELETE BUTTON */}
              <button className="delete-btn" onClick={() => handleDelete(m.id)}>
                <Trash2 size={16}/>
              </button>
            </div>
          </Item>
        ))}
        {methods.length === 0 && <p style={{textAlign:'center', color:'#555'}}>No payment methods added yet.</p>}
      </List>
    </Container>
  );
}