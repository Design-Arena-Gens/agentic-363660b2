"use client";

import { useEffect, useMemo, useState } from "react";
import { Contact, deleteContact, exportContactsToJSON, getContacts, importContactsFromJSON, saveContacts, upsertContact } from "@/lib/contacts";

export function ContactManager({ onClose }: { onClose: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  function addContact() {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    const newContact: Contact = { id: crypto.randomUUID(), name: name.trim(), phone: phone.trim() };
    upsertContact(newContact);
    setContacts(getContacts());
    setName("");
    setPhone("");
  }

  function removeContact(id: string) {
    deleteContact(id);
    setContacts(getContacts());
  }

  function handleExport() {
    const data = exportContactsToJSON();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    try {
      importContactsFromJSON(importText);
      setContacts(getContacts());
      setImportText("");
      setError(null);
    } catch (e: any) {
      setError("Invalid import data.");
    }
  }

  return (
    <div className="modalScrim" role="dialog" aria-modal="true">
      <div className="modal" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 className="h1" style={{ fontSize: 18 }}>Manage Contacts</h2>
          <button className="button secondary" onClick={onClose}>Close</button>
        </div>

        <div className="card" style={{ background: "#0b141a" }}>
          <div className="row">
            <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Phone (with country code)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="button" onClick={addContact}>Add</button>
          </div>
          {error && <div className="badge" role="alert" style={{ borderColor: "#a83b00", color: "#ffb59f", marginTop: 8 }}>{error}</div>}
        </div>

        <div className="list" style={{ maxHeight: 280, overflow: "auto" }}>
          {contacts.length === 0 && <div className="listItem" style={{ justifyContent: "center", color: "#8696a0" }}>No contacts yet</div>}
          {contacts.map(c => (
            <div key={c.id} className="listItem">
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div className="mono" style={{ color: "#8696a0", fontSize: 12 }}>{c.phone}</div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="button secondary" onClick={() => removeContact(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ background: "#0b141a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>Backup / Restore</div>
            <div className="row" style={{ gap: 8 }}>
              <button className="button secondary" onClick={handleExport}>Export JSON</button>
              <button className="button secondary" onClick={handleImport}>Import</button>
            </div>
          </div>
          <textarea className="input textarea" placeholder='Paste exported JSON here to import' value={importText} onChange={(e) => setImportText(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
