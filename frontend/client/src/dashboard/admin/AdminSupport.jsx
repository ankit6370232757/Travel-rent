import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import api from "../../api/axios";
import { MessageSquare, Send, CheckCircle, Search, ChevronDown, ChevronUp, History } from "lucide-react";
import toast from "react-hot-toast";

// --- STYLED COMPONENTS ---
const SectionTitle = styled.h3`
  font-size: 16px; color: #3ea6ff; margin: 30px 0 15px 0;
  display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px;
`;

const TicketCard = styled.div`
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 20px; margin-bottom: 20px;
`;

const HistoryTable = styled.table`
  width: 100%; border-collapse: collapse; margin-top: 10px;
  background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden;
  th { text-align: left; padding: 15px; background: rgba(255,255,255,0.05); color: #888; font-size: 12px; }
  td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ddd; font-size: 13px; }
  tr:hover { background: rgba(62, 166, 255, 0.05); cursor: pointer; }
`;

const SearchBox = styled.div`
  position: relative; margin-bottom: 20px;
  input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 15px 12px 40px; border-radius: 10px; color: #fff; outline: none; }
  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #666; }
`;

const ExpandedRow = styled.div`
  background: rgba(0,0,0,0.3); padding: 20px; border-radius: 0 0 12px 12px;
  border: 1px solid rgba(62, 166, 255, 0.2); border-top: none;
`;

export default function AdminSupport() {
    const [tickets, setTickets] = useState([]);
    const [replies, setReplies] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        try {
            const res = await api.get("/admin/tickets");
            setTickets(res.data);
        } catch (e) { console.error(e); }
    };

    const handleReply = async (ticketId) => {
        const replyText = replies[ticketId];
        if (!replyText || replyText.trim() === "") return toast.error("Type a reply first");

        try {
            await api.post(`/admin/reply-ticket`, { ticketId, reply: replyText });
            toast.success("Reply sent!");
            setReplies({ ...replies, [ticketId]: "" });
            fetchTickets();
        } catch (e) { toast.error("Failed to send"); }
    };

    // 🟢 Separate Open and Closed Tickets
    const openTickets = tickets.filter(t => t.status === 'OPEN');
    const closedTickets = tickets.filter(t => t.status === 'CLOSED');

    // 🕵️ Filter closed tickets by User ID
    const filteredClosed = useMemo(() => {
        return closedTickets.filter(t => 
            t.user_id.toString().includes(searchQuery) || 
            t.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tickets, searchQuery]);

    return (
        <div>
            <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={20} color="#3ea6ff"/> User Support Center
            </h2>

            {/* --- SECTION 1: PENDING QUERIES --- */}
            <SectionTitle><Send size={16}/> New Queries ({openTickets.length})</SectionTitle>
            {openTickets.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>All caught up! No new messages.</p>
            ) : (
                openTickets.map(t => (
                    <TicketCard key={t.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span><strong>{t.user_name}</strong> (ID: {t.user_id}) | <strong>Sub:</strong> {t.subject}</span>
                            <span style={{ color: '#888', fontSize: '12px' }}>{new Date(t.created_at).toLocaleString()}</span>
                        </div>
                        <p style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', color: '#ccc' }}>{t.message}</p>
                        <div style={{ marginTop: '15px' }}>
                            <textarea 
                                placeholder="Type your reply..."
                                style={{ width: '100%', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px', padding: '12px', minHeight: '60px' }}
                                value={replies[t.id] || ""}
                                onChange={(e) => setReplies({...replies, [t.id]: e.target.value})}
                            />
                            <button onClick={() => handleReply(t.id)} style={{ marginTop: '10px', background: '#3ea6ff', border: 'none', padding: '8px 20px', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Send Reply</button>
                        </div>
                    </TicketCard>
                ))
            )}

            {/* --- SECTION 2: HISTORY TABLE --- */}
            <SectionTitle><History size={16}/> Resolved History</SectionTitle>
            
            <SearchBox>
                <Search size={18} />
                <input 
                    type="text" 
                    placeholder="Search by User ID or Name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </SearchBox>

            <HistoryTable>
                <thead>
                    <tr>
                        <th>SL</th>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Subject</th>
                        <th>Message Preview</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredClosed.map((t, index) => (
                        <React.Fragment key={t.id}>
                            <tr onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                                <td>{index + 1}</td>
                                <td style={{ color: '#3ea6ff' }}>#{t.user_id}</td>
                                <td>{t.user_name}</td>
                                <td>{t.subject}</td>
                                <td style={{ color: '#888' }}>{t.message.substring(0, 30)}...</td>
                                <td>{expandedId === t.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</td>
                            </tr>
                            {expandedId === t.id && (
                                <tr>
                                    <td colSpan="6" style={{ padding: 0 }}>
                                        <ExpandedRow>
                                            <div style={{ marginBottom: '15px' }}>
                                                <strong style={{ color: '#3ea6ff', display: 'block', marginBottom: '5px' }}>User Query:</strong>
                                                <p style={{ margin: 0, color: '#ddd' }}>{t.message}</p>
                                            </div>
                                            <div style={{ padding: '12px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px', borderLeft: '3px solid #2ecc71' }}>
                                                <strong style={{ color: '#2ecc71', display: 'block', marginBottom: '5px' }}>Your Reply:</strong>
                                                <p style={{ margin: 0, color: '#fff' }}>{t.admin_reply || "No reply recorded"}</p>
                                            </div>
                                        </ExpandedRow>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </HistoryTable>
            {filteredClosed.length === 0 && <p style={{textAlign:'center', color:'#555', marginTop:'20px'}}>No history records found.</p>}
        </div>
    );
}