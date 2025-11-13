"use client";

import { useEffect, useMemo, useState } from "react";
import { Contact, exportContactsToJSON, findMatches, getContacts, normalizeForDialing, resolveByName } from "@/lib/contacts";

export function WhatsAppSender() {
  const [nameQuery, setNameQuery] = useState("");
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContacts(getContacts());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "contacts:v1") {
        setContacts(getContacts());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const suggestions = useMemo(() => {
    if (!nameQuery.trim()) return [] as Contact[];
    return findMatches(nameQuery, contacts).slice(0, 6);
  }, [nameQuery, contacts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const text = params.get("text");
    if (q) setNameQuery(q);
    if (text) setMessage(text);
  }, []);

  const canSend = nameQuery.trim().length > 0 && message.trim().length > 0;

  function sanitizeDigits(input: string): string | null {
    const digits = input.replace(/\D/g, "");
    if (!digits) return null;
    return digits;
  }

  function handlePick(contact: Contact) {
    setNameQuery(contact.name);
  }

  function buildWaLink(phoneDigits: string) {
    const text = encodeURIComponent(message);
    return `https://wa.me/${phoneDigits}?text=${text}`;
  }

  function send() {
    setError(null);
    const query = nameQuery.trim();

    // If user typed a raw phone number, allow direct send
    const maybeDigits = sanitizeDigits(query);
    if (maybeDigits && (query.startsWith("+") || maybeDigits.length >= 8)) {
      const url = buildWaLink(normalizeForDialing(maybeDigits));
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const resolved = resolveByName(query, contacts);
    if (!resolved) {
      setError("No unique contact match. Refine the name or add the contact.");
      return;
    }

    const phoneDigits = normalizeForDialing(resolved.phone);
    if (!phoneDigits) {
      setError("Contact has no valid phone number.");
      return;
    }

    const url = buildWaLink(phoneDigits);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="card" style={{ display: "grid", gap: 16 }}>
      <div className="stack">
        <label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span>Name or phone</span>
            <span className="badge">Type a name you've saved, or paste a phone</span>
          </div>
          <input className="input" placeholder="e.g. Alice, +14155550123" value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} />
        </label>
        {suggestions.length > 0 && (
          <div className="list" role="listbox" aria-label="Suggestions">
            {suggestions.map((c) => (
              <div key={c.id} className="listItem suggestion" onClick={() => handlePick(c)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="mono" style={{ color: "#8696a0", fontSize: 12 }}>{c.phone}</div>
                </div>
                <span className="badge">match</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stack">
        <label>
          <div style={{ marginBottom: 6 }}>Message</div>
          <textarea className="input textarea" placeholder="Type your message" value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
      </div>

      {error && <div className="badge" role="alert" style={{ borderColor: "#a83b00", color: "#ffb59f" }}>{error}</div>}

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="button" disabled={!canSend} onClick={send} aria-disabled={!canSend}>Send via WhatsApp</button>
      </div>
    </div>
  );
}
