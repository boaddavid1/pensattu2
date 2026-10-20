import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import { sound } from './sound';
import BadgeCard from './BadgeCard';
import './school.css';

const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:3001/api/school'
  : '/api/school';

export default function SchoolAdmin() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'attendance', 'schools'
  const [settings, setSettings] = useState({
    retreat_title: 'PENSA Schools & Campus Spiritual Retreat 2026',
    retreat_theme: 'Ignite & Shine — Transformed for Global Impact',
    venue: 'Takoradi Technical University Auditorium',
    active_session: 'Morning Plenary & Worship Session',
    sessions: [
      { id: 'sess_1', name: 'Day 1: Opening & Evening Revival', active: false },
      { id: 'sess_2', name: 'Day 2: Morning Plenary & Worship Session', active: true },
      { id: 'sess_3', name: 'Day 2: Leadership Seminar & Workshops', active: false },
      { id: 'sess_4', name: 'Day 3: Holy Ghost & Healing Encounter', active: false },
      { id: 'sess_5', name: 'Day 4: Communion & Commissioning Service', active: false },
    ],
  });

  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scannerMode, setScannerMode] = useState('auto'); // 'auto', 'clock_in', 'clock_out'
  const [lastScanResult, setLastScanResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [printSchoolBadges, setPrintSchoolBadges] = useState(null);

  const html5QrCodeRef = useRef(null);
  const lastScannedRef = useRef({ code: '', time: 0 });

  // ─── 1. Load Data from Backend ───
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
        if (Array.isArray(data.schools)) setSchools(data.schools);
        if (Array.isArray(data.students)) setStudents(data.students);
        if (Array.isArray(data.attendance)) setAttendance(data.attendance);
      }
    } catch (e) {
      console.warn('Retreat data fetch error, using local state:', e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling sync
    return () => clearInterval(interval);
  }, [fetchData]);

  // ─── 2. Handle QR Scan ───
  const processScanCode = useCallback(
    async (rawCode) => {
      const code = String(rawCode || '').trim();
      if (!code) return;

      const now = Date.now();
      if (lastScannedRef.current.code === code && now - lastScannedRef.current.time < 3500) {
        return; // debounce rapid camera triggers
      }
      lastScannedRef.current = { code, time: now };

      try {
        const res = await fetch(`${API_BASE}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: code,
            action_type: scannerMode,
            session_name: settings.active_session,
            scanner_label: 'Organizer Gate Terminal',
          }),
        });

        const data = await res.json();

        if (res.ok && data.ok) {
          if (data.duplicate) {
            sound.playWarning();
            setLastScanResult({
              type: 'warning',
              message: data.message || 'Already scanned recently.',
              student: data.student,
              action: data.action_type,
            });
          } else {
            if (data.action_type === 'clock_in') sound.playClockIn();
            else sound.playClockOut();

            setLastScanResult({
              type: 'success',
              message: data.message || 'Scan Successful!',
              student: data.student,
              action: data.action_type,
            });

            // Update student status locally
            setStudents((prev) =>
              prev.map((st) =>
                st.id === data.student.id
                  ? { ...st, current_status: data.action_type === 'clock_in' ? 'clocked_in' : 'clocked_out' }
                  : st
              )
            );

            // Prepend attendance
            if (data.record) {
              setAttendance((prev) => [data.record, ...prev]);
            }
          }
        } else {
          sound.playError();
          setLastScanResult({
            type: 'error',
            message: data.error || `Unrecognized QR: ${code}`,
          });
        }
      } catch (err) {
        sound.playError();
        setLastScanResult({
          type: 'error',
          message: 'Network error processing scan.',
        });
      }
    },
    [scannerMode, settings.active_session]
  );

  // ─── 3. Camera Scanner Start / Stop ───
  const startCamera = async () => {
    setScannerError('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          processScanCode(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera start failed:', err);
      setScannerError('Could not access camera. Please allow camera permissions or enter Student ID manually.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isCameraActive) {
      try {
        await html5QrCodeRef.current.stop();
        setIsCameraActive(false);
      } catch (e) {}
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processScanCode(manualCode.trim());
      setManualCode('');
    }
  };

  // ─── 4. Export Attendance to Excel ───
  const exportAttendanceExcel = () => {
    if (attendance.length === 0) {
      alert('No attendance records to export yet.');
      return;
    }
    const rows = attendance.map((rec, idx) => ({
      '#': idx + 1,
      'Student ID': rec.student_id,
      'Full Name': rec.student_name,
      'School Name': rec.school_name,
      'Action': rec.action_type === 'clock_in' ? 'Clocked In' : 'Clocked Out',
      'Session': rec.session_name,
      'Timestamp': new Date(rec.scanned_at).toLocaleString(),
      'Gate Terminal': rec.scanned_by || 'Gate Scanner',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance_Log');
    XLSX.writeFile(wb, `retreat_attendance_export_${Date.now()}.xlsx`);
  };

  // ─── 5. Stat Calculations ───
  const totalStudents = students.length;
  const clockedInNow = students.filter((s) => s.current_status === 'clocked_in').length;
  const clockedOut = students.filter((s) => s.current_status === 'clocked_out').length;
  const totalSchools = schools.length;

  const filteredStudents = students.filter((st) => {
    const matchSchool = selectedSchoolFilter === 'all' || st.school_name === selectedSchoolFilter;
    const matchSearch =
      !studentSearch ||
      st.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.id?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.school_name?.toLowerCase().includes(studentSearch.toLowerCase());
    return matchSchool && matchSearch;
  });

  return (
    <div className="school-module-wrap" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Top Master Header Bar (No Global Footer) ─── */}
      <header className="ret-header">
        <div className="ret-header-inner">
          <Link to="/school/admin" className="ret-brand">
            <div className="ret-brand-icon">🕊️</div>
            <div className="ret-brand-text">
              <h1>{settings.retreat_title}</h1>
              <p>
                <span className="ret-live-pill"><span className="ret-live-dot"></span> ORGANIZER COMMAND CENTER</span>
                <span>• Gate Scanner &amp; Live Attendance</span>
              </p>
            </div>
          </Link>

          <div className="ret-header-actions no-print">
            {/* Session Selector */}
            <select
              value={settings.active_session}
              onChange={(e) => setSettings((prev) => ({ ...prev, active_session: e.target.value }))}
              className="ret-session-select"
            >
              {settings.sessions.map((sess) => (
                <option key={sess.id} value={sess.name}>
                  {sess.name}
                </option>
              ))}
            </select>

            <Link to="/school" className="ret-btn ret-btn-gold" style={{ textDecoration: 'none', fontSize: '13px' }}>
              <span>➕ Register Schools</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Masthead with Live Stat Counters ─── */}
      <section className="ret-masthead no-print">
        <div className="ret-masthead-inner">
          <div className="ret-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '10px' }}>
            <div className="ret-stat-card" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Delegates</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>{totalStudents}</div>
            </div>

            <div className="ret-stat-card" style={{ background: 'rgba(16,185,129,0.12)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ fontSize: '12px', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🟢 Clocked In Now</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#34d399', marginTop: '4px' }}>{clockedInNow}</div>
            </div>

            <div className="ret-stat-card" style={{ background: 'rgba(239,68,68,0.12)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div style={{ fontSize: '12px', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔴 Clocked Out</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#f87171', marginTop: '4px' }}>{clockedOut}</div>
            </div>

            <div className="ret-stat-card" style={{ background: 'rgba(245,158,11,0.12)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(245,158,11,0.25)' }}>
              <div style={{ fontSize: '12px', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏫 Schools / Campuses</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>{totalSchools}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tab Navigation Bar ─── */}
      <div className="ret-tabs-bar no-print" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 24px' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', gap: '8px' }}>
          {[
            { id: 'scanner', label: '📷 Gate Scanner Terminal' },
            { id: 'attendance', label: `📋 Live Attendance (${attendance.length})` },
            { id: 'schools', label: `🏫 Schools & Badges (${totalStudents})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 18px',
                border: 'none',
                background: 'none',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '800' : '600',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Tab Body ─── */}
      <main style={{ flex: 1, padding: '24px 16px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

          {/* TAB 1: SCANNER */}
          {activeTab === 'scanner' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {/* Left Column: Camera / Scanner Terminal */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Gate Terminal Scanner
                  </h3>
                  {/* Mode Selector */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'auto', label: 'Auto Toggle' },
                      { id: 'clock_in', label: 'In Only' },
                      { id: 'clock_out', label: 'Out Only' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setScannerMode(m.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          border: scannerMode === m.id ? '1px solid #2563eb' : '1px solid #cbd5e1',
                          background: scannerMode === m.id ? '#eff6ff' : '#ffffff',
                          color: scannerMode === m.id ? '#1d4ed8' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera Viewport */}
                <div
                  id="qr-reader-container"
                  style={{
                    width: '100%',
                    minHeight: '260px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!isCameraActive && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '42px', marginBottom: '10px' }}>📷</div>
                      <div style={{ fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>Camera is Standby</div>
                      <div style={{ fontSize: '12px', marginBottom: '16px' }}>Click Start Camera to begin scanning delegate badges</div>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="ret-btn ret-btn-gold"
                        style={{ fontSize: '13px' }}
                      >
                        ⚡ Start Camera Scanner
                      </button>
                    </div>
                  )}
                </div>

                {isCameraActive && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={stopCamera}
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      ⏹️ Stop Camera
                    </button>
                  </div>
                )}

                {scannerError && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '12px' }}>
                    {scannerError}
                  </div>
                )}

                {/* Manual Input Fallback */}
                <form onSubmit={handleManualSubmit} style={{ marginTop: '18px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter or paste Student ID / QR Code..."
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <button type="submit" className="ret-btn ret-btn-primary" style={{ fontSize: '13px', padding: '0 16px' }}>
                    Scan ID
                  </button>
                </form>

                {/* Live Scan Result Card */}
                {lastScanResult && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '14px',
                      borderRadius: '10px',
                      background: lastScanResult.type === 'success' ? '#ecfdf5' : lastScanResult.type === 'warning' ? '#fefce8' : '#fef2f2',
                      border: `1.5px solid ${lastScanResult.type === 'success' ? '#10b981' : lastScanResult.type === 'warning' ? '#f59e0b' : '#ef4444'}`,
                    }}
                  >
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
                      {lastScanResult.message}
                    </div>
                    {lastScanResult.student && (
                      <div style={{ marginTop: '4px', fontSize: '12px', color: '#334155' }}>
                        <strong>{lastScanResult.student.full_name}</strong> • {lastScanResult.student.school_name} ({lastScanResult.student.id})
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Live Recent Scans Log */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Live Terminal Activity Stream
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{attendance.length} total logs</span>
                </div>

                <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {attendance.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                      No attendance scans recorded yet. Badges scanned at the gate will appear here in real-time.
                    </div>
                  ) : (
                    attendance.slice(0, 30).map((log, idx) => (
                      <div
                        key={log.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          background: log.action_type === 'clock_in' ? '#f0fdf4' : '#fef2f2',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                            {log.student_name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {log.school_name} • {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>

                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: log.action_type === 'clock_in' ? '#dcfce7' : '#fee2e2',
                            color: log.action_type === 'clock_in' ? '#166534' : '#991b1b',
                          }}
                        >
                          {log.action_type === 'clock_in' ? '🟢 Clocked In' : '🔴 Clocked Out'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE ATTENDANCE TABLE */}
          {activeTab === 'attendance' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Master Live Attendance Registry
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                    All scanned entries and exits across all sessions with timestamps and gate terminals.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exportAttendanceExcel}
                  className="ret-btn ret-btn-gold"
                  style={{ fontSize: '13px' }}
                >
                  📊 Export to Excel (.xlsx)
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '10px 12px' }}>#</th>
                      <th style={{ padding: '10px 12px' }}>Student Delegate</th>
                      <th style={{ padding: '10px 12px' }}>School / Campus</th>
                      <th style={{ padding: '10px 12px' }}>Action</th>
                      <th style={{ padding: '10px 12px' }}>Session</th>
                      <th style={{ padding: '10px 12px' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((log, idx) => (
                      <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{log.student_name}</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{log.school_name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: log.action_type === 'clock_in' ? '#dcfce7' : '#fee2e2',
                              color: log.action_type === 'clock_in' ? '#166534' : '#991b1b',
                            }}
                          >
                            {log.action_type === 'clock_in' ? 'Clocked In' : 'Clocked Out'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.session_name}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(log.scanned_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SCHOOLS & BADGES DIRECTORY */}
          {activeTab === 'schools' && (
            <div>
              {/* If single school print view requested */}
              {printSchoolBadges ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: '#fff', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }} className="no-print">
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                        🖨️ Printing Badges for {printSchoolBadges}
                      </h3>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '13px' }}>
                        5 cards per horizontal line • 1-page paper batch print
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="ret-btn ret-btn-gold"
                      >
                        🖨️ Print (1-Page)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintSchoolBadges(null)}
                        className="ret-btn ret-btn-outline"
                        style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                      >
                        ✕ Close View
                      </button>
                    </div>
                  </div>

                  <div className="ret-badges-grid" id="badges-grid-container">
                    {students
                      .filter((s) => s.school_name === printSchoolBadges)
                      .map((st) => (
                        <BadgeCard key={st.id} student={st} schoolName={st.school_name} />
                      ))}
                  </div>
                </div>
              ) : (
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <select
                        value={selectedSchoolFilter}
                        onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="all">All Schools &amp; Delegations</option>
                        {schools.map((sch) => (
                          <option key={sch.id} value={sch.name}>
                            {sch.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search student or ID..."
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', width: '220px' }}
                      />
                    </div>

                    {selectedSchoolFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setPrintSchoolBadges(selectedSchoolFilter)}
                        className="ret-btn ret-btn-gold"
                        style={{ fontSize: '13px' }}
                      >
                        🖨️ Print Badges for {selectedSchoolFilter}
                      </button>
                    )}
                  </div>

                  {/* Students Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                          <th style={{ padding: '10px 12px' }}>Badge ID</th>
                          <th style={{ padding: '10px 12px' }}>Student Delegate</th>
                          <th style={{ padding: '10px 12px' }}>Gender</th>
                          <th style={{ padding: '10px 12px' }}>Class / Room</th>
                          <th style={{ padding: '10px 12px' }}>School</th>
                          <th style={{ padding: '10px 12px' }}>Status</th>
                          <th style={{ padding: '10px 12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((st) => (
                          <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{st.id}</td>
                            <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{st.full_name}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b' }}>{st.gender}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b' }}>{st.level_class} {st.room_dorm ? `• ${st.room_dorm}` : ''}</td>
                            <td style={{ padding: '10px 12px', color: '#334155' }}>{st.school_name}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  background: st.current_status === 'clocked_in' ? '#dcfce7' : st.current_status === 'clocked_out' ? '#fee2e2' : '#f1f5f9',
                                  color: st.current_status === 'clocked_in' ? '#166534' : st.current_status === 'clocked_out' ? '#991b1b' : '#64748b',
                                }}
                              >
                                {st.current_status === 'clocked_in' ? 'Clocked In' : st.current_status === 'clocked_out' ? 'Clocked Out' : 'Not Arrived'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <button
                                type="button"
                                onClick={() => processScanCode(st.id)}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                              >
                                Toggle Scan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
