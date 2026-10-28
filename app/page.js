'use client';

import { useState } from 'react';
import { 
  verifyToken, getWorkers, getWorkerCode, deployWorker, 
  deleteWorker, getSubdomain, updateSubdomain 
} from './actions';

export default function Home() {
  const [token, setToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  const [workers, setWorkers] = useState([]);
  const [subdomain, setSubdomain] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');

  // Editor State
  const [editingWorker, setEditingWorker] = useState(null);
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    setStatus({ type: 'info', msg: 'Verifying...' });
    const res = await verifyToken(token);
    setStatus({ type: res.success ? 'success' : 'error', msg: res.message });
    if (res.success) loadData();
  };

  const loadData = async () => {
    setStatus({ type: 'info', msg: 'Loading Workers...' });
    const wRes = await getWorkers(token, accountId);
    if (wRes.success) {
      setWorkers(wRes.data);
      const sRes = await getSubdomain(token, accountId);
      if (sRes.success) setSubdomain(sRes.data);
      setStatus({ type: 'success', msg: `${wRes.data.length} Workers मिले` });
    } else {
      setStatus({ type: 'error', msg: wRes.message });
    }
  };

  const handleEdit = async (name) => {
    setStatus({ type: 'info', msg: 'Code लोड हो रहा है...' });
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
    setStatus({ type: res.success ? 'success' : 'error', msg: res.message });
    if (res.success) setEditingWorker(null);
  };

  const handleUpdateSubdomain = async () => {
    setStatus({ type: 'info', msg: 'Subdomain बदल रहा है...' });
    const res = await updateSubdomain(token, accountId, newSubdomain);
    setStatus({ type: res.success ? 'success' : 'error', msg: res.message });
    if (res.success) {
      setSubdomain(newSubdomain);
      setNewSubdomain('');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#f38020' }}>⚡ Cloudflare Manager (Vercel)</h1>
      
      {/* कॉन्फ़िगरेशन */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>⚙️ API Settings</h3>
        <input type="password" placeholder="API Token" value={token} onChange={e => setToken(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Account ID" value={accountId} onChange={e => setAccountId(e.target.value)} style={inputStyle} />
        <button onClick={handleVerify} style={btnStyle}>🔍 Verify & Connect</button>
      </div>

      {status.msg && (
        <div style={{ padding: '10px', borderRadius: '6px', marginBottom: '20px', background: status.type === 'error' ? '#fee2e2' : status.type === 'success' ? '#dcfce7' : '#dbeafe', color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#1e40af' }}>
          {status.msg}
        </div>
      )}

      {/* Subdomain Section */}
      {workers.length > 0 && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>🌐 Subdomain</h3>
          <p>वर्तमान: <b>{subdomain ? `*.${subdomain}.workers.dev` : 'कोई नहीं'}</b></p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input type="text" placeholder="नया Subdomain" value={newSubdomain} onChange={e => setNewSubdomain(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            <button onClick={handleUpdateSubdomain} style={btnStyle}>Update</button>
          </div>
        </div>
      )}

      {/* Workers List */}
      {workers.length > 0 && !editingWorker && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h3>⚡ Workers</h3>
          {workers.map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <div>
                <b>{w.id}</b><br />
                <a href={`https://${w.id}.${subdomain}.workers.dev`} target="_blank" style={{ fontSize: '12px', color: '#0066ff' }}>URL खोलें</a>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleEdit(w.id)} style={btnSmall}>✏️ Edit</button>
                <button onClick={async () => { if(confirm('Delete?')) { await deleteWorker(token, accountId, w.id); loadData(); } }} style={{...btnSmall, color: 'red'}}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Code Editor */}
      {editingWorker && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h3>✏️ Editing: {editingWorker}</h3>
          <textarea value={code} onChange={e => setCode(e.target.value)} style={{ width: '100%', height: '300px', fontFamily: 'monospace', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '10px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDeploy} style={btnStyle}>🚀 Save & Deploy</button>
            <button onClick={() => setEditingWorker(null)} style={{...btnStyle, background: '#ccc', color: '#333'}}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' };
const btnStyle = { background: '#f38020', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnSmall = { background: '#f0f0f0', color: '#333', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };