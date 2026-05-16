import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://taskflow-backend-xbl8.onrender.com/api';
/* ─── Google Fonts injected once ─── */
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap';
document.head.appendChild(fontLink);

/* ─── Inject global styles ─── */
const styleEl = document.createElement('style');
styleEl.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root {
    height: 100%;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f5f7fa;
    color: #1a1f36;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #dde2ee; border-radius: 10px; }

  /* ── Sidebar ── */
  .tf-sidebar {
    width: 220px; min-height: 100vh; background: #fff;
    border-right: 1px solid #eaecf3;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 10;
  }
  .tf-logo {
    padding: 22px 20px 18px;
    border-bottom: 1px solid #eaecf3;
    display: flex; align-items: center; gap: 10px;
  }
  .tf-logo-mark {
    width: 32px; height: 32px; border-radius: 9px;
    background: linear-gradient(135deg, #635bff, #4f46e5);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-family: 'Outfit', sans-serif;
    font-size: 16px; font-weight: 700; letter-spacing: -0.5px;
    flex-shrink: 0;
  }
  .tf-logo-text {
    font-family: 'Outfit', sans-serif;
    font-size: 17px; font-weight: 700;
    color: #1a1f36; letter-spacing: -0.3px;
  }
  .nav-section {
    padding: 16px 12px 4px;
    font-size: 10px; font-weight: 600; color: #a0aabb;
    letter-spacing: 0.8px; text-transform: uppercase;
  }
  .nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 12px; margin: 1px 8px;
    border-radius: 8px; cursor: pointer;
    color: #5a6279; font-size: 13.5px; font-weight: 500;
    transition: background 0.15s, color 0.15s;
    user-select: none;
  }
  .nav-item:hover { background: #f5f7fa; color: #1a1f36; }
  .nav-item.active { background: #eeeeff; color: #635bff; }
  .nav-item svg { opacity: 0.75; flex-shrink: 0; }
  .nav-item.active svg { opacity: 1; }
  .nav-badge {
    margin-left: auto; background: #e56f4a; color: #fff;
    font-size: 10px; font-weight: 700; padding: 2px 6px;
    border-radius: 20px; min-width: 18px; text-align: center;
  }
  .tf-user-footer {
    margin-top: auto; padding: 12px;
    border-top: 1px solid #eaecf3;
  }
  .user-pill {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px; cursor: pointer;
    transition: background 0.15s;
  }
  .user-pill:hover { background: #f5f7fa; }
  .avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
  }
  .user-name { font-size: 13px; font-weight: 600; color: #1a1f36; }
  .user-role { font-size: 11px; color: #8792a2; }

  /* ── Main layout ── */
  .tf-main { margin-left: 220px; min-height: 100vh; display: flex; flex-direction: column; }
  .tf-topbar {
    position: sticky; top: 0; z-index: 9;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #eaecf3;
    height: 56px; padding: 0 28px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .topbar-title {
    font-family: 'Outfit', sans-serif;
    font-size: 17px; font-weight: 700; color: #1a1f36; letter-spacing: -0.3px;
  }
  .topbar-actions { display: flex; align-items: center; gap: 10px; }
  .btn-primary {
    background: #635bff; color: #fff; border: none;
    padding: 8px 16px; border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: background 0.15s, transform 0.1s;
  }
  .btn-primary:hover { background: #4f46e5; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-ghost {
    background: #fff; color: #5a6279; border: 1px solid #e0e4ef;
    padding: 7px 14px; border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.15s;
  }
  .btn-ghost:hover { background: #f5f7fa; }
  .btn-danger {
    background: #fff0ee; color: #c94916; border: none;
    padding: 6px 12px; border-radius: 7px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    transition: background 0.15s;
  }
  .btn-danger:hover { background: #fde4dc; }
  .tf-content { padding: 28px; flex: 1; }

  /* ── Auth ── */
  .auth-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f0ff 0%, #fff 60%, #f0f9ff 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .auth-card {
    background: #fff; padding: 44px 40px;
    border-radius: 20px; width: 400px;
    border: 1px solid #eaecf3;
    box-shadow: 0 8px 40px rgba(99,91,255,0.08);
    display: flex; flex-direction: column; gap: 14px;
  }
  .auth-logo {
    display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
  }
  .auth-title {
    font-family: 'Outfit', sans-serif;
    font-size: 26px; font-weight: 700; color: #1a1f36; letter-spacing: -0.5px;
  }
  .auth-sub { font-size: 14px; color: #8792a2; margin-bottom: 6px; }
  .auth-label { font-size: 12px; font-weight: 600; color: #5a6279; margin-bottom: 4px; display: block; }
  .auth-field { display: flex; flex-direction: column; gap: 4px; }
  .auth-input {
    padding: 11px 14px; border-radius: 9px;
    border: 1.5px solid #e0e4ef; font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1a1f36; outline: none; transition: border 0.15s;
    background: #fafbfc;
  }
  .auth-input:focus { border-color: #635bff; background: #fff; }
  .auth-select {
    padding: 11px 14px; border-radius: 9px;
    border: 1.5px solid #e0e4ef; font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1a1f36; outline: none; background: #fafbfc; cursor: pointer;
  }
  .auth-error {
    background: #fff0ee; color: #c94916;
    padding: 10px 14px; border-radius: 8px;
    font-size: 13px; font-weight: 500;
  }
  .auth-toggle {
    text-align: center; color: #635bff; cursor: pointer;
    font-size: 13px; font-weight: 500; margin-top: 4px;
  }
  .auth-toggle:hover { text-decoration: underline; }

  /* ── Stat cards ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .stat-card {
    background: #fff; border: 1px solid #eaecf3;
    border-radius: 12px; padding: 18px 20px;
    position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  }
  .stat-card.purple::before { background: #635bff; }
  .stat-card.green::before { background: #12b886; }
  .stat-card.orange::before { background: #f59f00; }
  .stat-card.red::before { background: #e56f4a; }
  .stat-icon {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 12px; font-size: 17px;
  }
  .stat-label { font-size: 12px; font-weight: 600; color: #8792a2; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-value {
    font-family: 'Outfit', sans-serif;
    font-size: 30px; font-weight: 700; color: #1a1f36; letter-spacing: -1px; line-height: 1;
  }
  .stat-sub { font-size: 12px; margin-top: 6px; }
  .stat-up { color: #12b886; font-weight: 500; }
  .stat-down { color: #e56f4a; font-weight: 500; }
  .stat-neutral { color: #8792a2; }

  /* ── Cards ── */
  .card {
    background: #fff; border: 1px solid #eaecf3;
    border-radius: 12px; padding: 20px 22px;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 15px; font-weight: 700; color: #1a1f36; letter-spacing: -0.2px;
  }
  .card-link { font-size: 12px; color: #635bff; cursor: pointer; font-weight: 600; }
  .card-link:hover { text-decoration: underline; }
  .two-col { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
  .three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  /* ── Badges ── */
  .badge {
    display: inline-block; padding: 3px 9px;
    border-radius: 20px; font-size: 11px; font-weight: 600;
    white-space: nowrap;
  }
  .badge-done { background: #e6f9f2; color: #0ca678; }
  .badge-prog { background: #fff3bf; color: #a07800; }
  .badge-todo { background: #eeeeff; color: #635bff; }
  .badge-high { background: #fff0ee; color: #c94916; }
  .badge-med  { background: #fff3bf; color: #a07800; }
  .badge-low  { background: #e6f9f2; color: #0ca678; }
  .badge-admin { background: #eeeeff; color: #635bff; }
  .badge-member { background: #f0f9ff; color: #1971c2; }
  .badge-unread { background: #e56f4a; color: #fff; }

  /* ── Task rows ── */
  .task-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 0; border-bottom: 1px solid #f2f4f8;
  }
  .task-row:last-child { border-bottom: none; }
  .check-circle {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid #dde2ee; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .check-circle.done { background: #12b886; border-color: #12b886; }
  .task-name { flex: 1; font-size: 13.5px; color: #1a1f36; font-weight: 500; }
  .task-name.done-style { color: #a0aabb; text-decoration: line-through; font-weight: 400; }
  .task-date { font-size: 11px; color: #a0aabb; }

  /* ── Project cards ── */
  .proj-card {
    background: #fff; border: 1px solid #eaecf3;
    border-radius: 12px; padding: 18px 20px;
    position: relative; overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .proj-card:hover { box-shadow: 0 4px 20px rgba(99,91,255,0.1); transform: translateY(-1px); }
  .proj-card-top { height: 4px; position: absolute; top: 0; left: 0; right: 0; border-radius: 12px 12px 0 0; }
  .proj-name {
    font-family: 'Outfit', sans-serif;
    font-size: 15px; font-weight: 700; color: #1a1f36;
    margin-bottom: 4px; margin-top: 8px;
  }
  .proj-desc { font-size: 12px; color: #8792a2; margin-bottom: 14px; }
  .proj-footer { display: flex; align-items: center; justify-content: space-between; }
  .proj-tasks { font-size: 12px; color: #8792a2; }
  .prog-bar { height: 4px; background: #eaecf3; border-radius: 10px; margin-top: 10px; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 10px; transition: width 0.3s; }

  /* ── Full task cards ── */
  .task-card {
    display: flex; align-items: center; gap: 12px;
    background: #fff; border: 1px solid #eaecf3;
    border-radius: 10px; padding: 13px 16px; margin-bottom: 8px;
    transition: box-shadow 0.15s;
  }
  .task-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  .task-card-left { flex: 1; display: flex; align-items: center; gap: 10px; }
  .task-card-right { display: flex; align-items: center; gap: 8px; }
  .status-select {
    padding: 5px 10px; border-radius: 7px;
    border: 1px solid #e0e4ef; font-size: 12px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1a1f36; background: #fafbfc; cursor: pointer; outline: none;
  }

  /* ── Team ── */
  .team-card {
    background: #fff; border: 1px solid #eaecf3;
    border-radius: 12px; padding: 20px;
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 8px;
    transition: box-shadow 0.2s;
  }
  .team-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
  .team-name { font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700; color: #1a1f36; }
  .team-email { font-size: 12px; color: #8792a2; }
  .team-tasks { font-size: 12px; color: #635bff; font-weight: 600; margin-top: 4px; }

  /* ── Activity feed ── */
  .feed-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f2f4f8; }
  .feed-item:last-child { border-bottom: none; }
  .feed-icon-wrap {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 15px;
  }
  .feed-text { font-size: 13px; color: #1a1f36; line-height: 1.5; }
  .feed-text strong { font-weight: 600; }
  .feed-meta { font-size: 11px; color: #a0aabb; margin-top: 2px; }
  .feed-divider {
    display: flex; align-items: center; gap: 10px;
    margin: 8px 0;
  }
  .feed-divider-line { flex: 1; height: 1px; background: #f2f4f8; }
  .feed-divider-text { font-size: 11px; color: #c7cdd9; font-weight: 600; letter-spacing: 0.5px; }

  /* ── Notifications ── */
  .notif-card {
    display: flex; gap: 12px; align-items: flex-start;
    background: #fff; border: 1px solid #eaecf3;
    border-radius: 10px; padding: 14px 16px; margin-bottom: 8px;
    position: relative;
  }
  .notif-card.unread { border-color: #d4d0ff; background: #f8f8ff; }
  .notif-unread-dot {
    position: absolute; top: 14px; right: 14px;
    width: 7px; height: 7px; border-radius: 50%; background: #635bff;
  }
  .notif-icon-wrap {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 18px;
  }
  .notif-title { font-size: 13.5px; font-weight: 600; color: #1a1f36; }
  .notif-desc { font-size: 12px; color: #5a6279; margin-top: 3px; line-height: 1.5; }
  .notif-time { font-size: 11px; color: #a0aabb; margin-top: 5px; }

  /* ── Form ── */
  .inline-form {
    background: #fff; border: 1px solid #eaecf3;
    border-radius: 12px; padding: 20px 22px;
    margin-bottom: 20px; display: grid;
    grid-template-columns: 1fr 1fr; gap: 12px;
  }
  .inline-form input, .inline-form select {
    padding: 9px 13px; border-radius: 8px;
    border: 1.5px solid #e0e4ef; font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1a1f36; outline: none; background: #fafbfc;
    transition: border 0.15s; width: 100%;
  }
  .inline-form input:focus, .inline-form select:focus { border-color: #635bff; background: #fff; }
  .inline-form input[type="color"] { padding: 4px 8px; cursor: pointer; height: 42px; }
  .form-full { grid-column: 1 / -1; }

  /* ── Page header ── */
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .page-title {
    font-family: 'Outfit', sans-serif;
    font-size: 22px; font-weight: 700; color: #1a1f36; letter-spacing: -0.5px;
  }
  .page-sub { font-size: 13px; color: #8792a2; margin-top: 2px; }

  /* ── Empty state ── */
  .empty-state {
    text-align: center; padding: 48px 20px;
    color: #a0aabb; font-size: 14px;
  }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-title {
    font-family: 'Outfit', sans-serif;
    font-size: 16px; font-weight: 700; color: #5a6279; margin-bottom: 6px;
  }

  /* ── Greeting banner ── */
  .greeting-banner {
    background: linear-gradient(135deg, #635bff 0%, #4f46e5 100%);
    border-radius: 14px; padding: 22px 26px;
    margin-bottom: 22px; color: #fff;
    display: flex; align-items: center; justify-content: space-between;
  }
  .greeting-text {
    font-family: 'Outfit', sans-serif;
    font-size: 20px; font-weight: 700; letter-spacing: -0.3px;
  }
  .greeting-sub { font-size: 13px; opacity: 0.8; margin-top: 3px; }
  .greeting-emoji { font-size: 40px; line-height: 1; }

  /* ── Notification bell ── */
  .bell-btn {
    position: relative; width: 36px; height: 36px;
    border-radius: 9px; border: 1px solid #e0e4ef;
    background: #fff; display: flex; align-items: center;
    justify-content: center; cursor: pointer; font-size: 16px;
    transition: background 0.15s;
  }
  .bell-btn:hover { background: #f5f7fa; }
  .bell-dot {
    position: absolute; top: 7px; right: 7px;
    width: 7px; height: 7px; border-radius: 50%;
    background: #e56f4a; border: 2px solid #fff;
  }
`;
document.head.appendChild(styleEl);

/* ─── API helper ─── */
const api = (token) =>
  axios.create({ baseURL: API, headers: { Authorization: `Bearer ${token}` } });

/* ─── Avatar colors ─── */
const AV_COLORS = ['#635bff','#12b886','#e56f4a','#f59f00','#1971c2','#a61e4d'];
const avatarColor = (str = '') => AV_COLORS[str.charCodeAt(0) % AV_COLORS.length];

/* ─── Icons (inline SVG, tiny) ─── */
const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const icons = {
    dashboard: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    folder:    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>,
    task:      <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    team:      <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>,
    activity:  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    bell:      <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    settings:  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    logout:    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    plus:      <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    check:     <svg width={size} height={size} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    trend_up:  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  };
  return icons[name] || null;
};

/* ═══════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════ */
function Sidebar({ page, setPage, user, logout }) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'projects',  label: 'Projects',  icon: 'folder' },
    { key: 'tasks',     label: 'Tasks',     icon: 'task' },
  ];
  const moreItems = [
    { key: 'activity',      label: 'Activity',      icon: 'activity' },
    { key: 'notifications', label: 'Notifications', icon: 'bell', badge: 3 },
    ...(user?.role === 'Admin' ? [{ key: 'team', label: 'Team', icon: 'team' }] : []),
  ];

  return (
    <div className="tf-sidebar">
      <div className="tf-logo">
        <div className="tf-logo-mark">T</div>
        <span className="tf-logo-text">TaskFlow</span>
      </div>

      <div style={{ padding: '8px 0', flex: 1 }}>
        <div className="nav-section">Main</div>
        {navItems.map(n => (
          <div key={n.key} className={`nav-item ${page === n.key ? 'active' : ''}`} onClick={() => setPage(n.key)}>
            <Icon name={n.icon} size={16} color={page === n.key ? '#635bff' : '#5a6279'} />
            {n.label}
          </div>
        ))}
        <div className="nav-section" style={{ marginTop: 12 }}>More</div>
        {moreItems.map(n => (
          <div key={n.key} className={`nav-item ${page === n.key ? 'active' : ''}`} onClick={() => setPage(n.key)}>
            <Icon name={n.icon} size={16} color={page === n.key ? '#635bff' : '#5a6279'} />
            {n.label}
            {n.badge && <span className="nav-badge">{n.badge}</span>}
          </div>
        ))}
      </div>

      <div className="tf-user-footer">
        <div className="user-pill">
          <div className="avatar" style={{ background: avatarColor(user?.name) }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <div className="nav-item" onClick={logout} style={{ marginTop: 4 }}>
          <Icon name="logout" size={15} color="#e56f4a" />
          <span style={{ color: '#e56f4a' }}>Logout</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════ */
function DashboardPage({ user, tasks, projects }) {
  const done     = tasks.filter(t => t.status === 'Done').length;
  const inProg   = tasks.filter(t => t.status === 'In Progress').length;
  const overdue  = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done').length;

  const hour = new Date().getHours();
  const greet = hour < 12 ? '☀️ Good morning' : hour < 17 ? '👋 Good afternoon' : '🌙 Good evening';

  return (
    <div>
      <div className="greeting-banner">
        <div>
          <div className="greeting-text">{greet}, {user?.name?.split(' ')[0]}!</div>
          <div className="greeting-sub">Here's what's happening with your projects today.</div>
        </div>
        <div className="greeting-emoji">📊</div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: '📋', cls: 'purple', sub: `Across ${projects.length} projects`, subCls: 'stat-neutral' },
          { label: 'Completed',   value: done,         icon: '✅', cls: 'green',  sub: tasks.length ? `${Math.round(done/tasks.length*100)}% completion rate` : '—', subCls: 'stat-up' },
          { label: 'In Progress', value: inProg,       icon: '🔄', cls: 'orange', sub: 'Currently active', subCls: 'stat-neutral' },
          { label: 'Overdue',     value: overdue,      icon: '⚠️', cls: 'red',    sub: overdue ? 'Needs attention' : 'All on track!', subCls: overdue ? 'stat-down' : 'stat-up' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-icon" style={{ background: s.cls === 'purple' ? '#eeeeff' : s.cls === 'green' ? '#e6f9f2' : s.cls === 'orange' ? '#fff3bf' : '#fff0ee' }}>
              {s.icon}
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-sub ${s.subCls}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Tasks</span>
            <span className="card-link">View all →</span>
          </div>
          {tasks.length === 0 && <div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">No tasks yet</div></div>}
          {tasks.slice(0, 6).map(t => (
            <div key={t.id} className="task-row">
              <div className={`check-circle ${t.status === 'Done' ? 'done' : ''}`}>
                {t.status === 'Done' && <Icon name="check" size={10} color="#fff" />}
              </div>
              <span className={`task-name ${t.status === 'Done' ? 'done-style' : ''}`}>{t.title}</span>
              <span className={`badge badge-${t.priority === 'High' ? 'high' : t.priority === 'Med' ? 'med' : 'low'}`}>{t.priority}</span>
              <span className={`badge badge-${t.status === 'Done' ? 'done' : t.status === 'In Progress' ? 'prog' : 'todo'}`}>{t.status}</span>
            </div>
          ))}
        </div>

        {/* Projects overview */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Projects</span>
            <span className="card-link">Manage →</span>
          </div>
          {projects.length === 0 && <div className="empty-state"><div className="empty-icon">📁</div><div className="empty-title">No projects yet</div></div>}
          {projects.map(p => {
            const pTasks  = tasks.filter(t => t.project_id === p.id);
            const pDone   = pTasks.filter(t => t.status === 'Done').length;
            const pct     = pTasks.length ? Math.round(pDone / pTasks.length * 100) : 0;
            return (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color || '#635bff' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1f36' }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#8792a2' }}>{pTasks.length} tasks · {pct}%</span>
                </div>
                <div className="prog-bar" style={{ marginTop: 6 }}>
                  <div className="prog-fill" style={{ width: `${pct}%`, background: p.color || '#635bff' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PROJECTS PAGE
═══════════════════════════════════════════ */
function ProjectsPage({ user, projects, tasks, token, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', desc: '', color: '#635bff' });

  const create = async () => {
    if (!form.name.trim()) return;
    await api(token).post('/projects', form);
    setForm({ name: '', desc: '', color: '#635bff' });
    setShowForm(false);
    onRefresh();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    await api(token).delete(`/projects/${id}`);
    onRefresh();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} total</div>
        </div>
        {user?.role === 'Admin' && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={14} color="#fff" /> New Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="inline-form">
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6279', display: 'block', marginBottom: 4 }}>Project Name *</label>
            <input placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6279', display: 'block', marginBottom: 4 }}>Description</label>
            <input placeholder="Short description..." value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6279', display: 'block', marginBottom: 4 }}>Color</label>
            <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button className="btn-primary" onClick={create}>Create Project</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <div className="empty-title">No projects yet</div>
          <div>Create your first project to get started.</div>
        </div>
      )}

      <div className="three-col">
        {projects.map(p => {
          const pTasks = tasks.filter(t => t.project_id === p.id);
          const pDone  = pTasks.filter(t => t.status === 'Done').length;
          const pct    = pTasks.length ? Math.round(pDone / pTasks.length * 100) : 0;
          return (
            <div key={p.id} className="proj-card">
              <div className="proj-card-top" style={{ background: p.color || '#635bff' }} />
              <div className="proj-name">{p.name}</div>
              <div className="proj-desc">{p.description || 'No description'}</div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: `${pct}%`, background: p.color || '#635bff' }} />
              </div>
              <div className="proj-footer" style={{ marginTop: 10 }}>
                <span className="proj-tasks">{pTasks.length} tasks · {pct}% done</span>
                {user?.role === 'Admin' && <button className="btn-danger" onClick={() => del(p.id)}>Delete</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TASKS PAGE
═══════════════════════════════════════════ */
function TasksPage({ user, tasks, projects, users, token, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState('All');
  const [form, setForm]         = useState({ title: '', project_id: '', assignee_id: '', priority: 'Med', due_date: '' });

  const create = async () => {
    if (!form.title.trim()) return;
    await api(token).post('/tasks', form);
    setForm({ title: '', project_id: '', assignee_id: '', priority: 'Med', due_date: '' });
    setShowForm(false);
    onRefresh();
  };

  const updateStatus = async (id, status) => {
    await api(token).patch(`/tasks/${id}`, { status });
    onRefresh();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api(token).delete(`/tasks/${id}`);
    onRefresh();
  };

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-sub">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All','To Do','In Progress','Done'].map(f => (
            <button key={f}
              style={{ padding: '6px 13px', borderRadius: 7, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filter === f ? '#635bff' : '#fff',
                color: filter === f ? '#fff' : '#5a6279',
                borderColor: filter === f ? '#635bff' : '#e0e4ef' }}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={14} color="#fff" /> New Task
          </button>
        </div>
      </div>

      {showForm && (
        <div className="inline-form">
          <div className="form-full">
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6279', display: 'block', marginBottom: 4 }}>Task Title *</label>
            <input placeholder="What needs to be done?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6279', display: 'block', marginBottom: 4 }}>Project</label>
            <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {user?.role === 'Admin' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6279', display: 'block', marginBottom: 4 }}>Assign To</label>
              <select value={form.assignee_id} onChange={e => setForm({ ...form, assignee_id: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6279', display: 'block', marginBottom: 4 }}>Priority</label>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Med">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#5a6279', display: 'block', marginBottom: 4 }}>Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="form-full" style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={create}>Create Task</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-title">{filter === 'All' ? 'No tasks yet' : `No "${filter}" tasks`}</div>
          <div>Create your first task to get started.</div>
        </div>
      )}

      {filtered.map(t => {
        const proj    = projects.find(p => p.id === t.project_id);
        const isOver  = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done';
        return (
          <div key={t.id} className="task-card" style={{ borderLeft: `3px solid ${proj?.color || '#635bff'}` }}>
            <div className="check-circle" style={{ cursor: 'pointer' }} onClick={() => updateStatus(t.id, t.status === 'Done' ? 'To Do' : 'Done')}
              className={`check-circle ${t.status === 'Done' ? 'done' : ''}`}>
              {t.status === 'Done' && <Icon name="check" size={10} color="#fff" />}
            </div>
            <div className="task-card-left">
              <span className={`task-name ${t.status === 'Done' ? 'done-style' : ''}`}>{t.title}</span>
              {proj && <span style={{ fontSize: 11, background: '#f5f7fa', color: '#635bff', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{proj.name}</span>}
              {t.due_date && <span className="task-date" style={{ color: isOver ? '#e56f4a' : '#a0aabb' }}>
                {isOver ? '⚠️ ' : '📅 '}{new Date(t.due_date).toLocaleDateString()}
              </span>}
            </div>
            <div className="task-card-right">
              <span className={`badge badge-${t.priority === 'High' ? 'high' : t.priority === 'Med' ? 'med' : 'low'}`}>{t.priority}</span>
              <select className="status-select" value={t.status} onChange={e => updateStatus(t.id, e.target.value)}>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
              {user?.role === 'Admin' && <button className="btn-danger" onClick={() => del(t.id)}>🗑</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TEAM PAGE
═══════════════════════════════════════════ */
function TeamPage({ users, tasks }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Team</div>
          <div className="page-sub">{users.length} member{users.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      {users.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">No team members yet</div>
        </div>
      )}
      <div className="three-col">
        {users.map(u => (
          <div key={u.id} className="team-card">
            <div className="avatar" style={{ background: avatarColor(u.name), width: 48, height: 48, fontSize: 18 }}>
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div className="team-name">{u.name}</div>
            <div className="team-email">{u.email}</div>
            <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>{u.role}</span>
            <div className="team-tasks">
              {tasks.filter(t => String(t.assignee_id) === String(u.id)).length} tasks assigned
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ACTIVITY FEED PAGE
═══════════════════════════════════════════ */
function ActivityPage({ tasks, projects, users }) {
  const events = [
    ...tasks.slice(0, 3).map((t, i) => ({
      type: 'task_done', task: t,
      time: `${i * 30 + 5} minutes ago`, user: users[0],
    })),
    ...projects.slice(0, 2).map((p, i) => ({
      type: 'project_created', project: p,
      time: `${i + 1} hour${i ? 's' : ''} ago`, user: users[0],
    })),
    { type: 'member_joined', user: users[1] || { name: 'Team Member' }, time: '3 hours ago' },
  ].filter(Boolean);

  const iconMap = {
    task_done:       { bg: '#e6f9f2', icon: '✅' },
    project_created: { bg: '#eeeeff', icon: '📁' },
    member_joined:   { bg: '#fff3bf', icon: '👤' },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Activity Feed</div>
          <div className="page-sub">Everything your team has been up to</div>
        </div>
      </div>

      <div className="card">
        <div className="feed-divider">
          <div className="feed-divider-line" />
          <div className="feed-divider-text">TODAY</div>
          <div className="feed-divider-line" />
        </div>

        {events.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No activity yet</div>
            <div>Start creating tasks and projects to see activity here.</div>
          </div>
        )}

        {events.map((e, i) => {
          const ic = iconMap[e.type] || { bg: '#f5f7fa', icon: '📌' };
          let text = '';
          if (e.type === 'task_done')       text = <><strong>{e.user?.name || 'Someone'}</strong> completed task — <em>"{e.task?.title}"</em></>;
          if (e.type === 'project_created') text = <><strong>{e.user?.name || 'Admin'}</strong> created project — <em>"{e.project?.name}"</em></>;
          if (e.type === 'member_joined')   text = <><strong>{e.user?.name}</strong> joined the team</>;
          return (
            <div key={i} className="feed-item">
              <div className="feed-icon-wrap" style={{ background: ic.bg }}>{ic.icon}</div>
              <div>
                <div className="feed-text">{text}</div>
                <div className="feed-meta">{e.time}</div>
              </div>
            </div>
          );
        })}

        <div className="feed-divider" style={{ marginTop: 8 }}>
          <div className="feed-divider-line" />
          <div className="feed-divider-text">YESTERDAY</div>
          <div className="feed-divider-line" />
        </div>

        <div className="feed-item">
          <div className="feed-icon-wrap" style={{ background: '#fff0ee' }}>⚠️</div>
          <div>
            <div className="feed-text">A task became <strong>overdue</strong></div>
            <div className="feed-meta">Yesterday · 6:00 PM</div>
          </div>
        </div>
        <div className="feed-item">
          <div className="feed-icon-wrap" style={{ background: '#eeeeff' }}>🔧</div>
          <div>
            <div className="feed-text">Database tables created on <strong>Railway</strong></div>
            <div className="feed-meta">Yesterday · 3:30 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   NOTIFICATIONS PAGE
═══════════════════════════════════════════ */
function NotificationsPage({ tasks, projects }) {
  const [read, setRead] = useState([]);
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done');

  const notifs = [
    ...overdueTasks.slice(0, 2).map(t => ({
      id: `od-${t.id}`, icon: '⏰', bg: '#fff0ee', title: 'Task overdue',
      desc: `"${t.title}" was due ${new Date(t.due_date).toLocaleDateString()}. Please update the status.`,
      time: 'Just now', unread: true,
    })),
    { id: 'n1', icon: '👥', bg: '#eeeeff', title: 'New member added', desc: 'A new member joined TaskFlow. You can now assign tasks to them.', time: '2 hours ago', unread: true },
    { id: 'n2', icon: '📅', bg: '#fff3bf', title: 'Deadline approaching', desc: projects[0] ? `"${projects[0].name}" deadline is approaching. Review pending tasks.` : 'A project deadline is approaching.', time: '4 hours ago', unread: true },
    { id: 'n3', icon: '✅', bg: '#e6f9f2', title: 'Task completed', desc: 'A team member marked a task as done. Great progress!', time: 'Yesterday', unread: false },
    { id: 'n4', icon: '📁', bg: '#eeeeff', title: 'Project created', desc: projects[0] ? `New project "${projects[0].name}" was created.` : 'A new project was created.', time: '2 days ago', unread: false },
  ];

  const unreadCount = notifs.filter(n => n.unread && !read.includes(n.id)).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Notifications</div>
          <div className="page-sub">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</div>
        </div>
        {unreadCount > 0 && (
          <button className="btn-ghost" onClick={() => setRead(notifs.map(n => n.id))}>
            Mark all as read
          </button>
        )}
      </div>

      {notifs.map(n => {
        const isUnread = n.unread && !read.includes(n.id);
        return (
          <div key={n.id} className={`notif-card ${isUnread ? 'unread' : ''}`} onClick={() => setRead(r => [...r, n.id])} style={{ cursor: 'pointer' }}>
            {isUnread && <div className="notif-unread-dot" />}
            <div className="notif-icon-wrap" style={{ background: n.bg }}>{n.icon}</div>
            <div>
              <div className="notif-title">{n.title}</div>
              <div className="notif-desc">{n.desc}</div>
              <div className="notif-time">{n.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   AUTH PAGE
═══════════════════════════════════════════ */
function AuthPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const payload  = isSignup ? form : { email: form.email, password: form.password };
      const res      = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));
      onLogin(res.data.token, res.data.user);
    } catch {
      setError(isSignup ? 'Signup failed. Try a different email.' : 'Invalid email or password.');
    }
    setLoading(false);
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="tf-logo-mark">T</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 700, color: '#1a1f36', letterSpacing: '-0.3px' }}>TaskFlow</span>
        </div>
        <div className="auth-sub">{isSignup ? 'Create your account to get started' : 'Welcome back — sign in to continue'}</div>

        {error && <div className="auth-error">⚠️ {error}</div>}

        {isSignup && (
          <>
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input className="auth-input" placeholder="Aditi Kumari" value={form.name} onChange={f('name')} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Role</label>
              <select className="auth-select" value={form.role} onChange={f('role')}>
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </>
        )}
        <div className="auth-field">
          <label className="auth-label">Email Address</label>
          <input className="auth-input" placeholder="you@example.com" type="email" value={form.email} onChange={f('email')} />
        </div>
        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input className="auth-input" placeholder="••••••••" type="password" value={form.password} onChange={f('password')} />
        </div>

        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? '...' : isSignup ? 'Create Account' : 'Sign In'}
        </button>

        <div className="auth-toggle" onClick={() => { setIsSignup(!isSignup); setError(''); }}>
          {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════ */
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user,  setUser]  = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [page,  setPage]  = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [users,    setUsers]    = useState([]);

  useEffect(() => { if (token) fetchAll(); }, [token]);

  const fetchAll = async () => {
    try {
      const a = api(token);
      const [p, t] = await Promise.all([a.get('/projects'), a.get('/tasks')]);
      setProjects(p.data);
      setTasks(t.data);
      if (user?.role === 'Admin') {
        const u = await a.get('/users');
        setUsers(u.data);
      }
    } catch (err) { console.error(err); }
  };

  const handleLogin = (tok, usr) => { setToken(tok); setUser(usr); };
  const handleLogout = () => {
    localStorage.clear(); setToken(null); setUser(null);
    setProjects([]); setTasks([]); setUsers([]);
  };

  if (!token) return <AuthPage onLogin={handleLogin} />;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar page={page} setPage={setPage} user={user} logout={handleLogout} />
      <div className="tf-main">
        <div className="tf-topbar">
          <span className="topbar-title">
            {page === 'dashboard'     ? '📊 Dashboard'
            : page === 'projects'     ? '📁 Projects'
            : page === 'tasks'        ? '✅ Tasks'
            : page === 'team'         ? '👥 Team'
            : page === 'activity'     ? '⚡ Activity Feed'
            : '🔔 Notifications'}
          </span>
          <div className="topbar-actions">
            <div className="bell-btn" onClick={() => setPage('notifications')}>
              🔔
              <div className="bell-dot" />
            </div>
            <div className="avatar" style={{ background: avatarColor(user?.name), width: 34, height: 34, fontSize: 13 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="tf-content">
          {page === 'dashboard'     && <DashboardPage user={user} tasks={tasks} projects={projects} />}
          {page === 'projects'      && <ProjectsPage  user={user} tasks={tasks} projects={projects} token={token} onRefresh={fetchAll} />}
          {page === 'tasks'         && <TasksPage     user={user} tasks={tasks} projects={projects} users={users} token={token} onRefresh={fetchAll} />}
          {page === 'team'          && <TeamPage      users={users} tasks={tasks} />}
          {page === 'activity'      && <ActivityPage  tasks={tasks} projects={projects} users={users} />}
          {page === 'notifications' && <NotificationsPage tasks={tasks} projects={projects} />}
        </div>
      </div>
    </div>
  );
}