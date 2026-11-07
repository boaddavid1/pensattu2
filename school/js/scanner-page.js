// school/js/scanner-page.js — Controller for Dedicated Gate Scanner Terminal

import { sound } from './scanner.js';

const STORAGE_KEY = 'pensa_retreat_state_v1';
const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3001/api/school' : '/api/school';

class GateScannerTerminal {
  constructor() {
    this.html5QrCode = null;
    this.isCameraRunning = false;
    this.currentFacingMode = 'environment'; // Back camera by default
    this.scannerMode = 'auto'; // 'auto', 'clock_in', 'clock_out'
    this.soundEnabled = true;
    this.lastScannedCode = '';
    this.lastScannedTime = 0;

    this.settings = {
      retreat_title: 'PENSA Schools & Campus Spiritual Retreat 2026',
      active_session: 'Morning Plenary & Worship Session',
      sessions: [
        { id: 'sess_1', name: 'Day 1: Opening & Evening Revival' },
        { id: 'sess_2', name: 'Day 2: Morning Plenary & Worship Session' },
        { id: 'sess_3', name: 'Day 2: Leadership Seminar & Workshops' },
        { id: 'sess_4', name: 'Day 3: Holy Ghost & Healing Encounter' },
        { id: 'sess_5', name: 'Day 4: Communion & Commissioning Service' },
      ],
    };
    this.schools = [];
    this.students = [];
    this.attendance = [];
  }

  async init() {
    this.loadLocalState();
    await this.fetchServerData().catch(() => {});
    this.bindDomEvents();
    this.updateStats();
    this.renderSessionSelect();
    this.renderRecentScans();
    await this.startCamera();
  }

  loadLocalState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.schools) this.schools = parsed.schools;
        if (parsed.students) this.students = parsed.students;
        if (parsed.attendance) this.attendance = parsed.attendance;
        if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
      }
    } catch (e) {}
  }

  saveLocalState() {
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

  async fetchServerData() {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (res.ok) {
        const data = await res.json();
        if (data.schools) this.schools = data.schools;
        if (data.students) this.students = data.students;
        if (data.attendance) this.attendance = data.attendance;
        if (data.settings) this.settings = { ...this.settings, ...data.settings };
        this.saveLocalState();
        this.updateStats();
        this.renderSessionSelect();
        this.renderRecentScans();
      }
    } catch (e) {
      console.warn('Working in offline/cached mode');
    }
  }

  renderSessionSelect() {
    const select = document.getElementById('active-session-select');
    if (!select) return;

    select.innerHTML = (this.settings.sessions || [])
      .map(
        (s) => `<option value="${s.name}" ${s.name === this.settings.active_session ? 'selected' : ''}>${s.name}</option>`
      )
      .join('');
  }

  updateStats() {
    const totalStudents = this.students.length;
    const activeSession = this.settings.active_session;

    // Filter attendance for current session
    const latestStatusMap = {};
    let totalSessionScans = 0;

    this.attendance
      .filter((a) => !activeSession || a.session_name === activeSession)
      .forEach((a) => {
        totalSessionScans++;
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

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('stat-clocked-in', clockedIn);
    setVal('stat-clocked-out', clockedOut);
    setVal('stat-total-scans', totalSessionScans);
    setVal('stat-total-students', totalStudents);
    setVal('recent-count-pill', this.attendance.length);
  }

  renderRecentScans() {
    const list = document.getElementById('recent-scans-feed');
    if (!list) return;

    const recent = this.attendance.slice(0, 15);
    if (recent.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding: 24px; color: #64748b; font-size: 13px;">No scans recorded yet for this session.</div>`;
      return;
    }

    list.innerHTML = recent
      .map((s) => {
        const isClockIn = s.action_type === 'clock_in';
        return `
        <div class="scan-recent-item">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:28px; height:28px; border-radius:50%; background:${isClockIn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}; color:${isClockIn ? '#34d399' : '#60a5fa'}; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; border: 1px solid ${isClockIn ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'};">
              ${isClockIn ? 'IN' : 'OUT'}
            </span>
            <div>
              <div style="font-size:13.5px; font-weight:800; color:#f8fafc;">${escapeHtml(s.student_name)}</div>
              <div style="font-size:11.5px; color:#94a3b8;">${escapeHtml(s.school_name)} • <span style="font-family:monospace;">${escapeHtml(s.student_id)}</span></div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px; font-weight:700; color:#cbd5e1;">
              ${new Date(s.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  // ─── Camera Lifecycle ───
  async startCamera() {
    if (this.isCameraRunning) return;
    const readerEl = document.getElementById('reader');
    if (!readerEl || !window.Html5Qrcode) return;

    try {
      if (!this.html5QrCode) {
        this.html5QrCode = new window.Html5Qrcode('reader');
      }

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      await this.html5QrCode.start(
        { facingMode: this.currentFacingMode },
        config,
        (decodedText) => this.handleScan(decodedText),
        () => {} // suppress continuous frame detection errors
      );

      this.isCameraRunning = true;
      this.updateCameraStatus('Active');
    } catch (err) {
      console.error('Camera initialization error:', err);
      this.updateCameraStatus(`Camera error: ${err.message || 'Permission denied'}`);
    }
  }

  async stopCamera() {
    if (this.html5QrCode && this.isCameraRunning) {
      try {
        await this.html5QrCode.stop();
      } catch (e) {}
      this.isCameraRunning = false;
      this.updateCameraStatus('Paused');
    }
  }

  async flipCamera() {
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    if (this.isCameraRunning) {
      await this.stopCamera();
      await this.startCamera();
    }
  }

  updateCameraStatus(msg) {
    const indicator = document.getElementById('camera-status-indicator');
    const pauseBtn = document.getElementById('pause-camera-btn');
    if (indicator) {
      if (this.isCameraRunning) {
        indicator.innerHTML = `<span style="color: #34d399;">● Camera Active (${this.currentFacingMode === 'environment' ? 'Rear' : 'Front'})</span>`;
      } else {
        indicator.innerHTML = `<span style="color: #94a3b8;">○ Camera Paused</span>`;
      }
    }
    if (pauseBtn) {
      pauseBtn.textContent = this.isCameraRunning ? '⏸️ Pause' : '▶️ Resume';
    }
  }

  // ─── Scan Processing ───
  async handleScan(rawCode) {
    if (!rawCode) return;
    const cleanId = String(rawCode).trim().toUpperCase();

    // Debounce rapid identical scans within 2.5 seconds
    const now = Date.now();
    if (cleanId === this.lastScannedCode && now - this.lastScannedTime < 2500) {
      return;
    }
    this.lastScannedCode = cleanId;
    this.lastScannedTime = now;

    // 1. Locate student locally or in cache
    let student = this.students.find(
      (st) => st.id.toUpperCase() === cleanId || (st.qr_payload && st.qr_payload.toUpperCase() === cleanId)
    );

    // 2. Call API
    let apiResult = null;
    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: cleanId,
          action_type: this.scannerMode,
          session_name: this.settings.active_session,
          scanner_label: 'Gate Camera Terminal',
        }),
      });

      if (res.ok) {
        apiResult = await res.json();
        if (apiResult.student) student = apiResult.student;
      }
    } catch (e) {
      // Offline fallback handling
    }

    if (!student) {
      if (this.soundEnabled) sound.playError();
      this.renderFeedbackCard({
        type: 'error',
        title: 'UNRECOGNIZED QR BADGE',
        message: `Badge code "${cleanId}" does not match any registered student delegate in the database.`,
      });
      return;
    }

    // 3. Determine action
    const lastScan = this.attendance.find(
      (a) => a.student_id === student.id && a.session_name === this.settings.active_session
    );

    let finalAction = this.scannerMode === 'auto'
      ? (lastScan && lastScan.action_type === 'clock_in' ? 'clock_out' : 'clock_in')
      : this.scannerMode;

    // 4. Duplicate scan cooldown check
    if (lastScan && lastScan.action_type === finalAction && Date.now() - new Date(lastScan.scanned_at).getTime() < 10000) {
      if (this.soundEnabled) sound.playWarning();
      this.renderFeedbackCard({
        type: 'warning',
        student,
        title: `ALREADY ${finalAction === 'clock_in' ? 'CLOCKED IN' : 'CLOCKED OUT'}`,
        message: `Student was already recorded ${finalAction === 'clock_in' ? 'in' : 'out'} moments ago.`,
      });
      return;
    }

    // 5. Create scan log entry
    const scanRecord = apiResult?.record || {
      id: Date.now(),
      student_id: student.id,
      student_name: student.full_name,
      school_name: student.school_name,
      action_type: finalAction,
      session_name: this.settings.active_session,
      scanned_at: new Date().toISOString(),
      scanned_by: 'Gate Terminal',
    };

    this.attendance.unshift(scanRecord);
    this.saveLocalState();
    this.updateStats();
    this.renderRecentScans();

    // 6. Sound feedback
    if (this.soundEnabled) {
      if (finalAction === 'clock_in') sound.playClockIn();
      else sound.playClockOut();
    }

    // 7. Visual feedback
    this.renderFeedbackCard({
      type: finalAction,
      student,
      scanRecord,
    });

    // Refocus manual input for continuous barcode gun scanning
    const barcodeInput = document.getElementById('barcode-input');
    if (barcodeInput) {
      barcodeInput.value = '';
      barcodeInput.focus();
    }
  }

  renderFeedbackCard(data) {
    const card = document.getElementById('scan-feedback-card');
    if (!card) return;

    if (data.type === 'error') {
      card.className = 'scan-card-feedback error';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:42px;">❌</div>
          <div>
            <div style="font-size:12px; font-weight:800; color:#fca5a5; letter-spacing:0.06em; text-transform:uppercase;">${data.title}</div>
            <div style="font-size:15px; font-weight:700; color:#ffffff; margin-top:4px;">${escapeHtml(data.message)}</div>
          </div>
        </div>
      `;
      return;
    }

    if (data.type === 'warning') {
      card.className = 'scan-card-feedback warning';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:42px;">⚠️</div>
          <div>
            <div style="font-size:11.5px; font-weight:800; color:#fde68a; letter-spacing:0.06em; text-transform:uppercase;">DUPLICATE GATE PASS RECORDED</div>
            <div style="font-family:var(--font-heading); font-size:20px; font-weight:800; color:#ffffff; margin:2px 0;">
              ${escapeHtml(data.student.full_name)}
            </div>
            <div style="font-size:13px; color:#fef3c7;">${escapeHtml(data.student.school_name)} • ${escapeHtml(data.message)}</div>
          </div>
        </div>
      `;
      return;
    }

    const isClockIn = data.type === 'clock_in';
    card.className = `scan-card-feedback ${isClockIn ? 'clocked_in' : 'clocked_out'}`;

    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:58px; height:58px; border-radius:50%; background:${isClockIn ? '#10b981' : '#3b82f6'}; color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; box-shadow:0 6px 18px rgba(0,0,0,0.3);">
            ${isClockIn ? '✓' : '🚪'}
          </div>
          <div>
            <div style="font-size:11.5px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:${isClockIn ? '#6ee7b7' : '#93c5fd'};">
              ${isClockIn ? '✅ CLOCKED IN (WELCOME TO RETREAT)' : '🚪 CLOCKED OUT (SEE YOU SOON)'}
            </div>
            <!-- Large prominent student name -->
            <div style="font-family:var(--font-heading); font-size:24px; font-weight:900; color:#ffffff; margin:3px 0; text-shadow:0 2px 4px rgba(0,0,0,0.3);">
              ${escapeHtml(data.student.full_name)}
            </div>
            <div style="font-size:13.5px; color:#e2e8f0; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <span style="font-weight:700;">🏫 ${escapeHtml(data.student.school_name)}</span>
              <span>•</span>
              <span style="font-size:12.5px; color:#94a3b8;">${escapeHtml(data.student.level_class || 'Delegate')}</span>
              <span>•</span>
              <span style="font-family:monospace; font-weight:700; color:#fbbf24;">${escapeHtml(data.student.id)}</span>
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11.5px; color:#94a3b8;">Recorded Time</div>
          <div style="font-size:18px; font-weight:900; color:#ffffff; font-family:monospace;">
            ${new Date(data.scanRecord.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${escapeHtml(data.scanRecord.session_name)}</div>
        </div>
      </div>
    `;
  }

  // ─── Bind DOM Events ───
  bindDomEvents() {
    // Mode toggles
    document.querySelectorAll('.scan-mode-btn[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scan-mode-btn[data-mode]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.scannerMode = btn.dataset.mode;
      });
    });

    // Session select
    const sessionSelect = document.getElementById('active-session-select');
    if (sessionSelect) {
      sessionSelect.addEventListener('change', (e) => {
        this.settings.active_session = e.target.value;
        this.saveLocalState();
        this.updateStats();
        this.renderRecentScans();
      });
    }

    // Flip Camera button
    const flipBtn = document.getElementById('flip-camera-btn');
    if (flipBtn) {
      flipBtn.addEventListener('click', () => this.flipCamera());
    }

    // Pause/Resume Camera button
    const pauseBtn = document.getElementById('pause-camera-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (this.isCameraRunning) {
          this.stopCamera();
        } else {
          this.startCamera();
        }
      });
    }

    // Toggle sound
    const soundBtn = document.getElementById('toggle-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        soundBtn.textContent = this.soundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
        soundBtn.style.color = this.soundEnabled ? '#34d399' : '#94a3b8';
      });
    }

    // Barcode input box & submit button
    const barcodeInput = document.getElementById('barcode-input');
    const barcodeSubmitBtn = document.getElementById('barcode-submit-btn');

    const triggerManualScan = () => {
      if (!barcodeInput) return;
      const code = barcodeInput.value.trim();
      if (!code) return;
      this.handleScan(code);
    };

    if (barcodeSubmitBtn) {
      barcodeSubmitBtn.addEventListener('click', triggerManualScan);
    }

    if (barcodeInput) {
      barcodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerManualScan();
        }
      });
    }
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

window.addEventListener('DOMContentLoaded', () => {
  window.gateScanner = new GateScannerTerminal();
  window.gateScanner.init();
});
