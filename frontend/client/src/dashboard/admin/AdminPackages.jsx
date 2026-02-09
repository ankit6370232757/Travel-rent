import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Trash2, Edit3, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const Container = styled(motion.div)`
  display: flex; flex-direction: column; gap: 25px;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  button {
    background: #3ea6ff; color: #fff; border: none; padding: 10px 20px;
    border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600;
    &:hover { background: #2563eb; }
  }
`;

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
`;

const PlanCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px; padding: 25px; position: relative; overflow: hidden;
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); border-color: rgba(62, 166, 255, 0.3); }

  h3 { margin: 0 0 5px 0; font-size: 20px; color: #fff; }
  .price { font-size: 24px; font-weight: 800; color: #3ea6ff; margin-bottom: 15px; }
  
  .meta {
    display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;
    div { display: flex; justify-content: space-between; font-size: 13px; color: #888; }
    strong { color: #ddd; }
  }

  .actions {
    display: flex; gap: 10px; margin-top: auto;
    button {
      flex: 1; padding: 8px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;
      display: flex; align-items: center; justify-content: center; gap: 5px;
    }
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8); z-index: 200; display: flex; align-items: center; justify-content: center;
`;

const ModalContent = styled(motion.div)`
  background: #121212; border: 1px solid rgba(255,255,255,0.1); padding: 30px;
  border-radius: 24px; width: 400px; display: flex; flex-direction: column; gap: 15px;
  
  h2 { margin: 0 0 10px 0; color: #fff; }
  input {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    padding: 12px; border-radius: 10px; color: #fff; outline: none;
  }
  .btns { display: flex; gap: 10px; margin-top: 10px; }
`;

export default function AdminPackages() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [plans, setPlans] = useState([
    { id: 1, name: "Starter Plan", price: 500, roi: 5, duration: 10, total: 750, active: true },
    { id: 2, name: "Pro Investor", price: 2000, roi: 6, duration: 15, total: 3800, active: true },
  ]);

  const [newPlan, setNewPlan] = useState({ name: "", price: "", roi: "", duration: "" });

  const handleAdd = () => {
    if(!newPlan.name || !newPlan.price) return toast.error("Please fill details");
    
    const totalReturn = Number(newPlan.price) + (Number(newPlan.price) * (Number(newPlan.roi)/100) * Number(newPlan.duration));
    
    setPlans([...plans, { ...newPlan, id: Date.now(), total: totalReturn, active: true }]);
    setModalOpen(false);
    setNewPlan({ name: "", price: "", roi: "", duration: "" });
    toast.success("New Package Created! 🚀");
  };

  const handleDelete = (id) => {
    if(window.confirm("Delete this package?")) {
      setPlans(plans.filter(p => p.id !== id));
      toast.success("Package Deleted");
    }
  };

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header>
        <h3 style={{color:'#fff', display:'flex', alignItems:'center', gap:10, margin:0}}>
           <Package size={24} color="#3ea6ff"/> Investment Plans
        </h3>
        <button onClick={() => setModalOpen(true)}><Plus size={18}/> Create New</button>
      </Header>

      <Grid>
        {plans.map((plan) => (
          <PlanCard key={plan.id} layout>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <h3>{plan.name}</h3>
              {plan.active ? <CheckCircle size={16} color="#2ecc71"/> : <XCircle size={16} color="#e74c3c"/>}
            </div>
            <div className="price">${plan.price}</div>
            
            <div className="meta">
              <div><span>Daily ROI:</span> <strong>{plan.roi}%</strong></div>
              <div><span>Duration:</span> <strong>{plan.duration} Days</strong></div>
              <div><span>Total Return:</span> <strong style={{color:'#2ecc71'}}>${plan.total}</strong></div>
            </div>

            <div className="actions">
              <button style={{background:'rgba(255,255,255,0.05)', color:'#fff'}}><Edit3 size={14}/> Edit</button>
              <button onClick={() => handleDelete(plan.id)} style={{background:'rgba(231,76,60,0.2)', color:'#e74c3c'}}><Trash2 size={14}/> Delete</button>
            </div>
          </PlanCard>
        ))}
      </Grid>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <ModalOverlay initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setModalOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()} initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}>
              <h2>Create Package</h2>
              <input placeholder="Plan Name (e.g. Gold Plan)" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
              <input type="number" placeholder="Price ($)" value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} />
              <input type="number" placeholder="Daily ROI (%)" value={newPlan.roi} onChange={e => setNewPlan({...newPlan, roi: e.target.value})} />
              <input type="number" placeholder="Duration (Days)" value={newPlan.duration} onChange={e => setNewPlan({...newPlan, duration: e.target.value})} />
              
              <div className="btns">
                <button onClick={handleAdd} style={{flex:1, padding:12, background:'#3ea6ff', border:'none', borderRadius:8, color:'white', fontWeight:'bold', cursor:'pointer'}}>Create</button>
                <button onClick={() => setModalOpen(false)} style={{flex:1, padding:12, background:'transparent', border:'1px solid #333', borderRadius:8, color:'#888', cursor:'pointer'}}>Cancel</button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
}