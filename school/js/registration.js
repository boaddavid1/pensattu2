// school/js/registration.js — Dedicated School Registration & QR Badge Generation Controller

import { renderBadges, printSingleBadge, downloadBadgeImage } from './badges.js';

// Expose badge actions globally for inline button onclick handlers
window.printSingleBadge = printSingleBadge;
window.downloadBadgeImage = downloadBadgeImage;

const STORAGE_KEY = 'pensa_retreat_state_v1';
const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3001/api/school' : '/api/school';

class RegistrationController {
  constructor() {
    this.parsedStudents = [];
    this.uploadedFileName = '';
    this.lastRegisteredSchool = null;
    this.lastRegisteredStudents = [];
  }

  init() {
    this.bindDropzoneEvents();
    this.bindFormEvents();
    this.bindTemplateDownload();
    this.bindPasteFallback();
  }

  // ─── 1. Drag & Drop and File Input Handler ───
  bindDropzoneEvents() {
    const dropzone = document.getElementById('roster-dropzone');
    const fileInput = document.getElementById('roster-file-input');

    if (!dropzone || !fileInput) return;

    // Click dropzone to open file picker
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        this.processUploadedFile(file);
      }
    });

    // Drag over / leave effects
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    // Drop handler
    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      if (file) {
        this.processUploadedFile(file);
      }
    });
  }

  // ─── 2. Process & Parse Uploaded File ───
  processUploadedFile(file) {
    this.uploadedFileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      this.parseFileContent(content, file.name);
    };

    reader.onerror = () => {
      alert('Could not read the uploaded file. Please make sure it is a valid CSV or plain text file.');
    };

    reader.readAsText(file);
  }

  parseFileContent(rawText, fileName = 'uploaded_file.csv') {
    if (!rawText || !rawText.trim()) {
      alert('The uploaded file appears to be empty.');
      return;
    }

    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      alert('No valid student lines found in file.');
      return;
    }

    // Check if line 1 looks like a CSV header row (e.g. "Name", "Student", "Full Name")
    let startIndex = 0;
    const firstLineLower = lines[0].toLowerCase();
    if (
      firstLineLower.includes('name') ||
      firstLineLower.includes('student') ||
      firstLineLower.includes('fullname') ||
      firstLineLower.includes('gender')
    ) {
      startIndex = 1; // skip header row
    }

    const students = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Split by comma or tab
      const parts = line.split(/[,\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      let rawName = parts[0] || '';

      // Clean leading numbering like "1.", "1 -", "1)", "01."
      rawName = rawName.replace(/^(\d+[\.\-\)]\s*)+/, '').trim();
      if (!rawName || rawName.length < 2) continue;

      // Extract gender if given
      let gender = 'Male';
      let level = 'Student Delegate';
      let room = '';

      if (parts[1]) {
        const g = parts[1].toLowerCase();
        if (g.startsWith('f') || g === 'female' || g === 'girl') gender = 'Female';
        else if (g.startsWith('m') || g === 'male' || g === 'boy') gender = 'Male';
        else level = parts[1];
      }

      if (parts[2]) {
        const p2 = parts[2].toLowerCase();
        if (p2.includes('hall') || p2.includes('house') || p2.includes('room') || p2.includes('dorm')) {
          room = parts[2];
        } else {
          level = parts[2];
        }
      }

      if (parts[3]) room = parts[3];

      students.push({
        full_name: rawName,
        gender,
        level_class: level,
        room_dorm: room,
      });
    }

    if (students.length === 0) {
      alert('Could not find any student names in the uploaded file. Please check the file format.');
      return;
    }

    this.parsedStudents = students;
    this.renderUploadPreview(fileName, students);
  }

  renderUploadPreview(fileName, students) {
    const statusWrap = document.getElementById('upload-status-wrap');
    const dropzone = document.getElementById('roster-dropzone');
    const countBadge = document.getElementById('upload-count-badge');
    const fileNameEl = document.getElementById('upload-filename-text');
    const previewList = document.getElementById('upload-names-preview');

    if (dropzone) dropzone.style.display = 'none';
    if (statusWrap) statusWrap.style.display = 'block';

    if (countBadge) {
      countBadge.textContent = `${students.length} Student Names Loaded`;
    }

    if (fileNameEl) {
      fileNameEl.textContent = fileName;
    }

    if (previewList) {
      const previewItems = students.slice(0, 10);
      const remaining = students.length - previewItems.length;

      previewList.innerHTML = previewItems
        .map(
          (st, idx) => `
        <span class="ret-preview-name-chip">
          <span class="ret-preview-num">#${idx + 1}</span>
          <strong>${this.escapeHtml(st.full_name)}</strong>
          <span class="ret-preview-gender">${st.gender === 'Female' ? '👩' : '👨'}</span>
        </span>
      `
        )
        .join('');

      if (remaining > 0) {
        previewList.innerHTML += `
          <span class="ret-preview-name-chip more">
            + ${remaining} more student delegates
          </span>
        `;
      }
    }
  }

  clearUploadedRoster() {
    this.parsedStudents = [];
    this.uploadedFileName = '';
    const fileInput = document.getElementById('roster-file-input');
    const dropzone = document.getElementById('roster-dropzone');
    const statusWrap = document.getElementById('upload-status-wrap');
    const pasteArea = document.getElementById('roster-paste-textarea');

    if (fileInput) fileInput.value = '';
    if (pasteArea) pasteArea.value = '';
    if (statusWrap) statusWrap.style.display = 'none';
    if (dropzone) dropzone.style.display = 'block';
  }

  // ─── 3. Direct Paste Fallback ───
  bindPasteFallback() {
    const pasteToggleBtn = document.getElementById('toggle-paste-btn');
    const pasteBox = document.getElementById('paste-fallback-box');
    const pasteArea = document.getElementById('roster-paste-textarea');

    if (!pasteToggleBtn || !pasteBox || !pasteArea) return;

    pasteToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = pasteBox.style.display === 'none';
      pasteBox.style.display = isHidden ? 'block' : 'none';
      pasteToggleBtn.textContent = isHidden ? '✕ Hide Paste Box' : '📋 Or paste names from clipboard';
    });

    pasteArea.addEventListener('input', () => {
      const text = pasteArea.value.trim();
      if (text) {
        this.parseFileContent(text, 'Pasted Names List');
      }
    });
  }

  // ─── 4. Sample CSV Template Download ───
  bindTemplateDownload() {
    const btn = document.getElementById('download-template-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const csvContent =
        'Full Name,Gender,Class / Level,Hostel / Room\n' +
        'Kwame Mensah Addo,Male,Form 3 Science,St. Luke Hall\n' +
        'Akosua Serwaa Boateng,Female,Form 3 Arts,Ruth House\n' +
        'Emmanuel Kojo Antwi,Male,Form 2 Business,St. Peter Hall\n' +
        'Priscilla Ewurama Baidoo,Female,Form 2 Science,Esther House\n' +
        'David Osei Poku,Male,Form 3 Arts,St. Luke Hall\n' +
        'Blessing Nana Yaa Frimpong,Female,Form 2 Visual Arts,Esther House\n';

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'retreat_student_roster_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ─── 5. Form Submission & QR Badge Generation ───
  bindFormEvents() {
    const form = document.getElementById('school-registration-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(form);
    });

    const resetBtn = document.getElementById('register-another-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetToRegistrationForm();
      });
    }

    const changeFileBtn = document.getElementById('upload-change-file-btn');
    if (changeFileBtn) {
      changeFileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearUploadedRoster();
      });
    }
  }

  async handleSubmit(form) {
    const submitBtn = document.getElementById('submit-btn');

    // 1. Read required fields specified by user
    const registrantName = (form['name'] ? form['name'].value : '').trim();
    const registrantContact = (form['contact'] ? form['contact'].value : '').trim();
    const schoolName = (form['school_name'] ? form['school_name'].value : '').trim();
    const teacherInchargeName = (form['teacher_incharge_name'] ? form['teacher_incharge_name'].value : '').trim();
    const teacherInchargeContact = (form['teacher_incharge_contact'] ? form['teacher_incharge_contact'].value : '').trim();

    // Validation
    if (!registrantName) {
      alert('Please enter the Registrant Full Name.');
      form['name']?.focus();
      return;
    }
    if (!registrantContact) {
      alert('Please enter your Contact Phone / WhatsApp number.');
      form['contact']?.focus();
      return;
    }
    if (!schoolName) {
      alert('Please enter the Name of School.');
      form['school_name']?.focus();
      return;
    }
    if (!teacherInchargeName) {
      alert('Please enter the Teacher In-Charge of Students Name.');
      form['teacher_incharge_name']?.focus();
      return;
    }
    if (!teacherInchargeContact) {
      alert('Please enter the Teacher In-Charge Contact Phone / WhatsApp.');
      form['teacher_incharge_contact']?.focus();
      return;
    }

    // Check student roster
    let studentList = [...this.parsedStudents];

    // Fallback: check paste box if parsedStudents is empty
    const pasteBox = document.getElementById('roster-paste-textarea');
    if (studentList.length === 0 && pasteBox && pasteBox.value.trim()) {
      this.parseFileContent(pasteBox.value.trim(), 'Pasted Roster');
      studentList = [...this.parsedStudents];
    }

    if (studentList.length === 0) {
      alert('Please upload a file containing the names of students who will attend, or paste the student names.');
      return;
    }

    // Generate unique school prefix code (e.g. "AQUIN" or "STP")
    const schoolCode = schoolName
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'SCH';

    const schoolId = `sch_${Date.now()}`;
    const newSchool = {
      id: schoolId,
      school_code: schoolCode,
      name: schoolName,
      registrant_name: registrantName,
      registrant_contact: registrantContact,
      teacher_incharge_name: teacherInchargeName,
      teacher_incharge_contact: teacherInchargeContact,
      patron_name: teacherInchargeName,
      patron_phone: teacherInchargeContact,
      category: 'Senior High School',
      created_at: new Date().toISOString(),
    };

    // Build student objects with unique badges
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
        emergency_contact: teacherInchargeContact || registrantContact,
        qr_payload: studentId,
        created_at: new Date().toISOString(),
      };
    });

    // Disable button & show spinner
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="ret-spinner"></span>
        <span>Registering & Generating Badges...</span>
      `;
    }

    // Call backend API (with graceful fallback to offline localStorage)
    try {
      await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school: newSchool, students: newStudents }),
      });
    } catch (err) {
      console.warn('API call offline, proceeding with client storage:', err);
    }

    // Persist to localStorage so admin and badges retain this registered school
    this.saveToStorage(newSchool, newStudents);

    this.lastRegisteredSchool = newSchool;
    this.lastRegisteredStudents = newStudents;

    // Transition smoothly to the generated badges showcase
    this.showBadgesShowcase(newSchool, newStudents);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Submit Registration & Generate Badges ✨</span>`;
    }
  }

  saveToStorage(school, students) {
    try {
      let state = { schools: [], students: [], attendance: [], settings: {} };
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = JSON.parse(saved);
      }
      state.schools = state.schools || [];
      state.students = state.students || [];

      // Add school and students
      state.schools.unshift(school);
      state.students.push(...students);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  showBadgesShowcase(school, students) {
    const formSection = document.getElementById('registration-form-section');
    const showcaseSection = document.getElementById('badges-showcase-section');

    if (formSection) formSection.style.display = 'none';
    if (showcaseSection) {
      showcaseSection.style.display = 'block';
      showcaseSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Fill metadata headers
    const titleEl = document.getElementById('showcase-school-name');
    const countEl = document.getElementById('showcase-student-count');
    const teacherEl = document.getElementById('showcase-teacher-info');
    const registrantEl = document.getElementById('showcase-registrant-info');

    if (titleEl) titleEl.textContent = school.name;
    if (countEl) countEl.textContent = `${students.length} Official Student Passes Generated`;
    if (teacherEl) teacherEl.textContent = `${school.teacher_incharge_name} (${school.teacher_incharge_contact})`;
    if (registrantEl) registrantEl.textContent = `${school.registrant_name} (${school.registrant_contact})`;

    // Render all generated student badges
    // CRITICAL USER REQUIREMENT: STUDENT NAME ON TOP OF EACH QR CODE
    renderBadges(students, [school], 'badges-grid-container');

    // Bind Print All Badges
    const printAllBtn = document.getElementById('print-all-badges-btn');
    if (printAllBtn) {
      printAllBtn.onclick = () => {
        window.print();
      };
    }
  }

  resetToRegistrationForm() {
    const formSection = document.getElementById('registration-form-section');
    const showcaseSection = document.getElementById('badges-showcase-section');
    const form = document.getElementById('school-registration-form');

    if (form) form.reset();
    this.clearUploadedRoster();

    if (showcaseSection) showcaseSection.style.display = 'none';
    if (formSection) {
      formSection.style.display = 'block';
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Instantiate and initialize on DOM load
const regController = new RegistrationController();
document.addEventListener('DOMContentLoaded', () => {
  regController.init();
});

window.regController = regController;
