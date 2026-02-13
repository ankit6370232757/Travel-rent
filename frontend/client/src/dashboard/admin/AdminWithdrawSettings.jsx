import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus, Trash2, CreditCard, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Container = styled.div`
  background: rgba(30, 30, 30, 0.6); backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px;
  padding: 30px; color: #fff;
`;

const Form = styled.div`
  display: flex; gap: 15px; margin-bottom: 30px;
  background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px;
  
  input {
    flex: 1; padding: 12px; background: rgba(0,0,0,0.3); 
    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;
  }
  button {
    background: #3ea6ff; color: white; border: none; padding: 0 20px; 
    border-radius: 8px; cursor: pointer; font-weight: bold;
  }
`;

const Item = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; 
  margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05);
  
  opacity: ${props => props.active ? 1 : 0.5};
`;

const Badge = styled.span`
  font-size: 10px; padding: 4px 8px; border-radius: 4px; margin-left: 10px;
  background: ${props => props.active ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
  color: ${props => props.active ? '#2ecc71' : '#e74c3c'};
`;

export default function AdminWithdrawSettings() {
  const [methods, setMethods] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => { fetchMethods(); }, []);

  const fetchMethods = async () => {
    try {
      const res = await api.get("/admin/withdrawal-methods");
      setMethods(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async () => {
    if(!name) return toast.error("Enter Method Name");
    try {
      await api.post("/admin/withdrawal-methods", { methodName: name });
      toast.success("Added!");
      setName("");
      fetchMethods();
    } catch(err) { toast.error("Failed"); }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.put(`/admin/withdrawal-methods/${id}/status`, { status: !currentStatus });
      fetchMethods();
    } catch(err) { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this method?")) return;
    try {
      await api.delete(`/admin/withdrawal-methods/${id}`);
      toast.success("Deleted");
      fetchMethods();
    } catch(err) { toast.error("Failed"); }
  };

  return (
    <Container>
      <h2 style={{marginTop:0, display:'flex', alignItems:'center', gap:10}}>
        <CreditCard color="#3ea6ff"/> Withdrawal Options
      </h2>
      <p style={{color:'#888', marginBottom:20}}>Define which methods users can use to withdraw funds.</p>

      <Form>
        <input 
          placeholder="Method Name (e.g. PayPal, Bank Transfer, USDT)" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <button onClick={handleAdd}><Plus size={18}/> Add Method</button>
      </Form>

      <div>
        {methods.map(m => (
          <Item key={m.id} active={m.status}>
            <div>
              <strong>{m.method_name}</strong>
              <Badge active={m.status}>{m.status ? "Active" : "Disabled"}</Badge>
            </div>
            
            <div style={{display:'flex', gap: 10}}>
              <button 
                onClick={() => handleToggle(m.id, m.status)}
                style={{background:'none', border:'none', cursor:'pointer', color:'#fff'}}
              >
                {m.status ? <ToggleRight size={24} color="#2ecc71"/> : <ToggleLeft size={24} color="#555"/>}
              </button>
              
              <button 
                onClick={() => handleDelete(m.id)}
                style={{background:'rgba(231, 76, 60, 0.2)', border:'none', borderRadius: 6, padding: 8, cursor:'pointer', color:'#e74c3c'}}
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </Item>
        ))}
      </div>
    </Container>
  );
}