'use client';

import { useState, useEffect } from 'react';
import {
  verifyToken, getWorkers, createWorker, getWorkerCode,
  deployWorker, deleteWorker, getSubdomain, updateSubdomain
} from './actions';

/* ---------- icons ---------- */
const PATHS = {
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
  trash: <><path d="M3 6h18" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
  rocket: <><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z" /><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0" /><path d="M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5" /></>,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  link: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
};

function Icon({ n, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[n]}
    </svg>
  );
}

function Cube({ big }) {
  return (
    <div className={`cube-wrap${big ? ' big' : ''}`} aria-hidden="true">
      <div className="cube"><i /><i /><i /><i /><i /><i /></div>
    </div>
  );
}

export default function Home() {
  const [token, setToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const [workers, setWorkers] = useState([]);
  const [subdomain, setSubdomain] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newWorkerName, setNewWorkerName] = useState('');

  const [editingWorker, setEditingWorker] = useState(null);
  const [code, setCode] = useState('');

  // Auto Load from LocalStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('cf_token');
    const savedAcc = localStorage.getItem('cf_acc');
    if (savedToken && savedAcc) {
      setToken(savedToken);
      setAccountId(savedAcc);
      autoConnect(savedToken, savedAcc);
    }
  }, []);

  // success toasts fade out on their own
  useEffect(() => {
    if (status.type !== 'success') return;
    const t = setTimeout(() => setStatus({ type: '', msg: '' }), 3500);
    return () => clearTimeout(t);
  }, [status]);

  const autoConnect = async (tk, acc) => {
    setLoading(true);
    const res = await verifyToken(tk);
    if (res.success) {
      setIsConnected(true);
      loadData(tk, acc);
    } else {
      disconnect(); // Auto clear invalid tokens
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    if (!token || !accountId) return setStatus({ type: 'error', msg: 'Token और ID डालें' });
    setLoading(true);
    const res = await verifyToken(token);
    if (res.success) {
      localStorage.setItem('cf_token', token);
      localStorage.setItem('cf_acc', accountId);
      setIsConnected(true);
      loadData(token, accountId);
    } else {
      setStatus({ type: 'error', msg: res.message });
    }
    setLoading(false);
  };

  const disconnect = () => {
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_acc');
    setIsConnected(false);
    setToken('');
    setAccountId('');
    setWorkers([]);
    setStatus({ type: '', msg: '' });
  };

  const loadData = async (tk = token, acc = accountId) => {
    setStatus({ type: 'info', msg: 'डेटा लोड हो रहा है...' });
    const wRes = await getWorkers(tk, acc);
    if (wRes.success) {
      setWorkers(wRes.data);
      const sRes = await getSubdomain(tk, acc);
      if (sRes.success) setSubdomain(sRes.data);
      setStatus({ type: '', msg: '' });
    } else {
      setStatus({ type: 'error', msg: wRes.message });
    }
  };

  const handleCreateWorker = async () => {
    if (!newWorkerName.match(/^[a-z0-9-]+$/)) return setStatus({ type: 'error', msg: 'सिर्फ lowercase, numbers, hyphens' });
    setStatus({ type: 'info', msg: 'बन रहा है...' });
    const res = await createWorker(token, accountId, newWorkerName);
    if (res.success) {
      setNewWorkerName('');
      setStatus({ type: 'success', msg: 'Worker बन गया! Domain ऑटो-एनेबल है।' });
      loadData(); // Refresh list to show new domain
    } else {
      setStatus({ type: 'error', msg: res.message });
    }
  };

  const handleEdit = async (name) => {
    setStatus({ type: 'info', msg: 'कोड लोड हो रहा है...' });
    const res = await getWorkerCode(token, accountId, name);
    if (res.success) {
      setCode(res.data);
      setEditingWorker(name);
      setStatus({ type: '', msg: '' });
    } else {
      setStatus({ type: 'error', msg: res.message });
    }
  };

  const handleDeploy = async () => {
    setStatus({ type: 'info', msg: 'Deploy हो रहा है...' });
    const res = await deployWorker(token, accountId, editingWorker, code);
    if (res.success) {
      setStatus({ type: 'success', msg: 'Deploy सफल!' });
      setEditingWorker(null);
    } else {
      setStatus({ type: 'error', msg: res.message });
    }
  };

  const handleDelete = async (name) => {
    if (!confirm(`${name} को डिलीट करें?`)) return;
    setStatus({ type: 'info', msg: 'डिलीट हो रहा है...' });
    const res = await deleteWorker(token, accountId, name);
    if (res.success) { loadData(); setStatus({ type: 'success', msg: 'डिलीट हो गया' }); }
  };

  const handleDownload = async (name) => {
    setStatus({ type: 'info', msg: 'डाउनलोड हो रहा है...' });
    const res = await getWorkerCode(token, accountId, name);
    if (res.success) {
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', msg: 'डाउनलोड शुरू!' });
    }
  };

  // UI Render
  return (
    <div className="app">

      {/* Toast */}
      {status.msg && (
        <div className={`toast ${status.type}`} onClick={() => setStatus({ type: '', msg: '' })} role="status">
          {status.msg}
        </div>
      )}

      {/* Header */}
      <div className="header">
        <div className="brand">
          <Cube />
          <div>
            <h1>APIs Cloner</h1>
            <small>Professional API & Workers Studio</small>
          </div>
        </div>
        <div className="header-right">
          <span className="owner-badge"><span className="owner-dot" />Owner <b>Anand Singh</b></span>
          {isConnected && (
            <button onClick={disconnect} className="btn logout"><Icon n="logout" size={15} />Disconnect</button>
          )}
        </div>
      </div>

      <div className="stage">
        {!isConnected ? (

          /* Login Screen */
          <div className="card">
            <Cube big />
            <h3 style={{ justifyContent: 'center' }}>Login</h3>
            <input className="input" type="password" placeholder="API Token" value={token} onChange={e => setToken(e.target.value)} autoComplete="off" />
            <input className="input" type="text" placeholder="Account ID" value={accountId} onChange={e => setAccountId(e.target.value)} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
            <button onClick={handleConnect} disabled={loading} className="btn block">
              <Icon n="lock" size={16} />{loading ? 'Connecting...' : 'Connect & Save'}
            </button>
          </div>

        ) : editingWorker ? (

          /* Editor Screen */
          <div className="card">
            <div className="editor-head">
              <h3><span className="ico"><Icon n="edit" size={16} /></span>{editingWorker}</h3>
              <button onClick={() => setEditingWorker(null)} className="btn sm" style={{ minWidth: 84 }}><Icon n="x" size={14} />Close</button>
            </div>
            <textarea
              className="code"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
            />
            <button onClick={handleDeploy} className="btn block"><Icon n="rocket" size={16} />Save & Deploy</button>
          </div>

        ) : (

          /* Dashboard Screen */
          <>
            {/* Subdomain Manager */}
            <div className="card">
              <h3><span className="ico"><Icon n="globe" size={16} /></span>Subdomain</h3>
              <p className="muted">वर्तमान: <b>{subdomain ? `*.${subdomain}.workers.dev` : 'कोई नहीं'}</b></p>
              <div className="row">
                <input className="input" type="text" placeholder="नया Subdomain" value={newSubdomain} onChange={e => setNewSubdomain(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
                <button className="btn" onClick={async () => { await updateSubdomain(token, accountId, newSubdomain); loadData(); setNewSubdomain(''); }}>Save</button>
              </div>
            </div>

            {/* Create Worker */}
            <div className="card">
              <h3><span className="ico"><Icon n="plus" size={16} /></span>New Worker</h3>
              <div className="row">
                <input className="input" type="text" placeholder="worker-name" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
                <button className="btn" onClick={handleCreateWorker}>Create</button>
              </div>
            </div>

            {/* Workers List */}
            <div className="card">
              <h3>
                <span className="ico"><Icon n="list" size={16} /></span>Your Workers
                <span className="count">{workers.length}</span>
              </h3>
              {workers.length === 0 && <p className="empty">कोई Worker नहीं है</p>}
              {workers.map(w => (
                <div key={w.id} className="worker">
                  <div className="name"><Icon n="zap" size={16} />{w.id}</div>
                  <a href={`https://${w.id}.${subdomain}.workers.dev`} target="_blank" rel="noreferrer">
                    <Icon n="link" size={13} />https://{w.id}.{subdomain}.workers.dev
                  </a>
                  <div className="actions">
                    <button onClick={() => handleEdit(w.id)} className="btn sm"><Icon n="edit" size={14} />Edit</button>
                    <button onClick={() => handleDownload(w.id)} className="btn sm blue"><Icon n="download" size={14} />Download</button>
                    <button onClick={() => handleDelete(w.id)} className="btn sm red"><Icon n="trash" size={14} />Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <footer className="app-footer">
        <span className="footer-brand">APIs Cloner</span>
        <span>Designed &amp; managed by <b>Anand Singh</b></span>
        <span className="footer-status"><i /> Professional API Studio</span>
      </footer>
    </div>
  );
}
