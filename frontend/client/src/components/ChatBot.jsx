import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import api from "../api/axios"; // 👈 Ensure this imports your configured axios instance

// --- STYLED COMPONENTS (Kept exactly the same) ---
const Wrapper = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const FloatingButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ea6ff 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 10px 25px rgba(62, 166, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1001;
  position: relative;

  &:hover { transform: scale(1.05); }
`;

const ChatWindow = styled(motion.div)`
  width: 350px;
  height: 500px;
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  transform-origin: bottom right;
`;

const Header = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, rgba(62, 166, 255, 0.1) 0%, rgba(0,0,0,0) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  gap: 15px;

  h3 { margin: 0; font-size: 16px; color: #fff; display: flex; align-items: center; gap: 8px; }
  span { font-size: 12px; color: #2ecc71; display: flex; align-items: center; gap: 4px; }
  span::before { content: ''; width: 6px; height: 6px; background: #2ecc71; border-radius: 50%; }
`;

const MessagesArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.4;
  position: relative;
  align-self: ${props => props.isUser ? "flex-end" : "flex-start"};
  background: ${props => props.isUser ? "linear-gradient(135deg, #3ea6ff 0%, #2563eb 100%)" : "rgba(255,255,255,0.05)"};
  color: ${props => props.isUser ? "#fff" : "#ddd"};
  border-bottom-right-radius: ${props => props.isUser ? "2px" : "14px"};
  border-bottom-left-radius: ${props => props.isUser ? "14px" : "2px"};
`;

const InputArea = styled.div`
  padding: 15px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 10px 15px;
  color: #fff;
  outline: none;
  font-size: 14px;
  &:focus { border-color: #3ea6ff; }
`;

const SendButton = styled.button`
  background: #3ea6ff;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: scale(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const QuickActions = styled.div`
  padding: 10px 20px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const ActionChip = styled.button`
  background: rgba(62, 166, 255, 0.1);
  border: 1px solid rgba(62, 166, 255, 0.2);
  color: #3ea6ff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #3ea6ff; color: #fff; }
`;

// --- CHAT LOGIC ---
const INITIAL_MESSAGES = [
  { id: 1, text: "Hi there! 👋 I'm powered by Google Gemini. How can I help you?", sender: "bot" }
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // ✅ UPDATED: Call Real Backend API instead of setTimeout
  const handleSend = async (text = input) => {
    if (!text.trim() || isTyping) return;

    // 1. Add User Message
    const userMsg = { id: Date.now(), text, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true); // Show typing indicator

    try {
      // 2. Call Backend API (which calls Gemini)
      // Ensure your backend has the POST /api/chat route set up!
      const res = await api.post("/chat", { message: text });
      
      const botMsg = { id: Date.now() + 1, text: res.data.reply, sender: "bot" };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = { id: Date.now() + 1, text: "Oops! I couldn't connect to the server. Please try again later.", sender: "bot" };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false); // Hide typing indicator
    }
  };

  return (
    <Wrapper>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Header>
              <div style={{ width: 35, height: 35, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#3ea6ff" />
              </div>
              <div>
                <h3>TravelRent AI <Sparkles size={14} color="#f1c40f" fill="#f1c40f"/></h3>
                <span>Powered by Gemini</span>
              </div>
              <X size={20} color="#aaa" style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
            </Header>

            <MessagesArea>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} isUser={msg.sender === "user"}>
                  {msg.text}
                </MessageBubble>
              ))}
              {isTyping && (
                <div style={{ fontSize: '12px', color: '#888', marginLeft: '10px', fontStyle: 'italic', display:'flex', alignItems:'center', gap:5 }}>
                  <Sparkles size={12} className="spin" /> Gemini is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </MessagesArea>

            <QuickActions>
              <ActionChip onClick={() => handleSend("Tell me about packages")}>📦 Packages</ActionChip>
              <ActionChip onClick={() => handleSend("How to withdraw money?")}>💰 Withdraw</ActionChip>
              <ActionChip onClick={() => handleSend("What is the X1 Plan?")}>⚡ X1 Plan</ActionChip>
            </QuickActions>

            <InputArea>
              <Input 
                placeholder="Ask anything..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isTyping}
              />
              <SendButton onClick={() => handleSend()} disabled={isTyping}>
                <Send size={18} />
              </SendButton>
            </InputArea>
          </ChatWindow>
        )}
      </AnimatePresence>

      <FloatingButton 
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </FloatingButton>
    </Wrapper>
  );
}