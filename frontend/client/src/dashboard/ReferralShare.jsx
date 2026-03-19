import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Shield, MessageCircle, Link as LinkIcon } from "lucide-react";

const Card = styled(motion.div)`
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(62, 166, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3ea6ff;
  margin: 0 auto 20px auto;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  color: #888;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const CodeBox = styled.div`
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  label { font-size: 11px; color: #3ea6ff; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
  span { font-size: 22px; color: #fff; font-weight: 800; letter-spacing: 2px; }
`;

const CopyBtn = styled.button`
  background: rgba(62, 166, 255, 0.1);
  border: 1px solid rgba(62, 166, 255, 0.2);
  color: #3ea6ff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
  &:hover { background: rgba(62, 166, 255, 0.2); }
`;

const ShareGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
`;

const SocialBtn = styled.button`
  background: ${props => props.bg || "rgba(255,255,255,0.05)"};
  border: none;
  padding: 15px;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.2s;
  &:hover { opacity: 0.9; transform: translateY(-2px); }
`;

export default function ReferralShare() {
  const [copied, setCopied] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const referralCode = user.referral_code || "N/A";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const shareWA = () => {
    const msg = `Join TravelRent and start earning! Sign up here: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <IconCircle><Share2 size={35}/></IconCircle>
      <Title>Invite & Earn Rewards</Title>
      <Description>
        Grow the community and get rewarded. Share your unique link or code with friends to unlock referral bonuses.
      </Description>

      <CodeBox>
        <label>Your Referral Code</label>
        <span>{referralCode}</span>
        <CopyBtn onClick={() => copy(referralCode, "code")}>
          {copied === "code" ? <Check size={14}/> : <Copy size={14}/>}
          {copied === "code" ? "Copied" : "Copy Code"}
        </CopyBtn>
      </CodeBox>

      <SocialBtn bg="rgba(255,255,255,0.05)" style={{width: '100%', border: '1px solid rgba(255,255,255,0.1)'}} onClick={() => copy(referralLink, "link")}>
        <LinkIcon size={18} color="#3ea6ff"/> 
        {copied === "link" ? "Link Copied!" : "Copy Invite Link"}
      </SocialBtn>

      <ShareGrid>
        <SocialBtn bg="#25D366" onClick={shareWA}>
          <MessageCircle size={18}/> WhatsApp
        </SocialBtn>
        <SocialBtn bg="#3ea6ff" onClick={() => {
            if(navigator.share) {
                navigator.share({ title: 'Join TravelRent', url: referralLink });
            } else {
                copy(referralLink, "link");
            }
        }}>
          <Share2 size={18}/> More...
        </SocialBtn>
      </ShareGrid>
    </Card>
  );
}