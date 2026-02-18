import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Bell, X } from "lucide-react";
import api from "../api/axios";

const Banner = styled.div`
  background: linear-gradient(90deg, #3ea6ff 0%, #8e2de2 100%);
  color: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  position: relative;
  font-weight: 500;
  font-size: 14px;
`;

export default function AnnouncementBanner() {
  const [msg, setMsg] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchMsg = async () => {
      try {
        const res = await api.get("/settings/announcement");
        if (res.data.announcement_text) setMsg(res.data.announcement_text);
      } catch (err) {
        console.error("Banner error", err);
      }
    };
    fetchMsg();
  }, []);

  if (!msg || !isVisible) return null;

  return (
    <Banner>
      <Bell size={18} />
      <span>{msg}</span>
      <button 
        onClick={() => setIsVisible(false)}
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', position: 'absolute', right: 20 }}
      >
        <X size={16} />
      </button>
    </Banner>
  );
}