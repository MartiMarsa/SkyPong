/**
 * AddFriendButton
 *
 * Muestra el estado de relación entre el usuario logueado y el perfil que está viendo,
 * y permite enviar/cancelar solicitud, aceptar, bloquear/desbloquear.
 *
 * Props:
 *   currentUserId : string  — ID del usuario logueado
 *   targetId      : string  — ID del perfil que se está viendo
 *   csrfToken     : string  — token CSRF
 *
 * Usage en /profile/[id]/page.js:
 *   <AddFriendButton
 *     currentUserId={user.id}
 *     targetId={params.id}
 *     csrfToken={csrfToken}
 *   />
 *
 * Endpoint que consume:
 *   GET  /api/profile/friends/status/:targetId  → { status, requester_id } | null
 *   POST /api/profile/friends/:targetId                → enviar solicitud
 *   POST /api/profile/friends/:targetId/accept         → aceptar solicitud
 *   POST /api/profile/friends/:targetId/cancel         → cancelar solicitud saliente
 *   POST /api/profile/friends/:targetId/reject         → rechazar solicitud entrante
 *   DELETE /api/profile/friends/:targetId              → eliminar amigo
 *   POST /api/profile/friends/:targetId/block          → bloquear
 *   POST /api/profile/friends/:targetId/unblock        → desbloquear
 */

import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";


// ─── Relation states ──────────────────────────────────────────────────────────
// null          → no relation
// "accepted"    → friends
// "pending_out" → I sent request, waiting
// "pending_in"  → they sent request, I can accept/reject
// "blocked"     → I blocked them
// "blocked_by"  → they blocked me

// ─── Design tokens ────────────────────────────────────────────────────────────
const mono = "'Courier New', monospace";

const STATES = {
  null: {
    label: "+ AÑADIR AMIGO",
    color: "#00d2be",
    bg: "rgba(0,210,190,0.1)",
    border: "rgba(0,210,190,0.4)",
    hoverBg: "rgba(0,210,190,0.2)",
  },
  accepted: {
    label: "✓ AMIGOS",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.35)",
    hoverBg: "rgba(34,197,94,0.18)",
  },
  pending_out: {
    label: "◌ SOLICITUD ENVIADA",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    hoverBg: "rgba(245,158,11,0.15)",
  },
  pending_in: {
    label: "◈ ACEPTAR SOLICITUD",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.4)",
    hoverBg: "rgba(167,139,250,0.2)",
  },
  blocked: {
    label: "🚫 BLOQUEADO",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
    hoverBg: "rgba(239,68,68,0.15)",
  },
  blocked_by: {
    label: "— NO DISPONIBLE",
    color: "#3a5060",
    bg: "transparent",
    border: "rgba(255,255,255,0.06)",
    hoverBg: "transparent",
  },
};

// ─── Dropdown menu ────────────────────────────────────────────────────────────
function DropdownMenu({ items, onClose }) {
  useEffect(() => {
    const handler = () => onClose();
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [onClose]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "10px",
        padding: "6px",
        zIndex: 100,
        minWidth: "180px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.action(); onClose(); }}
          style={{
            display: "block",
            width: "100%",
            background: "none",
            border: "none",
            borderRadius: "7px",
            padding: "9px 14px",
            textAlign: "left",
            fontFamily: mono,
            fontSize: "11px",
            letterSpacing: "0.07em",
            color: item.danger ? "#ef4444" : "#8899aa",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = item.danger
              ? "rgba(239,68,68,0.1)"
              : "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = item.danger ? "#ef4444" : "#c9d8e0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = item.danger ? "#ef4444" : "#8899aa";
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, clear }) {
  useEffect(() => {
    const t = setTimeout(clear, 2600);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      background: type === "err" ? "#ef4444" : "#00d2be",
      color: "#050810", fontFamily: mono, fontSize: "12px", fontWeight: 700,
      letterSpacing: "0.06em", padding: "10px 18px", borderRadius: "8px",
      boxShadow: `0 4px 24px ${type === "err" ? "#ef444466" : "#00d2be66"}`,
    }}>
      {msg}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AddFriendButton({ currentUserId, targetId, csrfToken }) {
  const [relation, setRelation] = useState(undefined); // undefined = loading
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [toast, setToast] = useState(null);

  const csrf = csrfToken;
  const notify = (msg, type = "ok") => setToast({ msg, type });

  // ── Fetch current relation status ──
  const fetchStatus = useCallback(async () => {
    if (!currentUserId || !targetId || currentUserId === targetId) 
    {
        setRelation("me");
        return;
    }
    try {
      const data = await api(`/api/profile/friends/status/${targetId}`, { headers: {'x-csrf-token': csrf} });
      // data: { status: 'accepted'|'pending'|'blocked'|null, requester_id, blocked_by }
      if (!data || !data.status) {
        setRelation(null);
      } else if (data.status === "accepted") {
        setRelation("accepted");
      } else if (data.status === "pending") {
        setRelation(data.requester_id === currentUserId ? "pending_out" : "pending_in");
      } else if (data.status === "blocked") {
        setRelation(data.blocked_by === currentUserId ? "blocked" : "blocked_by");
      }
    } catch {
      setRelation(null);
    }
  }, [currentUserId, targetId, csrf]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // ── Actions ──
  const act = async (fn, msg) => {
    setBusy(true);
    setMenuOpen(false);
    try {
      await fn();
      notify(msg);
      await fetchStatus();
    } catch (e) {
      notify(e.message || "Error", "err");
    } finally {
      setBusy(false);
    }
  };

  const sendRequest   = () => act(() => api(`/api/profile/friends/${targetId}`, { method: "POST", headers: { 'Content-Type' : 'application/json', 'x-csrf-token' : csrf }, body: { userId: currentUserId, targetId: targetId} }), "Solicitud enviada");
  const cancelRequest = () => act(() => api(`/api/profile/friends/${targetId}/cancel`, { method: "POST", headers: { 'Content-Type' : 'application/json', 'x-csrf-token' : csrf }, body: { userId: currentUserId, targetId: targetId}  }), "Solicitud cancelada");
  const acceptRequest = () => act(() => api(`/api/profile/friends/${targetId}/accept`, { method: "POST", headers: { 'Content-Type' : 'application/json', 'x-csrf-token' : csrf },  body: { userId: currentUserId, targetId: targetId} }), "✓ ¡Ahora sois amigos!");
  const rejectRequest = () => act(() => api(`/api/profile/friends/${targetId}/reject`, { method: "POST", headers: { 'Content-Type' : 'application/json', 'x-csrf-token' : csrf }, body: { userId: currentUserId, targetId: targetId} }), "Solicitud rechazada");
  const removeFriend  = () => act(() => api(`/api/profile/friends/${targetId}`, { method: "DELETE", headers: { 'x-csrf-token': csrf } }), "Amigo eliminado");
  const blockUser     = () => act(() => api(`/api/profile/friends/${targetId}/block`, { method: "POST", headers: { 'Content-Type' : 'application/json', 'x-csrf-token' : csrf }, body: { userId: currentUserId, targetId: targetId} }), "Usuario bloqueado");
  const unblockUser   = () => act(() => api(`/api/profile/friends/${targetId}/unblock`, { method: "POST", headers: { 'Content-Type' : 'application/json', 'x-csrf-token' : csrf }, body: { userId: currentUserId, targetId: targetId} }), "Usuario desbloqueado");


  if (relation === "me") {
    return (
        <div style={{ fontFamily: mono, fontSize: "11px", backgroundColor:"rgb(21 29 42)", color: "#92994a", letterSpacing: "0.1em", border: "1px dashed #687d8b ", borderRadius: "5px", padding: "7px" }}>
           {"<--- It's me Mario!"}
        </div>
    );
  }
  // ── Loading ──
  if (relation === undefined) {
    return (
      <div style={{ fontFamily: mono, fontSize: "11px", color: "#3a5060", letterSpacing: "0.1em" }}>
        ...
      </div>
    );
  }

  const style = STATES[relation] || STATES[null];

  // ── Dropdown items per state ──
  const dropdownItems = {
    accepted: [
      { label: "✕ ELIMINAR AMIGO", action: removeFriend, danger: true },
      { label: "🚫 BLOQUEAR", action: blockUser, danger: true },
    ],
    pending_out: [
      { label: "✕ CANCELAR SOLICITUD", action: cancelRequest, danger: true },
      { label: "🚫 BLOQUEAR", action: blockUser, danger: true },
    ],
    pending_in: [
      { label: "✓ ACEPTAR", action: acceptRequest },
      { label: "✕ RECHAZAR", action: rejectRequest, danger: true },
      { label: "🚫 BLOQUEAR", action: blockUser, danger: true },
    ],
    blocked: [
      { label: "↩ DESBLOQUEAR", action: unblockUser },
    ],
  };

  // ── Primary click action ──
  const primaryActions = {
    null: sendRequest,
    accepted: () => setMenuOpen(o => !o),
    pending_out: () => setMenuOpen(o => !o),
    pending_in: acceptRequest,
    blocked: () => setMenuOpen(o => !o),
    blocked_by: null,
  };

  const primaryAction = primaryActions[relation];
  const hasDropdown = ["accepted", "pending_out", "pending_in", "blocked"].includes(relation);

  return (
    <div style={{ position: "relative", display: "inline-flex", gap: "4px", alignItems: "center" }}>

      {/* Main button */}
      <button
        onClick={primaryAction || undefined}
        disabled={busy || relation === "blocked_by"}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: hover && primaryAction ? style.hoverBg : style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: hasDropdown ? "8px 0 0 8px" : "8px",
          padding: "8px 16px",
          fontFamily: mono,
          fontSize: "11px",
          letterSpacing: "0.1em",
          fontWeight: 700,
          color: style.color,
          cursor: busy || !primaryAction ? "not-allowed" : "pointer",
          opacity: busy ? 0.6 : 1,
          transition: "all 0.18s",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {busy ? "..." : style.label}
      </button>

      {/* Dropdown chevron — only when there are extra actions */}
      {hasDropdown && (
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          disabled={busy}
          style={{
            background: menuOpen ? style.hoverBg : style.bg,
            border: `1px solid ${style.border}`,
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0 8px 8px 0",
            padding: "8px 10px",
            color: style.color,
            cursor: "pointer",
            fontSize: "10px",
            opacity: busy ? 0.6 : 1,
            transition: "all 0.18s",
          }}
        >
          {menuOpen ? "▲" : "▼"}
        </button>
      )}

      {/* Dropdown */}
      {menuOpen && dropdownItems[relation] && (
        <DropdownMenu
          items={dropdownItems[relation]}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} clear={() => setToast(null)} />}
    </div>
  );
}
