import React from 'react';
import { createRoot } from 'react-dom/client';
import { selectAccount, accountStorage } from './utils/accountStorage';
import './index.css';
import './phone.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

async function start() {
  const response = await fetch('/api/me', {cache:'no-store'});
  if (!response.ok) { location.replace('/'); return; }
  const member = await response.json();
  selectAccount(member.id);
  const { dataService } = await import('./utils/dataService');
  const base = dataService.getUsers().find(u => u.role === member.role);
  const permissions = base?.permissions || {createSession:true,quickCount:true,viewDashboard:true,manageMaterials:true};
  accountStorage.setItem('currentUser', JSON.stringify({...base, ...member, permissions, password:'', isActive:true, username:member.email, department:member.department || '', createdAt: member.createdAt || new Date().toISOString()}));
  const {default:App} = await import('./App');
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
start().catch(() => {rootElement.textContent='Panel yüklenemedi. Lütfen sayfayı yenileyin.';});
