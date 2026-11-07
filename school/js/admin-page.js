// school/js/admin-page.js — Controller for Organizer Data Collection & Management Portal

import { DEFAULT_RETREAT_SETTINGS, INITIAL_SCHOOLS, INITIAL_STUDENTS, INITIAL_ATTENDANCE } from './data.js';
import { renderBadges, printSingleBadge, downloadBadgeImage } from './badges.js';

// Expose globals for onclicks in rendered HTML
window.printSingleBadge = printSingleBadge;
window.downloadBadgeImage = downloadBadgeImage;

const STORAGE_KEY = 'pensa_retreat_state_v1';
const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3001/api/school' : '/api/school';

class AdminDataApp {
  constructor() {
    this.settings = DEFAULT_RETREAT_SETTINGS;
    this.schools = INITIAL_SCHOOLS;
    this.students = INITIAL_STUDENTS;
    this.attendance = INITIAL_ATTENDANCE;
    this.activeTab = 'students';
    this.intakeFileStudents = [];
  }

  async init() {
    this.loadFromLocalStorage();
    await this.fetchFromApi().catch(() => {});
    this.bindEvents();
    this.updateStats();
    this.renderAll();
    this.switchTab('students');
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schools && parsed.schools.length) this.schools = parsed.schools;
        if (parsed.students && parsed.students.length) this.students = parsed.students;
        if (parsed.attendance) this.attendance = parsed.attendance;
        if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
      }
    } catch (e) {}
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
    } catch (e) {}
  }

  renderAll() {
    this.renderHeaderInfo();
    this.updateStats();
    this.renderSchoolFilterDropdowns();
    this.renderStudentsTable();
    this.renderSchoolsDirectory();
    this.renderAttendanceTable();
    this.renderBadgesTab();
  }

  renderHeaderInfo() {
    const titleEl = document.getElementById('header-retreat-title');
    const themeEl = document.getElementById('header-retreat-theme');
    const sessionSelect = document.getElementById('session-select');

    if (titleEl) titleEl.textContent = this.settings.retreat_title;
    if (themeEl) {
      themeEl.innerHTML = `<span>📖 ${this.settings.retreat_theme}</span> • <span>📍 ${this.settings.venue}</span>`;
    }

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

    const attendanceRate = totalStudents > 0 ? Math.round((clockedIn / totalStudents) * 100) : 0;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('stat-total-schools', totalSchools);
    setVal('stat-total-students', totalStudents);
    setVal('stat-clocked-in', clockedIn);
    setVal('stat-clocked-out', clockedOut);
    setVal('stat-rate', `${attendanceRate}%`);

    setVal('tab-badge-students', totalStudents);
    setVal('tab-badge-schools', totalSchools);
    setVal('tab-badge-attendance', `${clockedIn}/${totalStudents}`);
    setVal('tab-badge-badges', totalStudents);
  }

  renderSchoolFilterDropdowns() {
    const dropdowns = [
      document.getElementById('student-filter-school'),
      document.getElementById('attendance-filter-school'),
      document.getElementById('badge-filter-school'),
    ];

    const optionsHtml =
      '<option value="">All Schools</option>' +
      this.schools
        .map((s) => `<option value="${s.id}">${escapeHtml(s.name)} (${s.school_code})</option>`)
        .join('');

    dropdowns.forEach((dd) => {
      if (dd) {
        const curr = dd.value;
        dd.innerHTML = optionsHtml;
        if (curr) dd.value = curr;
      }
    });
  }

  // ─── TAB 1: Students Table ───
  renderStudentsTable() {
    const tbody = document.getElementById('students-tbody');
    if (!tbody) return;

    const filterSchool = document.getElementById('student-filter-school')?.value || '';
    const filterStatus = document.getElementById('student-filter-status')?.value || '';
    const filterGender = document.getElementById('student-filter-gender')?.value || '';
    const query = (document.getElementById('student-search-input')?.value || '').toLowerCase().trim();

    // Map latest attendance
    const studentStatusMap = {};
    this.attendance.forEach((a) => {
      if (!studentStatusMap[a.student_id]) studentStatusMap[a.student_id] = a;
    });

    let list = this.students.map((st) => {
      const lastScan = studentStatusMap[st.id];
      const status = lastScan ? (lastScan.action_type === 'clock_in' ? 'clocked_in' : 'clocked_out') : 'not_arrived';
      return {
        ...st,
        status,
        lastScanTime: lastScan ? new Date(lastScan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      };
    });

    if (filterSchool) {
      list = list.filter((st) => st.school_id === filterSchool || st.school_name === filterSchool);
    }
    if (filterStatus) {
      list = list.filter((st) => st.status === filterStatus);
    }
    if (filterGender) {
      list = list.filter((st) => st.gender === filterGender);
    }
    if (query) {
      list = list.filter(
        (st) =>
          st.full_name.toLowerCase().includes(query) ||
          st.id.toLowerCase().includes(query) ||
          (st.school_name && st.school_name.toLowerCase().includes(query)) ||
          (st.room_dorm && st.room_dorm.toLowerCase().includes(query)) ||
          (st.level_class && st.level_class.toLowerCase().includes(query))
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
          <span style="font-family:monospace; font-size:11.5px; color:#2563eb; background:#eff6ff; padding:2px 6px; border-radius:4px; font-weight:700;">${escapeHtml(st.id)}</span>
        </td>
        <td>
          <div style="font-weight:700; font-size:13px; color:#1e293b;">${escapeHtml(st.school_name)}</div>
          <span style="font-size:11.5px; color:#64748b;">${escapeHtml(st.level_class || 'Delegate')}</span>
        </td>
        <td>
          <div style="font-size:12.5px;">${st.gender === 'Female' ? '👩 Female' : '👨 Male'}</div>
          ${st.room_dorm ? `<span style="font-size:11px; color:#64748b;">🏠 ${escapeHtml(st.room_dorm)}</span>` : ''}
        </td>
        <td>
          ${
            st.status === 'clocked_in'
              ? `<span style="background:#ecfdf5; color:#059669; padding:4px 10px; border-radius:20px; font-weight:800; font-size:11px; display:inline-flex; align-items:center; gap:5px;">● Clocked In</span>`
              : st.status === 'clocked_out'
              ? `<span style="background:#f0f9ff; color:#0284c7; padding:4px 10px; border-radius:20px; font-weight:800; font-size:11px; display:inline-flex; align-items:center; gap:5px;">○ Clocked Out</span>`
              : `<span style="background:#f1f5f9; color:#94a3b8; padding:4px 10px; border-radius:20px; font-weight:800; font-size:11px;">Not Arrived</span>`
          }
        </td>
        <td style="font-size:12px; color:#475569; font-weight:600;">${st.lastScanTime}</td>
        <td>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">
            <button type="button" class="ret-badge-btn-mini" style="font-weight:700;" onclick="window.adminApp.manualToggleStatus('${escapeId(st.id)}')">
              ${st.status === 'clocked_in' ? 'Clock Out' : 'Clock In'}
            </button>
            <button type="button" class="ret-badge-btn-mini" onclick="window.printSingleBadge('${escapeId(st.id)}')">
              🖨️ Badge
            </button>
            <button type="button" class="ret-badge-btn-mini" style="background:#f8fafc; color:#3b82f6; border-color:#bfdbfe;" onclick="window.adminApp.openEditStudent('${escapeId(st.id)}')">
              ✏️ Edit
            </button>
            <button type="button" class="ret-badge-btn-mini" style="background:#fef2f2; color:#ef4444; border-color:#fecaca;" onclick="window.adminApp.deleteStudent('${escapeId(st.id)}')">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }

  // ─── TAB 2: Schools Directory ───
  renderSchoolsDirectory() {
    const grid = document.getElementById('schools-summary-grid');
    if (!grid) return;

    if (this.schools.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#64748b;">No schools registered yet. Click "Collect / Register School" to begin.</div>`;
      return;
    }

    grid.innerHTML = this.schools
      .map((s) => {
        const schoolStudents = this.students.filter((st) => st.school_id === s.id);
        const inCount = schoolStudents.filter((st) => {
          const last = this.attendance.find((a) => a.student_id === st.id);
          return last && last.action_type === 'clock_in';
        }).length;

        const rate = schoolStudents.length > 0 ? Math.round((inCount / schoolStudents.length) * 100) : 0;

        return `
        <div class="ret-card" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <div class="ret-card-header" style="padding:16px 20px;">
            <div>
              <span class="ret-badge-school-tag" style="margin-bottom:4px;">${escapeHtml(s.school_code)}</span>
              <h3 style="font-size:16px; font-weight:800; color:var(--primary-900); margin:0;">${escapeHtml(s.name)}</h3>
            </div>
            <span class="ret-card-badge">${escapeHtml(s.category || 'School')}</span>
          </div>
          
          <div class="ret-card-body" style="padding:16px 20px;">
            <div style="font-size:12.5px; color:#475569; margin-bottom:12px; line-height:1.6;">
              <div>📍 <strong>Region:</strong> ${escapeHtml(s.region || '—')}</div>
              <div>👤 <strong>Teacher / Patron:</strong> ${escapeHtml(s.patron_name || s.teacher_incharge_name || '—')}</div>
              <div>📞 <strong>Contact:</strong> ${escapeHtml(s.patron_phone || s.teacher_incharge_contact || '—')}</div>
              ${s.registrant_name ? `<div>📝 <strong>Registrant:</strong> ${escapeHtml(s.registrant_name)} (${escapeHtml(s.registrant_contact || '')})</div>` : ''}
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

          <div style="background:#f8fafc; border-top:1px solid var(--border-subtle); padding:10px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; gap:6px;">
              <button type="button" class="ret-badge-btn-mini" onclick="window.adminApp.filterBySchoolAndSwitch('${escapeId(s.id)}')">
                📇 Badges (${schoolStudents.length})
              </button>
              <button type="button" class="ret-badge-btn-mini" style="background:#ecfdf5; color:#047857; border-color:#a7f3d0;" onclick="window.adminApp.exportSchoolExcel('${escapeId(s.id)}')">
                📊 Excel
              </button>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="ret-badge-btn-mini" style="color:#2563eb;" onclick="window.adminApp.openEditSchool('${escapeId(s.id)}')">
                ✏️ Edit
              </button>
              <button type="button" class="ret-badge-btn-mini" style="color:#ef4444;" onclick="window.adminApp.deleteSchool('${escapeId(s.id)}')">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  // ─── TAB 4: Attendance Table ───
  renderAttendanceTable() {
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody) return;

    const filterSchool = document.getElementById('attendance-filter-school')?.value || '';
    const filterStatus = document.getElementById('attendance-filter-status')?.value || '';
    const query = (document.getElementById('attendance-search-input')?.value || '').toLowerCase().trim();

    const studentStatusMap = {};
    this.attendance.forEach((a) => {
      if (!studentStatusMap[a.student_id]) studentStatusMap[a.student_id] = a;
    });

    let list = this.students.map((st) => {
      const lastScan = studentStatusMap[st.id];
      const status = lastScan ? (lastScan.action_type === 'clock_in' ? 'clocked_in' : 'clocked_out') : 'not_arrived';
      return {
        ...st,
        status,
        lastScanTime: lastScan ? new Date(lastScan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—',
      };
    });

    if (filterSchool) {
      list = list.filter((st) => st.school_id === filterSchool || st.school_name === filterSchool);
    }
    if (filterStatus) {
      list = list.filter((st) => st.status === filterStatus);
    }
    if (query) {
      list = list.filter((st) => st.full_name.toLowerCase().includes(query) || st.id.toLowerCase().includes(query) || st.school_name.toLowerCase().includes(query));
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color: #64748b;">No attendance records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map(
        (st, idx) => `
      <tr>
        <td style="font-weight:700; color:#475569;">#${idx + 1}</td>
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
        <td style="font-size:12px; color:#475569; font-weight:600;">${st.lastScanTime}</td>
        <td>
          <button type="button" class="ret-badge-btn-mini" onclick="window.adminApp.manualToggleStatus('${escapeId(st.id)}')">
            ${st.status === 'clocked_in' ? 'Clock Out' : 'Clock In'}
          </button>
        </td>
      </tr>
    `
      )
      .join('');
  }

  // ─── TAB 5: Badges Studio ───
  renderBadgesTab() {
    const filterSchool = document.getElementById('badge-filter-school')?.value || '';
    const query = document.getElementById('badge-search-input')?.value || '';
    renderBadges(this.students, this.schools, 'badges-grid', filterSchool, query);
  }

  // ─── Navigation ───
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.ret-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.ret-view').forEach((view) => {
      view.classList.toggle('active', view.id === `view-${tabId}`);
    });

    if (tabId === 'students') this.renderStudentsTable();
    else if (tabId === 'schools') this.renderSchoolsDirectory();
    else if (tabId === 'attendance') this.renderAttendanceTable();
    else if (tabId === 'badges') this.renderBadgesTab();
  }

  filterBySchoolAndSwitch(schoolId) {
    const schoolDd = document.getElementById('badge-filter-school');
    if (schoolDd) schoolDd.value = schoolId;
    this.switchTab('badges');
  }

  // ─── Action: Manual Toggle Clock In/Out ───
  async manualToggleStatus(studentId) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return;

    const last = this.attendance.find((a) => a.student_id === studentId);
    const nextAction = last && last.action_type === 'clock_in' ? 'clock_out' : 'clock_in';

    // Call API
    try {
      await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          action_type: nextAction,
          session_name: this.settings.active_session,
          scanner_label: 'Admin Manual Override',
        }),
      });
    } catch (e) {}

    // Update locally
    const record = {
      id: Date.now(),
      student_id: student.id,
      student_name: student.full_name,
      school_name: student.school_name,
      action_type: nextAction,
      session_name: this.settings.active_session,
      scanned_at: new Date().toISOString(),
      scanned_by: 'Admin Override',
    };

    this.attendance.unshift(record);
    this.saveToLocalStorage();
    this.updateStats();
    this.renderStudentsTable();
    this.renderAttendanceTable();
  }

  // ─── Action: Edit Student ───
  openEditStudent(studentId) {
    const st = this.students.find((s) => s.id === studentId);
    if (!st) return;

    document.getElementById('edit-student-id').value = st.id;
    document.getElementById('edit-student-name').value = st.full_name;
    document.getElementById('edit-student-gender').value = st.gender || 'Male';
    document.getElementById('edit-student-level').value = st.level_class || '';
    document.getElementById('edit-student-room').value = st.room_dorm || '';
    document.getElementById('edit-student-contact').value = st.emergency_contact || '';

    const modal = document.getElementById('edit-student-modal');
    if (modal) modal.style.display = 'flex';
  }

  async saveEditStudent(e) {
    e.preventDefault();
    const id = document.getElementById('edit-student-id').value;
    const full_name = document.getElementById('edit-student-name').value.trim();
    const gender = document.getElementById('edit-student-gender').value;
    const level_class = document.getElementById('edit-student-level').value.trim();
    const room_dorm = document.getElementById('edit-student-room').value.trim();
    const emergency_contact = document.getElementById('edit-student-contact').value.trim();

    try {
      await fetch(`${API_BASE}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, gender, level_class, room_dorm, emergency_contact }),
      });
    } catch (e) {}

    const idx = this.students.findIndex((s) => s.id === id);
    if (idx >= 0) {
      this.students[idx] = {
        ...this.students[idx],
        full_name,
        gender,
        level_class,
        room_dorm,
        emergency_contact,
      };
      this.saveToLocalStorage();
    }

    this.closeModals();
    this.renderStudentsTable();
    this.renderBadgesTab();
  }

  // ─── Action: Delete Student ───
  async deleteStudent(studentId) {
    const st = this.students.find((s) => s.id === studentId);
    if (!st) return;

    if (!confirm(`Are you sure you want to delete student delegate "${st.full_name}" (${st.id})? This cannot be undone.`)) {
      return;
    }

    try {
      await fetch(`${API_BASE}/students/${studentId}`, { method: 'DELETE' });
    } catch (e) {}

    this.students = this.students.filter((s) => s.id !== studentId);
    this.attendance = this.attendance.filter((a) => a.student_id !== studentId);
    this.saveToLocalStorage();
    this.updateStats();
    this.renderStudentsTable();
    this.renderSchoolsDirectory();
    this.renderBadgesTab();
  }

  // ─── Action: Edit School ───
  openEditSchool(schoolId) {
    const s = this.schools.find((item) => item.id === schoolId);
    if (!s) return;

    document.getElementById('edit-school-id').value = s.id;
    document.getElementById('edit-school-name').value = s.name;
    document.getElementById('edit-school-category').value = s.category || 'Senior High School';
    document.getElementById('edit-school-region').value = s.region || '';
    document.getElementById('edit-school-patron').value = s.patron_name || s.teacher_incharge_name || '';
    document.getElementById('edit-school-phone').value = s.patron_phone || s.teacher_incharge_contact || '';
    document.getElementById('edit-school-notes').value = s.notes || '';

    const modal = document.getElementById('edit-school-modal');
    if (modal) modal.style.display = 'flex';
  }

  async saveEditSchool(e) {
    e.preventDefault();
    const id = document.getElementById('edit-school-id').value;
    const name = document.getElementById('edit-school-name').value.trim();
    const category = document.getElementById('edit-school-category').value;
    const region = document.getElementById('edit-school-region').value.trim();
    const patron_name = document.getElementById('edit-school-patron').value.trim();
    const patron_phone = document.getElementById('edit-school-phone').value.trim();
    const notes = document.getElementById('edit-school-notes').value.trim();

    try {
      await fetch(`${API_BASE}/schools/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, region, patron_name, patron_phone, notes }),
      });
    } catch (e) {}

    const idx = this.schools.findIndex((s) => s.id === id);
    if (idx >= 0) {
      this.schools[idx] = {
        ...this.schools[idx],
        name,
        category,
        region,
        patron_name,
        patron_phone,
        notes,
      };
      // Also update school_name on existing students of this school
      this.students.forEach((st) => {
        if (st.school_id === id) st.school_name = name;
      });
      this.saveToLocalStorage();
    }

    this.closeModals();
    this.renderAll();
  }

  // ─── Action: Delete School ───
  async deleteSchool(schoolId) {
    const s = this.schools.find((item) => item.id === schoolId);
    if (!s) return;

    const count = this.students.filter((st) => st.school_id === schoolId).length;
    if (!confirm(`Are you sure you want to delete "${s.name}" along with all ${count} student delegates? This action cannot be undone.`)) {
      return;
    }

    try {
      await fetch(`${API_BASE}/schools/${schoolId}`, { method: 'DELETE' });
    } catch (e) {}

    this.schools = this.schools.filter((item) => item.id !== schoolId);
    const deletedStudentIds = this.students.filter((st) => st.school_id === schoolId).map((st) => st.id);
    this.students = this.students.filter((st) => st.school_id !== schoolId);
    this.attendance = this.attendance.filter((a) => !deletedStudentIds.includes(a.student_id));

    this.saveToLocalStorage();
    this.renderAll();
  }

  closeModals() {
    document.querySelectorAll('.admin-modal-backdrop').forEach((m) => {
      m.style.display = 'none';
    });
  }

  // ─── TAB 3: Data Collection / Intake Submission ───
  async handleIntakeSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const registrantName = form['registrant_name'].value.trim();
    const registrantContact = form['registrant_contact'].value.trim();
    const schoolName = form['school_name'].value.trim();
    const category = form['school_category'].value;
    const teacherName = form['teacher_name'].value.trim();
    const teacherContact = form['teacher_contact'].value.trim();

    if (!schoolName) {
      alert('Please enter the school name.');
      return;
    }

    // Determine students list
    let students = [];
    const pasteText = document.getElementById('intake-roster-paste')?.value || '';
    if (pasteText.trim()) {
      students = this.parseStudentRosterText(pasteText);
    } else if (this.intakeFileStudents.length > 0) {
      students = [...this.intakeFileStudents];
    }

    if (students.length === 0) {
      alert('Please add at least 1 student name in the roster box.');
      return;
    }

    const schoolId = `sch_${Date.now()}`;
    const schoolCode = schoolName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'SCH';

    const newSchool = {
      id: schoolId,
      school_code: schoolCode,
      name: schoolName,
      category,
      region: 'Ghana',
      registrant_name: registrantName,
      registrant_contact: registrantContact,
      patron_name: teacherName || registrantName,
      patron_phone: teacherContact || registrantContact,
      created_at: new Date().toISOString(),
    };

    const newStudents = students.map((st, idx) => {
      const num = String(idx + 1).padStart(3, '0');
      const studentId = `RET26-${schoolCode}-${num}`;
      return {
        id: studentId,
        school_id: schoolId,
        school_name: schoolName,
        full_name: st.full_name,
        gender: st.gender || 'Male',
        level_class: st.level_class || 'Student Delegate',
        room_dorm: st.room_dorm || '',
        emergency_contact: teacherContact || registrantContact,
        qr_payload: studentId,
        created_at: new Date().toISOString(),
      };
    });

    // Send to API
    try {
      await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school: newSchool, students: newStudents }),
      });
    } catch (e) {}

    this.schools.unshift(newSchool);
    this.students.push(...newStudents);
    this.saveToLocalStorage();

    form.reset();
    document.getElementById('intake-roster-paste').value = '';
    this.intakeFileStudents = [];

    this.renderAll();
    alert(`🎉 Successfully registered "${schoolName}" with ${newStudents.length} student delegate badges!`);
    this.filterBySchoolAndSwitch(schoolId);
  }

  parseStudentRosterText(rawText) {
    if (!rawText || !rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    return lines.map((line, idx) => {
      let parts = line.split(/[,\t]/).map((p) => p.trim());
      const name = parts[0] || `Delegate ${idx + 1}`;
      let gender = 'Male';
      let level = 'Form 3';
      let room = '';

      if (parts[1]) {
        const g = parts[1].toLowerCase();
        if (g.startsWith('f')) gender = 'Female';
        else if (g.startsWith('m')) gender = 'Male';
        else level = parts[1];
      }

      if (parts[2]) {
        if (parts[2].toLowerCase().includes('hall') || parts[2].toLowerCase().includes('room') || parts[2].toLowerCase().includes('house')) {
          room = parts[2];
        } else {
          level = parts[2];
        }
      }

      if (parts[3]) room = parts[3];

      return { full_name: name, gender, level_class: level, room_dorm: room };
    });
  }

  // ─── Export Features (Excel & CSV) ───
  exportAllToExcel() {
    if (typeof XLSX === 'undefined') {
      alert('Spreadsheet engine loading, please try again in a moment.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Students
    const studentStatusMap = {};
    this.attendance.forEach((a) => {
      if (!studentStatusMap[a.student_id]) studentStatusMap[a.student_id] = a;
    });

    const studentsData = this.students.map((st, i) => {
      const scan = studentStatusMap[st.id];
      return {
        '#': i + 1,
        'Badge ID': st.id,
        'Student Name': st.full_name,
        'School': st.school_name,
        'Gender': st.gender,
        'Class/Level': st.level_class || '',
        'Room/Dorm': st.room_dorm || '',
        'Emergency Contact': st.emergency_contact || '',
        'Current Status': scan ? (scan.action_type === 'clock_in' ? 'Clocked In' : 'Clocked Out') : 'Not Arrived',
        'Last Scan Time': scan ? new Date(scan.scanned_at).toLocaleString() : '',
      };
    });
    const wsStudents = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Student Delegates');

    // Sheet 2: Schools
    const schoolsData = this.schools.map((s, i) => ({
      '#': i + 1,
      'School Code': s.school_code,
      'School Name': s.name,
      'Category': s.category,
      'Region': s.region,
      'Teacher In-Charge': s.patron_name,
      'Contact': s.patron_phone,
      'Total Delegates': this.students.filter((st) => st.school_id === s.id).length,
    }));
    const wsSchools = XLSX.utils.json_to_sheet(schoolsData);
    XLSX.utils.book_append_sheet(wb, wsSchools, 'Schools Directory');

    // Sheet 3: Attendance Logs
    const attendanceData = this.attendance.map((a, i) => ({
      '#': i + 1,
      'Student Name': a.student_name,
      'Student ID': a.student_id,
      'School': a.school_name,
      'Action': a.action_type === 'clock_in' ? 'Clock In' : 'Clock Out',
      'Session': a.session_name,
      'Time': new Date(a.scanned_at).toLocaleString(),
      'Gate/Terminal': a.scanned_by,
    }));
    const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, wsAttendance, 'Gate Attendance Logs');

    XLSX.writeFile(wb, `PENSA_RETREAT_MASTER_DATA_${Date.now()}.xlsx`);
  }

  exportSchoolExcel(schoolId) {
    if (typeof XLSX === 'undefined') return;
    const school = this.schools.find((s) => s.id === schoolId);
    if (!school) return;

    const list = this.students.filter((st) => st.school_id === schoolId);
    const data = list.map((st, i) => ({
      '#': i + 1,
      'Student ID': st.id,
      'Full Name': st.full_name,
      'Gender': st.gender,
      'Class/Level': st.level_class,
      'Room/Dorm': st.room_dorm,
      'Emergency Contact': st.emergency_contact,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, school.school_code || 'Roster');
    XLSX.writeFile(wb, `${school.name.replace(/[^A-Za-z0-9]/g, '_')}_ROSTER.xlsx`);
  }

  exportStudentsExcel() {
    if (typeof XLSX === 'undefined') return;
    const filterSchool = document.getElementById('student-filter-school')?.value || '';
    let list = this.students;
    if (filterSchool) list = list.filter((st) => st.school_id === filterSchool);

    const data = list.map((st, i) => ({
      '#': i + 1,
      'Badge ID': st.id,
      'Full Name': st.full_name,
      'School Name': st.school_name,
      'Gender': st.gender,
      'Class/Level': st.level_class,
      'Room/Dorm': st.room_dorm,
      'Emergency Contact': st.emergency_contact,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delegates');
    XLSX.writeFile(wb, `STUDENT_DELEGATES_${Date.now()}.xlsx`);
  }

  exportStudentsCsv() {
    const filterSchool = document.getElementById('student-filter-school')?.value || '';
    let list = this.students;
    if (filterSchool) list = list.filter((st) => st.school_id === filterSchool);

    const headers = ['#', 'Badge ID', 'Full Name', 'School Name', 'Gender', 'Class/Level', 'Room/Dorm', 'Emergency Contact'];
    const rows = list.map((st, i) => [
      i + 1,
      `"${st.id}"`,
      `"${st.full_name}"`,
      `"${st.school_name}"`,
      `"${st.gender}"`,
      `"${st.level_class || ''}"`,
      `"${st.room_dorm || ''}"`,
      `"${st.emergency_contact || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `STUDENTS_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportAttendanceExcel() {
    if (typeof XLSX === 'undefined') return;
    const studentStatusMap = {};
    this.attendance.forEach((a) => {
      if (!studentStatusMap[a.student_id]) studentStatusMap[a.student_id] = a;
    });

    const data = this.students.map((st, i) => {
      const scan = studentStatusMap[st.id];
      return {
        '#': i + 1,
        'Badge ID': st.id,
        'Full Name': st.full_name,
        'School': st.school_name,
        'Status': scan ? (scan.action_type === 'clock_in' ? 'Clocked In' : 'Clocked Out') : 'Not Arrived',
        'Last Scanned': scan ? new Date(scan.scanned_at).toLocaleString() : '',
        'Session': scan ? scan.session_name : this.settings.active_session,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Manifest');
    XLSX.writeFile(wb, `ATTENDANCE_MANIFEST_${Date.now()}.xlsx`);
  }

  async clearAttendance() {
    if (!confirm('Are you sure you want to clear all attendance scans for this session? This action cannot be undone.')) {
      return;
    }

    try {
      await fetch(`${API_BASE}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_attendance' }),
      });
    } catch (e) {}

    this.attendance = [];
    this.saveToLocalStorage();
    this.updateStats();
    this.renderAttendanceTable();
    this.renderStudentsTable();
  }

  // ─── Bind DOM Events ───
  bindEvents() {
    // Tab switching
    document.querySelectorAll('.ret-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Session select
    const sessionSelect = document.getElementById('session-select');
    if (sessionSelect) {
      sessionSelect.addEventListener('change', (e) => {
        this.settings.active_session = e.target.value;
        this.saveToLocalStorage();
        this.updateStats();
        this.renderStudentsTable();
        this.renderAttendanceTable();
      });
    }

    // Student filters & search
    document.getElementById('student-filter-school')?.addEventListener('change', () => this.renderStudentsTable());
    document.getElementById('student-filter-status')?.addEventListener('change', () => this.renderStudentsTable());
    document.getElementById('student-filter-gender')?.addEventListener('change', () => this.renderStudentsTable());
    document.getElementById('student-search-input')?.addEventListener('input', () => this.renderStudentsTable());

    // Student export buttons
    document.getElementById('export-students-excel-btn')?.addEventListener('click', () => this.exportStudentsExcel());
    document.getElementById('export-students-csv-btn')?.addEventListener('click', () => this.exportStudentsCsv());
    document.getElementById('export-all-excel-btn')?.addEventListener('click', () => this.exportAllToExcel());

    // Attendance filters & export
    document.getElementById('attendance-filter-school')?.addEventListener('change', () => this.renderAttendanceTable());
    document.getElementById('attendance-filter-status')?.addEventListener('change', () => this.renderAttendanceTable());
    document.getElementById('attendance-search-input')?.addEventListener('input', () => this.renderAttendanceTable());
    document.getElementById('export-attendance-excel-btn')?.addEventListener('click', () => this.exportAttendanceExcel());
    document.getElementById('clear-attendance-btn')?.addEventListener('click', () => this.clearAttendance());

    // Badge filters & print
    document.getElementById('badge-filter-school')?.addEventListener('change', () => this.renderBadgesTab());
    document.getElementById('badge-search-input')?.addEventListener('input', () => this.renderBadgesTab());
    document.getElementById('print-badges-btn')?.addEventListener('click', () => window.print());

    // Intake sub-tabs
    document.getElementById('intake-tab-paste')?.addEventListener('click', () => {
      document.getElementById('intake-tab-paste').classList.add('active');
      document.getElementById('intake-tab-file').classList.remove('active');
      document.getElementById('intake-mode-paste').style.display = 'block';
      document.getElementById('intake-mode-file').style.display = 'none';
    });

    document.getElementById('intake-tab-file')?.addEventListener('click', () => {
      document.getElementById('intake-tab-file').classList.add('active');
      document.getElementById('intake-tab-paste').classList.remove('active');
      document.getElementById('intake-mode-file').style.display = 'block';
      document.getElementById('intake-mode-paste').style.display = 'none';
    });

    // Intake Paste auto-counter
    const pasteInput = document.getElementById('intake-roster-paste');
    const pasteCountEl = document.getElementById('intake-paste-count');
    if (pasteInput && pasteCountEl) {
      pasteInput.addEventListener('input', () => {
        const parsed = this.parseStudentRosterText(pasteInput.value);
        pasteCountEl.textContent = `${parsed.length} student name${parsed.length === 1 ? '' : 's'} detected`;
      });
    }

    // Intake File Dropzone
    const dropzone = document.getElementById('intake-dropzone');
    const fileInput = document.getElementById('intake-file-input');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleIntakeFile(file);
      });
    }

    // Intake Form Submission
    document.getElementById('admin-intake-form')?.addEventListener('submit', (e) => this.handleIntakeSubmit(e));

    // Edit Modals
    document.getElementById('edit-student-form')?.addEventListener('submit', (e) => this.saveEditStudent(e));
    document.getElementById('edit-school-form')?.addEventListener('submit', (e) => this.saveEditSchool(e));
  }

  handleIntakeFile(file) {
    if (typeof XLSX === 'undefined') return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });

        const students = [];
        for (const row of rows) {
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
          this.intakeFileStudents = students;
          const pasteInput = document.getElementById('intake-roster-paste');
          if (pasteInput) {
            pasteInput.value = students.map((st) => `${st.full_name}, ${st.gender}, ${st.level_class}`).join('\n');
            const countEl = document.getElementById('intake-paste-count');
            if (countEl) countEl.textContent = `${students.length} students loaded from file`;
          }
          document.getElementById('intake-tab-paste')?.click();
        }
      } catch (err) {
        console.error('File parsing error:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

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

window.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminDataApp();
  window.adminApp.init();
});
