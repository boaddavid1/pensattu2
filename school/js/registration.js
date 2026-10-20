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

  // ─── 2. Process & Parse Uploaded File (All Excel Formats + CSV) ───
  processUploadedFile(file) {
    this.uploadedFileName = file.name;
    const lowerName = file.name.toLowerCase();
    const isExcel =
      /\.(xlsx|xls|xlsb|xlsm|ods)$/i.test(lowerName) ||
      file.type.includes('spreadsheet') ||
      file.type.includes('excel');

    // Use SheetJS ArrayBuffer reader for all Excel files and modern spreadsheets
    if (isExcel || typeof XLSX !== 'undefined') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS library not loaded. Please refresh the page or check your connection.');
          }
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          this.parseWorkbook(workbook, file.name, isExcel);
        } catch (err) {
          console.error('Excel parse error:', err);
          // If SheetJS array read fails on a text file, attempt plain text fallback
          if (!isExcel) {
            const textReader = new FileReader();
            textReader.onload = (te) => this.parseFileContent(te.target.result, file.name);
            textReader.readAsText(file);
          } else {
            alert(`Could not read Excel file "${file.name}":\n${err.message || 'Unknown error'}`);
          }
        }
      };
      reader.onerror = () => {
        alert('Could not read the uploaded file from your device. Please try selecting it again.');
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Fallback for plain text/csv if SheetJS is missing
      const reader = new FileReader();
      reader.onload = (e) => {
        this.parseFileContent(e.target.result, file.name);
      };
      reader.onerror = () => {
        alert('Could not read the uploaded file.');
      };
      reader.readAsText(file);
    }
  }

  // Parse SheetJS Workbook across sheets with intelligent column detection
  parseWorkbook(workbook, fileName = 'uploaded_roster.xlsx', isExcel = true) {
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      alert('The uploaded Excel spreadsheet contains no visible sheets.');
      return;
    }

    const allStudents = [];
    const seenNames = new Set();

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet || !sheet['!ref']) continue;

      const rawRows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
        blankrows: false,
      });

      if (!rawRows || rawRows.length === 0) continue;

      // Detect header row (scan first 15 rows)
      let headerIdx = -1;
      let colName = -1;
      let colFirstName = -1;
      let colLastName = -1;
      let colGender = -1;
      let colClass = -1;
      let colRoom = -1;
      let colContact = -1;

      for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
        const row = rawRows[r];
        if (!Array.isArray(row)) continue;

        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim().toLowerCase();
          if (!val) continue;

          if (
            /^(full\s*name|student\s*name|delegate\s*name|candidate\s*name|attendee\s*name|name\s*of\s*student|pupil|student)$/i.test(val)
          ) {
            colName = c;
            headerIdx = r;
          } else if (/^(first\s*name|other\s*names|given\s*name)$/i.test(val)) {
            colFirstName = c;
            headerIdx = r;
          } else if (/^(last\s*name|surname|family\s*name)$/i.test(val)) {
            colLastName = c;
            headerIdx = r;
          } else if (/^(name|names)$/i.test(val) && colName === -1) {
            colName = c;
            headerIdx = r;
          } else if (/^(gender|sex|m\/f)$/i.test(val)) {
            colGender = c;
            headerIdx = r;
          } else if (/^(class|level|form|grade|programme|program|dept|department)$/i.test(val)) {
            colClass = c;
            headerIdx = r;
          } else if (/^(hostel|room|hall|house|dorm|accommodation)$/i.test(val)) {
            colRoom = c;
            headerIdx = r;
          } else if (/^(phone|contact|tel|mobile|emergency|parent\s*contact|guardian\s*contact)$/i.test(val)) {
            colContact = c;
            headerIdx = r;
          }
        }

        if (colName !== -1 || (colFirstName !== -1 && colLastName !== -1)) {
          break;
        }
      }

      // If no explicit header row, detect name column heuristically
      if (colName === -1 && colFirstName === -1) {
        let bestCol = -1;
        let bestScore = -1;
        const sampleRows = rawRows.slice(0, 20);
        const maxCols = Math.max(...sampleRows.map((r) => (Array.isArray(r) ? r.length : 0)));

        for (let c = 0; c < maxCols; c++) {
          let score = 0;
          for (const row of sampleRows) {
            const cell = String(row[c] || '').trim();
            // Looks like person name (2+ words, alphabetic, not pure number or metadata)
            if (/^[a-zA-Z\s'.\-]{3,45}$/.test(cell) && cell.includes(' ')) {
              score += 2;
            } else if (/^[a-zA-Z]{3,20}$/.test(cell) && !/^(male|female|form|class)$/i.test(cell)) {
              score += 1;
            }
          }
          if (score > bestScore) {
            bestScore = score;
            bestCol = c;
          }
        }
        colName = bestCol !== -1 ? bestCol : 0;
        headerIdx = -1;
      }

      // Extract student rows
      const startRow = headerIdx >= 0 ? headerIdx + 1 : 0;
      for (let r = startRow; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        let rawName = '';
        if (colFirstName !== -1 && colLastName !== -1) {
          const fn = String(row[colFirstName] || '').trim();
          const ln = String(row[colLastName] || '').trim();
          rawName = `${fn} ${ln}`.trim();
        } else if (colName !== -1) {
          rawName = String(row[colName] || '').trim();
        } else {
          rawName = String(row[0] || '').trim();
        }

        // Clean numbering like "1.", "1 -", "01)", "#1", "[1]"
        rawName = rawName.replace(/^(\d+[\.\-\)]\s*)+/, '').replace(/^#\d+\s*/, '').trim();

        // Filter out non-student rows (summaries, headers, blank rows, numbers)
        if (!rawName || rawName.length < 2) continue;
        if (/^(total|grand total|subtotal|summary|delegates|students|pensa|male|female|signature|date|remarks|sn|no\.?)$/i.test(rawName)) continue;
        if (/^\d+$/.test(rawName)) continue;

        // Prevent duplicate names in multi-sheet files
        const nameKey = rawName.toLowerCase();
        if (seenNames.has(nameKey)) continue;
        seenNames.add(nameKey);

        // Detect gender
        let gender = 'Male';
        let rawGender = colGender !== -1 ? String(row[colGender] || '').trim() : '';
        if (!rawGender) {
          for (const cell of row) {
            const cStr = String(cell || '').trim().toLowerCase();
            if (/^(f|female|girl|woman)$/i.test(cStr)) {
              rawGender = 'Female';
              break;
            }
            if (/^(m|male|boy|man)$/i.test(cStr)) {
              rawGender = 'Male';
              break;
            }
          }
        }
        if (rawGender) {
          const g = rawGender.toLowerCase();
          if (g.startsWith('f') || g === 'girl' || g === 'woman') gender = 'Female';
          else if (g.startsWith('m') || g === 'boy' || g === 'man') gender = 'Male';
        }

        // Class / Level
        let level = colClass !== -1 ? String(row[colClass] || '').trim() : '';
        if (!level) level = 'Student Delegate';

        // Room / Dorm
        let room = colRoom !== -1 ? String(row[colRoom] || '').trim() : '';

        // Contact
        let contact = colContact !== -1 ? String(row[colContact] || '').trim() : '';

        allStudents.push({
          full_name: rawName,
          gender,
          level_class: level,
          room_dorm: room,
          emergency_contact: contact,
        });
      }
    }

    if (allStudents.length === 0) {
      alert(`Could not find any student delegate rows in "${fileName}".\nPlease make sure your spreadsheet contains a column with student names.`);
      return;
    }

    this.parsedStudents = allStudents;
    this.renderUploadPreview(fileName, allStudents, isExcel);

    // Sync to paste box as human-readable backup
    const pasteArea = document.getElementById('roster-paste-textarea');
    if (pasteArea) {
      pasteArea.value = allStudents
        .map((st) => `${st.full_name}, ${st.gender}, ${st.level_class}${st.room_dorm ? ', ' + st.room_dorm : ''}`)
        .join('\n');
    }
  }

  // Parse plain text / CSV rows directly (fallback or clipboard paste)
  parseFileContent(rawText, fileName = 'uploaded_file.csv') {
    if (!rawText || !rawText.trim()) {
      alert('The provided file or text is empty.');
      return;
    }

    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      alert('No valid student lines found.');
      return;
    }

    // Check header row
    let startIndex = 0;
    const firstLineLower = lines[0].toLowerCase();
    if (
      firstLineLower.includes('name') ||
      firstLineLower.includes('student') ||
      firstLineLower.includes('fullname') ||
      firstLineLower.includes('gender')
    ) {
      startIndex = 1;
    }

    const students = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const parts = line.split(/[,\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      let rawName = parts[0] || '';

      rawName = rawName.replace(/^(\d+[\.\-\)]\s*)+/, '').trim();
      if (!rawName || rawName.length < 2) continue;

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
      alert('Could not detect student names from text. Please check the formatting.');
      return;
    }

    this.parsedStudents = students;
    this.renderUploadPreview(fileName, students, false);
  }

  renderUploadPreview(fileName, students, isExcel = false) {
    const statusWrap = document.getElementById('upload-status-wrap');
    const dropzone = document.getElementById('roster-dropzone');
    const countBadge = document.getElementById('upload-count-badge');
    const fileNameEl = document.getElementById('upload-filename-text');
    const previewList = document.getElementById('upload-names-preview');

    if (dropzone) dropzone.style.display = 'none';
    if (statusWrap) statusWrap.style.display = 'block';

    const maleCount = students.filter((s) => s.gender === 'Male').length;
    const femaleCount = students.filter((s) => s.gender === 'Female').length;

    if (countBadge) {
      countBadge.innerHTML = `
        ${students.length} Student Delegates Loaded
        <span style="font-size: 12px; font-weight: 500; color: #475569; margin-left: 6px;">
          (👨 ${maleCount} Male • 👩 ${femaleCount} Female)
        </span>
      `;
    }

    if (fileNameEl) {
      const icon = isExcel || fileName.match(/\.(xlsx|xls|xlsm|xlsb)$/i) ? '📊 Excel' : '📄 File';
      fileNameEl.innerHTML = `<strong>${icon}:</strong> ${this.escapeHtml(fileName)}`;
    }

    if (previewList) {
      const previewItems = students.slice(0, 12);
      const remaining = students.length - previewItems.length;

      previewList.innerHTML = previewItems
        .map(
          (st, idx) => `
        <span class="ret-preview-name-chip" title="${this.escapeHtml(st.level_class || '')} ${st.room_dorm ? '• ' + this.escapeHtml(st.room_dorm) : ''}">
          <span class="ret-preview-num">#${idx + 1}</span>
          <strong>${this.escapeHtml(st.full_name)}</strong>
          <span class="ret-preview-gender">${st.gender === 'Female' ? '👩' : '👨'}</span>
          ${st.level_class && st.level_class !== 'Student Delegate' ? `<span style="font-size: 11px; opacity: 0.8; margin-left: 4px;">(${this.escapeHtml(st.level_class)})</span>` : ''}
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

  // ─── 4. Sample Excel & CSV Template Downloaders ───
  bindTemplateDownload() {
    // 4A. Modern Excel (.xlsx) Template Download
    const excelBtn = document.getElementById('download-excel-template-btn');
    if (excelBtn) {
      excelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS not ready');
          }
          const headers = ['Full Name', 'Gender', 'Class / Level', 'Hostel / Room', 'Emergency Contact'];
          const sampleData = [
            ['Kwame Mensah Addo', 'Male', 'Form 3 Science', 'St. Luke Hall', '024 123 4567'],
            ['Akosua Serwaa Boateng', 'Female', 'Form 3 Arts', 'Ruth House', '020 765 4321'],
            ['Emmanuel Kojo Antwi', 'Male', 'Form 2 Business', 'St. Peter Hall', '055 987 6543'],
            ['Priscilla Ewurama Baidoo', 'Female', 'Form 2 Science', 'Esther House', '024 555 6667'],
            ['David Osei Poku', 'Male', 'Form 3 Arts', 'St. Luke Hall', '024 333 4445'],
            ['Blessing Nana Yaa Frimpong', 'Female', 'Form 2 Visual Arts', 'Esther House', '050 111 2233'],
          ];

          const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

          // Set column widths
          worksheet['!cols'] = [
            { wch: 28 }, // Full Name
            { wch: 12 }, // Gender
            { wch: 20 }, // Class / Level
            { wch: 18 }, // Room
            { wch: 18 }, // Contact
          ];

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Delegates');
          XLSX.writeFile(workbook, 'retreat_student_roster_template.xlsx');
        } catch (err) {
          console.warn('Excel export error, falling back to CSV:', err);
          this.downloadCsvFallback();
        }
      });
    }

    // 4B. CSV Template Download
    const csvBtn = document.getElementById('download-template-btn');
    if (csvBtn) {
      csvBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.downloadCsvFallback();
      });
    }
  }

  downloadCsvFallback() {
    const csvContent =
      'Full Name,Gender,Class / Level,Hostel / Room,Emergency Contact\n' +
      'Kwame Mensah Addo,Male,Form 3 Science,St. Luke Hall,0241234567\n' +
      'Akosua Serwaa Boateng,Female,Form 3 Arts,Ruth House,0207654321\n' +
      'Emmanuel Kojo Antwi,Male,Form 2 Business,St. Peter Hall,0559876543\n' +
      'Priscilla Ewurama Baidoo,Female,Form 2 Science,Esther House,0245556667\n' +
      'David Osei Poku,Male,Form 3 Arts,St. Luke Hall,0243334445\n' +
      'Blessing Nana Yaa Frimpong,Female,Form 2 Visual Arts,Esther House,0501112233\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'retreat_student_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    // 1. Read required fields specified by user (uses registrant_name to avoid conflict with form.name)
    const registrantNameInput = form['registrant_name'] || form['name'];
    const registrantContactInput = form['registrant_contact'] || form['contact'];
    const registrantName = (registrantNameInput ? registrantNameInput.value : '').trim();
    const registrantContact = (registrantContactInput ? registrantContactInput.value : '').trim();
    const schoolName = (form['school_name'] ? form['school_name'].value : '').trim();
    const teacherInchargeName = (form['teacher_incharge_name'] ? form['teacher_incharge_name'].value : '').trim();
    const teacherInchargeContact = (form['teacher_incharge_contact'] ? form['teacher_incharge_contact'].value : '').trim();

    // Validation
    if (!registrantName) {
      alert('Please enter the Registrant Full Name.');
      registrantNameInput?.focus();
      return;
    }
    if (!registrantContact) {
      alert('Please enter your Contact Phone / WhatsApp number.');
      registrantContactInput?.focus();
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

    // Fill screen metadata headers
    const titleEl = document.getElementById('showcase-school-name');
    const countEl = document.getElementById('showcase-student-count');
    const teacherEl = document.getElementById('showcase-teacher-info');
    const registrantEl = document.getElementById('showcase-registrant-info');

    if (titleEl) titleEl.textContent = school.name;
    if (countEl) countEl.textContent = `${students.length} Official Student Passes Generated`;
    if (teacherEl) teacherEl.textContent = `${school.teacher_incharge_name || ''} (${school.teacher_incharge_contact || ''})`;
    if (registrantEl) registrantEl.textContent = `${school.registrant_name || ''} (${school.registrant_contact || ''})`;

    // Fill print-only sheet header for 1-page paper
    const pSchool = document.getElementById('print-school-name');
    const pTeacher = document.getElementById('print-teacher-name');
    const pCount = document.getElementById('print-delegates-count');
    if (pSchool) pSchool.textContent = school.name;
    if (pTeacher) pTeacher.textContent = `${school.teacher_incharge_name || ''} (${school.teacher_incharge_contact || ''})`;
    if (pCount) pCount.textContent = `${students.length} Student Delegates`;

    // Render all generated student badges
    // CRITICAL USER REQUIREMENT: STUDENT NAME PROMINENTLY ON TOP OF EACH QR CODE
    renderBadges(students, [school], 'badges-grid-container');

    // USER REQUIREMENT: 5 cards on horizontal line
    const container = document.getElementById('badges-grid-container');
    if (container) {
      container.setAttribute('data-print-cols', '5');
    }

    // Bind manual Print button for re-printing
    const printAllBtn = document.getElementById('print-all-badges-btn');
    if (printAllBtn) {
      printAllBtn.onclick = () => {
        window.print();
      };
    }

    // USER REQUIREMENT: "after the submission qrcode should all be one page paper and be printer at once"
    // Auto-trigger window.print() after QR canvases finish rendering (450ms)
    setTimeout(() => {
      window.print();
    }, 450);
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
