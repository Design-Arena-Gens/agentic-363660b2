"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";
import { WhatsAppSender } from "@/components/WhatsAppSender";
import { ContactManager } from "@/components/ContactManager";

export default function Page() {
  const [managerOpen, setManagerOpen] = useState(false);

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 className="h1">WhatsApp Name Sender</h1>
            <p className="p">Type a person's name and your message. We'll open WhatsApp with the chat ready to send.</p>
          </div>
          <button className="button secondary" onClick={() => setManagerOpen(true)} aria-label="Manage contacts">
            Manage Contacts
          </button>
        </div>
      </div>

      <WhatsAppSender />

      <p className="footer">No servers, data stays in your browser via localStorage.</p>

      {managerOpen && <ContactManager onClose={() => setManagerOpen(false)} />}
    </div>
  );
}
