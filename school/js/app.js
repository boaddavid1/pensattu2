// school/js/app.js — Master Retreat Application Controller

import { DEFAULT_RETREAT_SETTINGS, INITIAL_SCHOOLS, INITIAL_STUDENTS, INITIAL_ATTENDANCE } from './data.js';
import { renderBadges, printSingleBadge, downloadBadgeImage } from './badges.js';
import { startScanner, stopScanner, toggleCamera, setScannerMode, getScannerMode, sound } from './scanner.js';

// Expose badge actions globally for inline button onclick handlers
window.printSingleBadge = printSingleBadge;
window.downloadBadgeImage = downloadBadgeImage;

const STORAGE_KEY = 'pensa_retreat_state_v1';
const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3001/api/school' : '/api/school';

class RetreatApp {
  constructor() {
    this.settings = DEFAULT_RETREAT_SETTINGS;
    this.schools = INITIAL_SCHOOLS;
    this.students = INITIAL_STUDENTS;
    this.attendance = INITIAL_ATTENDANCE;
    this.activeTab = 'scanner'; // default view for admin terminal
    this.manualStudents = []; // temporary rows in registration form
  }

  async init() {
    this.loadFromLocalStorage();
    await this.fetchFromApi().catch(() => {});
    this.bindEvents();
    this.switchTab('scanner');
    this.updateStats();
    this.renderAll();
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schools && parsed.schools.length) this.schools = parsed.schools;
        if (parsed.students && parsed.students.length) this.students = parsed.students;
        if (parsed.attendance) this.attendance = parsed.attendance;
        if (parsed.settings) this.settings = parsed.settings;
      }
    } catch (e) {
      console.warn('LocalStorage load error, using default state', e);
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          schools: this.schools,
          students: this.students,
          attendance: this.attendance,
          settings: this.settings,
        })
      );
    } catch (e) {}
  }

  async fetchFromApi() {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.ok) {
        if (data.schools && data.schools.length) this.schools = data.schools;
        if (data.students && data.students.length) this.students = data.students;
        if (data.attendance) this.attendance = data.attendance;
        if (data.settings) this.settings = { ...this.settings, ...data.settings };
        this.saveToLocalStorage();
      }
    } catch (e) {
      // Backend not running, client works in standalone offline mode
    }
  }

  // ─── UI Rendering ───
  renderAll() {
    this.renderHeaderInfo();
    this.updateStats();
    this.renderSchoolFilterDropdowns();
    this.renderBadgesTab();
    this.renderAttendanceTable();
    this.renderSchoolsDirectory();
  }

  renderHeaderInfo() {
    const titleEl = document.getElementById('header-retreat-title');
    const themeEl = document.getElementById('header-retreat-theme');
    const sessionSelect = document.getElementById('session-select');

    if (titleEl) titleEl.textContent = this.settings.retreat_title;
    if (themeEl) themeEl.innerHTML = `<span>📖 ${this.settings.retreat_theme}</span> • <span>📍 ${this.settings.venue}</span>`;

    if (sessionSelect) {
      sessionSelect.innerHTML = (this.settings.sessions || [])
        .map(
          (s) => `<option value="${s.name}" ${s.name === this.settings.active_session ? 'selected' : ''}>${s.name}</option>`
        )
        .join('');
    }
  }

  updateStats() {
    const totalSchools = this.schools.length;
    const totalStudents = this.students.length;

    // Calculate current clock-in / clock-out count for active session
    const activeSession = this.settings.active_session;
    const latestStatusMap = {};

    this.attendance
      .filter((a) => !activeSession || a.session_name === activeSession)
      .forEach((a) => {
        if (!latestStatusMap[a.student_id]) {
          latestStatusMap[a.student_id] = a.action_type;
        }
      });

    let clockedIn = 0;
    let clockedOut = 0;

    Object.values(latestStatusMap).forEach((st) => {
      if (st === 'clock_in') clockedIn++;
      if (st === 'clock_out') clockedOut++;
    });

    const notArrived = Math.max(0, totalStudents - (clockedIn + clockedOut));
    const attendanceRate = totalStudents > 0 ? Math.round((clockedIn / totalStudents) * 100) : 0;

    // Update DOM counters
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('stat-total-schools', totalSchools);
    setVal('stat-total-students', totalStudents);
    setVal('stat-clocked-in', clockedIn);
    setVal('stat-clocked-out', clockedOut);
    setVal('stat-not-arrived', notArrived);
    setVal('stat-rate', `${attendanceRate}%`);

    // Tab badges
    setVal('tab-badge-badges', totalStudents);
    setVal('tab-badge-attendance', `${clockedIn}/${totalStudents}`);
    setVal('tab-badge-schools', totalSchools);
  }

  renderSchoolFilterDropdowns() {
    const dropdowns = [
      document.getElementById('badge-filter-school'),
      document.getElementById('attendance-filter-school'),
    ];

    const optionsHtml =
      '<option value="">All Schools</option>' +
      this.schools
        .map((s) => `<option value="${s.id}">${escapeHtml(s.name)} (${s.school_code})</option>`)
        .join('');

    dropdowns.forEach((dd) => {
      if (dd) dd.innerHTML = optionsHtml;
    });
  }

  renderBadgesTab() {
    const filterSchool = document.getElementById('badge-filter-school')?.value || '';
    const searchQuery = document.getElementById('badge-search-input')?.value || '';
    renderBadges(this.students, this.schools, 'badges-grid', filterSchool, searchQuery);
  }

  renderAttendanceTable() {
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody) return;

    const filterSchool = document.getElementById('attendance-filter-school')?.value || '';
    const filterStatus = document.getElementById('attendance-filter-status')?.value || '';
    const searchQuery = (document.getElementById('attendance-search-input')?.value || '').toLowerCase().trim();

    const activeSession = this.settings.active_session;

    // Build latest status map
    const studentStatusMap = {};
    this.attendance.forEach((a) => {
      if (!studentStatusMap[a.student_id]) {
        studentStatusMap[a.student_id] = a;
      }
    });

    let list = this.students.map((st) => {
      const lastScan = studentStatusMap[st.id];
      const status = lastScan ? (lastScan.action_type === 'clock_in' ? 'clocked_in' : 'clocked_out') : 'not_arrived';
      return {
        ...st,
        status,
        lastScanTime: lastScan ? new Date(lastScan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        lastScanType: lastScan ? lastScan.action_type : null,
      };
    });

    if (filterSchool) {
      list = list.filter((st) => st.school_id === filterSchool || st.school_name === filterSchool);
    }

    if (filterStatus) {
      list = list.filter((st) => st.status === filterStatus);
    }

    if (searchQuery) {
      list = list.filter(
        (st) =>
          st.full_name.toLowerCase().includes(searchQuery) ||
          st.id.toLowerCase().includes(searchQuery) ||
          st.school_name.toLowerCase().includes(searchQuery)
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color: #64748b;">No delegates match the active filter criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map(
        (st, idx) => `
      <tr>
        <td style="font-weight:700; color: #475569;">#${idx + 1}</td>
        <td>
          <div style="font-weight:800; font-size:14px; color:#0f2c52;">${escapeHtml(st.full_name)}</div>
          <span style="font-family:monospace; font-size:11.5px; color:#64748b;">${escapeHtml(st.id)}</span>
        </td>
        <td>
          <div style="font-weight:700;">${escapeHtml(st.school_name)}</div>
          <span style="font-size:11.5px; color:#64748b;">${escapeHtml(st.level_class || 'Delegate')}</span>
        </td>
        <td>${st.gender === 'Female' ? '👩 Female' : '👨 Male'}</td>
        <td>
          ${
            st.status === 'clocked_in'
              ? `<span style="background:#ecfdf5; color:#059669; padding:4px 10px; border-radius:20px; font-weight:800; font-size:11.5px; display:inline-flex; align-items:center; gap:5px;">● Clocked In</span>`
              : st.status === 'clocked_out'
              ? `<span style="background:#f0f9ff; color:#0284c7; padding:4px 10px; border-radius:20px; font-weight:800; font-size:11.5px; display:inline-flex; align-items:center; gap:5px;">○ Clocked Out</span>`
              : `<span style="background:#f1f5f9; color:#94a3b8; padding:4px 10px; border-radius:20px; font-weight:800; font-size:11.5px;">Not Arrived</span>`
          }
        </td>
        <td style="font-size:12.5px; color:#475569;">${st.lastScanTime}</td>
        <td>
          <div style="display:flex; gap:6px;">
            <button type="button" class="ret-badge-btn-mini" onclick="window.retreatApp.manualToggleAttendance('${escapeId(st.id)}')">
              ${st.status === 'clocked_in' ? 'Clock Out' : 'Clock In'}
            </button>
            <button type="button" class="ret-badge-btn-mini" onclick="window.printSingleBadge('${escapeId(st.id)}')">
              🖨️ Badge
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }

  renderSchoolsDirectory() {
    const grid = document.getElementById('schools-summary-grid');
    if (!grid) return;

    grid.innerHTML = this.schools
      .map((s) => {
        const schoolStudents = this.students.filter((st) => st.school_id === s.id);
        const inCount = schoolStudents.filter((st) => {
          const last = this.attendance.find((a) => a.student_id === st.id);
          return last && last.action_type === 'clock_in';
        }).length;

        const rate = schoolStudents.length > 0 ? Math.round((inCount / schoolStudents.length) * 100) : 0;

        return `
        <div class="ret-card" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between;">
          <div class="ret-card-header">
            <div>
              <span class="ret-badge-school-tag" style="margin-bottom:4px;">${escapeHtml(s.school_code)}</span>
              <h3 style="font-size:16px; font-weight:800; color:var(--primary-900); margin:0;">${escapeHtml(s.name)}</h3>
            </div>
            <span class="ret-card-badge">${escapeHtml(s.category)}</span>
          </div>
          <div class="ret-card-body" style="padding:16px;">
            <div style="font-size:12.5px; color:#475569; margin-bottom:12px;">
              <div>📍 <strong>Region:</strong> ${escapeHtml(s.region || '—')}</div>
              <div>👤 <strong>Patron:</strong> ${escapeHtml(s.patron_name || '—')} (${escapeHtml(s.patron_phone || '—')})</div>
            </div>

            <!-- Attendance Progress Bar -->
            <div style="background:#f1f5f9; border-radius:8px; height:8px; overflow:hidden; margin-bottom:8px;">
              <div style="background:var(--success-500); width:${rate}%; height:100%; transition: width 0.3s ease;"></div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:#475569;">
              <span>Present: ${inCount}/${schoolStudents.length}</span>
              <span style="color:var(--primary-600);">${rate}% Attendance</span>
            </div>
          </div>
          <div style="background:#f8fafc; border-top:1px solid var(--border-subtle); padding:10px 16px; display:flex; justify-content:space-between; align-items:center;">
            <button type="button" class="ret-badge-btn-mini" onclick="window.retreatApp.filterBySchoolAndSwitch('${escapeId(s.id)}')">
              📇 View Badges (${schoolStudents.length})
            </button>
            <button type="button" class="ret-badge-btn-mini" onclick="window.retreatApp.printSchoolBadges('${escapeId(s.id)}')">
              🖨️ Print All Badges
            </button>
          </div>
        </div>
      `;
      })
      .join('');
  }

  // ─── Actions & Handlers ───

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.ret-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    document.querySelectorAll('.ret-view').forEach((view) => {
      view.classList.toggle('active', view.id === `view-${tabId}`);
    });

    // Handle scanner lifecycle when switching tabs
    if (tabId === 'scanner') {
      startScanner((qrText, mode) => this.handleScan(qrText, mode));
    } else {
      stopScanner();
    }

    if (tabId === 'badges') {
      this.renderBadgesTab();
    } else if (tabId === 'attendance') {
      this.renderAttendanceTable();
    }
  }

  filterBySchoolAndSwitch(schoolId) {
    const schoolDd = document.getElementById('badge-filter-school');
    if (schoolDd) schoolDd.value = schoolId;
    this.switchTab('badges');
  }

  printSchoolBadges(schoolId) {
    this.filterBySchoolAndSwitch(schoolId);
    setTimeout(() => {
      window.print();
    }, 400);
  }

  async handleScan(studentIdOrQr, mode = 'auto') {
    const cleanId = String(studentIdOrQr).trim().toUpperCase();
    const resultBox = document.getElementById('scan-result-card');

    try {
      // Find student locally first
      let student = this.students.find(
        (st) => st.id.toUpperCase() === cleanId || (st.qr_payload && st.qr_payload.toUpperCase() === cleanId)
      );

      // If online, call API for official logging
      let apiResult = null;
      try {
        const res = await fetch(`${API_BASE}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: cleanId,
            action_type: mode,
            session_name: this.settings.active_session,
            scanner_label: 'Camera Scanner Terminal',
          }),
        });
        if (res.ok) {
          apiResult = await res.json();
          if (apiResult.student) student = apiResult.student;
        }
      } catch (err) {}

      if (!student) {
        sound.playError();
        this.renderScanResult({
          type: 'error',
          title: 'UNRECOGNIZED QR CODE',
          message: `Badge ID "${cleanId}" does not match any registered student delegate in the system.`,
        });
        return;
      }

      // Determine action (clock-in or clock-out)
      const lastScan = this.attendance.find(
        (a) => a.student_id === student.id && a.session_name === this.settings.active_session
      );

      let action = mode === 'auto' ? (lastScan && lastScan.action_type === 'clock_in' ? 'clock_out' : 'clock_in') : mode;

      // Duplicate check (within 10 seconds)
      if (lastScan && lastScan.action_type === action && Date.now() - new Date(lastScan.scanned_at).getTime() < 10000) {
        sound.playWarning();
        this.renderScanResult({
          type: 'warning',
          title: `ALREADY ${action.toUpperCase()}`,
          student,
          message: `Student was already recorded ${action === 'clock_in' ? 'in' : 'out'} just moments ago.`,
        });
        return;
      }

      // Record scan
      const scanRecord = apiResult?.record || {
        id: Date.now(),
        student_id: student.id,
        student_name: student.full_name,
        school_name: student.school_name,
        action_type: action,
        session_name: this.settings.active_session,
        scanned_at: new Date().toISOString(),
        scanned_by: 'Gate Scanner',
      };

      this.attendance.unshift(scanRecord);
      this.saveToLocalStorage();
      this.updateStats();

      // Sound feedback
      if (action === 'clock_in') {
        sound.playClockIn();
      } else {
        sound.playClockOut();
      }

      // Visual feedback card
      this.renderScanResult({
        type: action,
        student,
        scanRecord,
      });

      this.renderRecentScansFeed();
    } catch (e) {
      console.error('Scan handling failed:', e);
    }
  }

  renderScanResult(data) {
    const card = document.getElementById('scan-result-card');
    if (!card) return;

    if (data.type === 'error') {
      card.className = 'ret-scan-result-card error';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:36px;">❌</div>
          <div>
            <div style="font-size:12px; font-weight:800; color:#dc2626; letter-spacing:0.08em; text-transform:uppercase;">${data.title}</div>
            <div style="font-size:14px; font-weight:700; color:#1e293b; margin-top:2px;">${escapeHtml(data.message)}</div>
          </div>
        </div>
      `;
      return;
    }

    if (data.type === 'warning') {
      card.className = 'ret-scan-result-card';
      card.style.borderColor = 'var(--accent-gold)';
      card.style.background = '#fffbeb';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="font-size:36px;">⚠️</div>
          <div>
            <div style="font-size:11.5px; font-weight:800; color:#b45309; text-transform:uppercase;">DUPLICATE SCAN DETECTED</div>
            <div style="font-size:18px; font-weight:800; color:#0f2c52;">${escapeHtml(data.student.full_name)}</div>
            <div style="font-size:13px; color:#475569;">${escapeHtml(data.student.school_name)} • ${escapeHtml(data.message)}</div>
          </div>
        </div>
      `;
      return;
    }

    const isClockIn = data.type === 'clock_in';
    card.className = `ret-scan-result-card ${isClockIn ? 'clocked-in' : 'clocked-out'}`;

    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:52px; height:52px; border-radius:50%; background:${isClockIn ? 'var(--success-500)' : 'var(--info-500)'}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; box-shadow:0 4px 14px rgba(0,0,0,0.15);">
            ${isClockIn ? '✓' : '🚪'}
          </div>
          <div>
            <div style="font-size:11px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:${isClockIn ? 'var(--success-600)' : 'var(--info-500)'};">
              ${isClockIn ? '✅ CLOCKED IN (WELCOME TO RETREAT)' : '🚪 CLOCKED OUT (SEE YOU SOON)'}
            </div>
            <!-- STUDENT NAME PROMINENT -->
            <div style="font-family:var(--font-heading); font-size:22px; font-weight:800; color:var(--primary-900); margin:2px 0;">
              ${escapeHtml(data.student.full_name)}
            </div>
            <div style="font-size:13px; color:#475569; display:flex; gap:8px; align-items:center;">
              <span style="font-weight:700;">🏫 ${escapeHtml(data.student.school_name)}</span>
              <span>•</span>
              <span style="font-family:monospace; font-weight:700;">${escapeHtml(data.student.id)}</span>
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; color:#64748b;">Recorded at</div>
          <div style="font-size:15px; font-weight:800; color:#0f2c52;">
            ${new Date(data.scanRecord.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style="font-size:11.5px; color:#64748b;">${escapeHtml(data.scanRecord.session_name)}</div>
        </div>
      </div>
    `;
  }

  renderRecentScansFeed() {
    const feed = document.getElementById('recent-scans-list');
    if (!feed) return;

    const recent = this.attendance.slice(0, 10);
    if (recent.length === 0) {
      feed.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8; font-size:13px;">No scans recorded yet today.</div>`;
      return;
    }

    feed.innerHTML = recent
      .map((s) => {
        const isClockIn = s.action_type === 'clock_in';
        return `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:26px; height:26px; border-radius:50%; background:${isClockIn ? '#ecfdf5' : '#f0f9ff'}; color:${isClockIn ? '#059669' : '#0284c7'}; display:inline-flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">
              ${isClockIn ? 'IN' : 'OUT'}
            </span>
            <div>
              <div style="font-size:13px; font-weight:800; color:#0f2c52;">${escapeHtml(s.student_name)}</div>
              <div style="font-size:11.5px; color:#64748b;">${escapeHtml(s.school_name)}</div>
            </div>
          </div>
          <div style="font-size:12px; font-weight:700; color:#64748b;">
            ${new Date(s.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      `;
      })
      .join('');
  }

  manualToggleAttendance(studentId) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return;

    const last = this.attendance.find((a) => a.student_id === studentId);
    const nextAction = last && last.action_type === 'clock_in' ? 'clock_out' : 'clock_in';

    this.handleScan(studentId, nextAction);
    this.renderAttendanceTable();
  }

  // ─── Registration & Parsing ───

  parseStudentRosterText(rawText) {
    if (!rawText || !rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    return lines.map((line, idx) => {
      // Check if comma or tab separated: "Name, Gender, Class, Room"
      let parts = line.split(/[,\t]/).map((p) => p.trim());
      const name = parts[0] || `Delegate ${idx + 1}`;
      let gender = 'Male';
      let level = 'Form 3';
      let room = '';

      if (parts[1]) {
        const g = parts[1].toLowerCase();
        if (g.startsWith('f') || g === 'female' || g === 'f') gender = 'Female';
        else if (g.startsWith('m') || g === 'male' || g === 'm') gender = 'Male';
        else level = parts[1];
      }

      if (parts[2]) {
        if (!room && parts[2].toLowerCase().includes('hall') || parts[2].toLowerCase().includes('house') || parts[2].toLowerCase().includes('room')) {
          room = parts[2];
        } else {
          level = parts[2];
        }
      }

      if (parts[3]) room = parts[3];

      return {
        full_name: name,
        gender,
        level_class: level,
        room_dorm: room,
      };
    });
  }

  async handleRegisterSchoolSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const schoolName = form['school_name'].value.trim();
    if (!schoolName) {
      alert('Please enter the School Name.');
      return;
    }

    let schoolCode = form['school_code'].value.trim().toUpperCase();
    if (!schoolCode) {
      schoolCode = schoolName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'SCH';
    }

    const schoolCategory = form['school_category'].value;
    const region = form['school_region'].value.trim();
    const patronName = form['patron_name'].value.trim();
    const patronPhone = form['patron_phone'].value.trim();
    const patronEmail = form['patron_email'].value.trim();
    const notes = form['school_notes'].value.trim();

    // Collect students from paste box or table
    let studentList = [];
    const pasteText = document.getElementById('roster-paste-textarea')?.value || '';
    if (pasteText.trim()) {
      studentList = this.parseStudentRosterText(pasteText);
    } else if (this.manualStudents.length > 0) {
      studentList = [...this.manualStudents];
    }

    if (studentList.length === 0) {
      alert('Please add at least one student name for this school.');
      return;
    }

    const schoolId = `sch_${Date.now()}`;
    const newSchool = {
      id: schoolId,
      school_code: schoolCode,
      name: schoolName,
      category: schoolCategory,
      region,
      patron_name: patronName,
      patron_phone: patronPhone,
      patron_email: patronEmail,
      notes,
      created_at: new Date().toISOString(),
    };

    const newStudents = studentList.map((st, idx) => {
      const num = String(idx + 1).padStart(3, '0');
      const studentId = `RET26-${schoolCode}-${num}`;
      return {
        id: studentId,
        school_id: schoolId,
        school_name: schoolName,
        full_name: st.full_name,
        gender: st.gender || 'Not Specified',
        level_class: st.level_class || 'Student Delegate',
        room_dorm: st.room_dorm || '',
        emergency_contact: patronPhone,
        qr_payload: studentId,
        created_at: new Date().toISOString(),
      };
    });

    // Save to API
    try {
      await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school: newSchool, students: newStudents }),
      });
    } catch (err) {}

    // Update local state
    this.schools.unshift(newSchool);
    this.students.push(...newStudents);
    this.saveToLocalStorage();

    // Reset form
    form.reset();
    document.getElementById('roster-paste-textarea').value = '';
    this.manualStudents = [];
    this.renderManualStudentsTable();

    // Render & celebrate
    this.renderAll();
    sound.playClockIn();

    alert(
      `🎉 SUCCESS!\n\nRegistered "${schoolName}" with ${newStudents.length} student QR badges generated!\n\nSwitching to Badges Studio now...`
    );

    this.filterBySchoolAndSwitch(schoolId);
  }

  renderManualStudentsTable() {
    const tbody = document.getElementById('manual-roster-tbody');
    if (!tbody) return;

    if (this.manualStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:16px; color:#94a3b8;">No student rows added yet. Click "+ Add Student" below.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.manualStudents
      .map(
        (st, idx) => `
      <tr>
        <td>#${idx + 1}</td>
        <td>
          <input type="text" class="ret-form-input" style="padding:6px 10px;" value="${escapeHtml(st.full_name)}" onchange="window.retreatApp.updateManualStudent(${idx}, 'full_name', this.value)" placeholder="Student Full Name">
        </td>
        <td>
          <select class="ret-form-select" style="padding:6px 10px;" onchange="window.retreatApp.updateManualStudent(${idx}, 'gender', this.value)">
            <option value="Male" ${st.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${st.gender === 'Female' ? 'selected' : ''}>Female</option>
          </select>
        </td>
        <td>
          <input type="text" class="ret-form-input" style="padding:6px 10px;" value="${escapeHtml(st.level_class)}" onchange="window.retreatApp.updateManualStudent(${idx}, 'level_class', this.value)" placeholder="Class / Level">
        </td>
        <td>
          <button type="button" class="ret-badge-btn-mini" style="color:#ef4444;" onclick="window.retreatApp.removeManualStudent(${idx})">✕</button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  addManualStudentRow() {
    this.manualStudents.push({
      full_name: '',
      gender: 'Male',
      level_class: 'Form 3',
      room_dorm: '',
    });
    this.renderManualStudentsTable();
  }

  removeManualStudent(idx) {
    this.manualStudents.splice(idx, 1);
    this.renderManualStudentsTable();
  }

  updateManualStudent(idx, field, val) {
    if (this.manualStudents[idx]) {
      this.manualStudents[idx][field] = val;
    }
  }

  // ─── CSV Export ───
  exportAttendanceCsv() {
    const activeSession = this.settings.active_session;
    const studentStatusMap = {};
    this.attendance.forEach((a) => {
      if (!studentStatusMap[a.student_id]) studentStatusMap[a.student_id] = a;
    });

    const headers = ['Student ID', 'Full Name', 'School Name', 'Gender', 'Class/Level', 'Status', 'Last Scan Time', 'Session'];
    const rows = this.students.map((st) => {
      const scan = studentStatusMap[st.id];
      const status = scan ? (scan.action_type === 'clock_in' ? 'Clocked In' : 'Clocked Out') : 'Not Arrived';
      const scanTime = scan ? new Date(scan.scanned_at).toLocaleString() : '—';
      return [
        `"${st.id}"`,
        `"${st.full_name}"`,
        `"${st.school_name}"`,
        `"${st.gender}"`,
        `"${st.level_class || ''}"`,
        `"${status}"`,
        `"${scanTime}"`,
        `"${activeSession}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RETREAT_ATTENDANCE_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ─── Event Listeners ───
  bindEvents() {
    // Tab switching
    document.querySelectorAll('.ret-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Session switcher in header
    const sessionSelect = document.getElementById('session-select');
    if (sessionSelect) {
      sessionSelect.addEventListener('change', (e) => {
        this.settings.active_session = e.target.value;
        this.saveToLocalStorage();
        this.updateStats();
        this.renderAttendanceTable();
      });
    }

    // Badge filters
    const badgeFilterSchool = document.getElementById('badge-filter-school');
    const badgeSearchInput = document.getElementById('badge-search-input');

    if (badgeFilterSchool) badgeFilterSchool.addEventListener('change', () => this.renderBadgesTab());
    if (badgeSearchInput) badgeSearchInput.addEventListener('input', () => this.renderBadgesTab());

    // Print all badges button
    const printAllBtn = document.getElementById('print-badges-btn');
    if (printAllBtn) {
      printAllBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Attendance filters
    const attFilterSchool = document.getElementById('attendance-filter-school');
    const attFilterStatus = document.getElementById('attendance-filter-status');
    const attSearchInput = document.getElementById('attendance-search-input');

    if (attFilterSchool) attFilterSchool.addEventListener('change', () => this.renderAttendanceTable());
    if (attFilterStatus) attFilterStatus.addEventListener('change', () => this.renderAttendanceTable());
    if (attSearchInput) attSearchInput.addEventListener('input', () => this.renderAttendanceTable());

    // Export CSV
    const exportCsvBtn = document.getElementById('export-attendance-csv-btn');
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', () => this.exportAttendanceCsv());

    // Scanner controls
    const toggleCamBtn = document.getElementById('toggle-camera-btn');
    if (toggleCamBtn) {
      toggleCamBtn.addEventListener('click', () => toggleCamera((qr, mode) => this.handleScan(qr, mode)));
    }

    document.querySelectorAll('.ret-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        setScannerMode(btn.dataset.mode);
      });
    });

    // Manual scanner input box (supports Enter key or 2D barcode scanner gun)
    const manualScanInput = document.getElementById('manual-scan-input');
    const manualScanBtn = document.getElementById('manual-scan-btn');

    const triggerManualScan = () => {
      if (!manualScanInput) return;
      const val = manualScanInput.value.trim();
      if (!val) return;
      this.handleScan(val, getScannerMode());
      manualScanInput.value = '';
    };

    if (manualScanBtn) manualScanBtn.addEventListener('click', triggerManualScan);
    if (manualScanInput) {
      manualScanInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerManualScan();
        }
      });
    }

    // Registration Form
    const regForm = document.getElementById('school-registration-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => this.handleRegisterSchoolSubmit(e));
    }

    // Student upload sub-tabs in registration
    document.querySelectorAll('.ret-upload-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ret-upload-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.method; // 'paste', 'file', 'table'

        document.getElementById('upload-mode-paste').style.display = mode === 'paste' ? 'block' : 'none';
        document.getElementById('upload-mode-file').style.display = mode === 'file' ? 'block' : 'none';
        document.getElementById('upload-mode-table').style.display = mode === 'table' ? 'block' : 'none';
      });
    });

    // Add row button in manual table
    const addRowBtn = document.getElementById('add-manual-row-btn');
    if (addRowBtn) addRowBtn.addEventListener('click', () => this.addManualStudentRow());

    // CSV File Drag & Drop
    const fileInput = document.getElementById('roster-csv-file');
    const dropzone = document.getElementById('roster-dropzone');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleCsvFile(file);
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--primary-500)';
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '#93c5fd';
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#93c5fd';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleCsvFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Live counter for paste textarea
    const pasteArea = document.getElementById('roster-paste-textarea');
    const pasteCountBadge = document.getElementById('paste-count-badge');
    if (pasteArea && pasteCountBadge) {
      pasteArea.addEventListener('input', () => {
        const parsed = this.parseStudentRosterText(pasteArea.value);
        pasteCountBadge.textContent = `${parsed.length} student${parsed.length === 1 ? '' : 's'} detected`;
      });
    }
  }

  handleCsvFile(file) {
    const isExcel =
      /\.(xlsx|xls|xlsb|xlsm|ods)$/i.test(file.name) ||
      (file.type && (file.type.includes('sheet') || file.type.includes('excel')));

    if (isExcel && typeof XLSX !== 'undefined') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '', blankrows: false });
          const students = [];
          for (const row of rawRows) {
            if (!Array.isArray(row) || row.length === 0) continue;
            let name = String(row[0] || '').trim().replace(/^(\d+[\.\-\)]\s*)+/, '');
            if (!name || name.length < 2) continue;
            if (/^(name|full name|student|total|sn|no\.?)$/i.test(name)) continue;
            let gender = 'Male';
            let level = 'Student Delegate';
            if (row[1]) {
              const g = String(row[1]).trim().toLowerCase();
              if (g.startsWith('f')) gender = 'Female';
              else if (g.startsWith('m')) gender = 'Male';
              else level = String(row[1]).trim();
            }
            if (row[2]) level = String(row[2]).trim();
            students.push({ full_name: name, gender, level_class: level });
          }
          if (students.length > 0) {
            const pasteArea = document.getElementById('roster-paste-textarea');
            if (pasteArea) {
              pasteArea.value = students.map((st) => `${st.full_name}, ${st.gender}, ${st.level_class}`).join('\n');
              const badge = document.getElementById('paste-count-badge');
              if (badge) badge.textContent = `${students.length} students loaded from Excel`;
            }
            document.querySelector('[data-method="paste"]')?.click();
          }
        } catch (err) {
          console.error('Excel parse error:', err);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const parsed = this.parseStudentRosterText(text);
        if (parsed.length > 0) {
          const pasteArea = document.getElementById('roster-paste-textarea');
          if (pasteArea) {
            pasteArea.value = parsed.map((st) => `${st.full_name}, ${st.gender}, ${st.level_class}`).join('\n');
            const badge = document.getElementById('paste-count-badge');
            if (badge) badge.textContent = `${parsed.length} students loaded from file`;
          }
          document.querySelector('[data-method="paste"]')?.click();
        }
      };
      reader.readAsText(file);
    }
  }
}

// Helper escape
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeId(id) {
  if (!id) return '';
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Boot application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.retreatApp = new RetreatApp();
  window.retreatApp.init();
});
