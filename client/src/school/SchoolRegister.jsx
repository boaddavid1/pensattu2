import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import BadgeCard from './BadgeCard';
import './school.css';

const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:3001/api/school'
  : '/api/school';

export default function SchoolRegister() {
  const [formData, setFormData] = useState({
    registrant_name: '',
    registrant_contact: '',
    school_name: '',
    teacher_incharge_name: '',
    teacher_incharge_contact: '',
  });

  const [parsedStudents, setParsedStudents] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── 1. Excel & CSV File Processing with SheetJS ───
  const processFile = (file) => {
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        if (!rows || rows.length === 0) {
          alert('The uploaded spreadsheet appears to be empty.');
          return;
        }

        // Auto-detect header indices
        let headerRowIdx = 0;
        let colMap = { name: 0, gender: 1, level: 2, room: 3, contact: 4 };

        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const rowLower = rows[i].map((c) => String(c).toLowerCase().trim());
          const nameIdx = rowLower.findIndex((c) => c.includes('name') || c.includes('student') || c.includes('delegate'));
          if (nameIdx !== -1) {
            headerRowIdx = i;
            colMap.name = nameIdx;
            const gIdx = rowLower.findIndex((c) => c.includes('gender') || c.includes('sex'));
            if (gIdx !== -1) colMap.gender = gIdx;
            const lIdx = rowLower.findIndex((c) => c.includes('level') || c.includes('class') || c.includes('form') || c.includes('year'));
            if (lIdx !== -1) colMap.level = lIdx;
            const rIdx = rowLower.findIndex((c) => c.includes('room') || c.includes('dorm') || c.includes('house') || c.includes('hostel'));
            if (rIdx !== -1) colMap.room = rIdx;
            const cIdx = rowLower.findIndex((c) => c.includes('contact') || c.includes('phone') || c.includes('emergency'));
            if (cIdx !== -1) colMap.contact = cIdx;
            break;
          }
        }

        const students = [];
        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !Array.isArray(row)) continue;

          let rawName = String(row[colMap.name] || '').trim();
          rawName = rawName.replace(/^(\d+[\.\-\)]\s*)+/, '').trim();
          if (!rawName || rawName.length < 2) continue;

          let gender = 'Male';
          const rawGender = String(row[colMap.gender] || '').trim().toLowerCase();
          if (rawGender.startsWith('f') || rawGender === 'female' || rawGender === 'girl') {
            gender = 'Female';
          } else if (rawGender.startsWith('m') || rawGender === 'male' || rawGender === 'boy') {
            gender = 'Male';
          }

          const level = String(row[colMap.level] || 'Student Delegate').trim() || 'Student Delegate';
          const room = String(row[colMap.room] || '').trim();
          const contact = String(row[colMap.contact] || '').trim();

          students.push({
            full_name: rawName,
            gender,
            level_class: level,
            room_dorm: room,
            emergency_contact: contact,
          });
        }

        if (students.length === 0) {
          alert('Could not find student names in the uploaded sheet. Please check the columns.');
          return;
        }

        setParsedStudents(students);
      } catch (err) {
        console.error('File parsing error:', err);
        alert('Failed to parse file. Please upload a valid .xlsx, .xls, or .csv roster.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handlePasteChange = (text) => {
    setPasteText(text);
    if (!text.trim()) return;

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const students = [];

    for (const line of lines) {
      const parts = line.split(/[,\t]/).map((p) => p.trim());
      let rawName = parts[0] || '';
      rawName = rawName.replace(/^(\d+[\.\-\)]\s*)+/, '').trim();
      if (!rawName || rawName.length < 2) continue;

      let gender = 'Male';
      let level = 'Student Delegate';
      let room = '';

      if (parts[1]) {
        const g = parts[1].toLowerCase();
        if (g.startsWith('f')) gender = 'Female';
        else if (g.startsWith('m')) gender = 'Male';
        else level = parts[1];
      }
      if (parts[2]) {
        const p2 = parts[2].toLowerCase();
        if (p2.includes('hall') || p2.includes('house') || p2.includes('room')) room = parts[2];
        else level = parts[2];
      }
      if (parts[3]) room = parts[3];

      students.push({ full_name: rawName, gender, level_class: level, room_dorm: room });
    }

    if (students.length > 0) {
      setParsedStudents(students);
      setUploadedFileName('Pasted Roster List');
    }
  };

  const clearUploaded = () => {
    setParsedStudents([]);
    setUploadedFileName('');
    setPasteText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── 2. Template Downloaders ───
  const downloadExcelTemplate = (e) => {
    e.preventDefault();
    const headers = ['Full Name', 'Gender', 'Class / Level', 'Hostel / Room', 'Emergency Contact'];
    const sampleRows = [
      ['Kwame Mensah Addo', 'Male', 'Form 3 Science', 'St. Luke Hall', '024 123 4567'],
      ['Akosua Serwaa Boateng', 'Female', 'Form 3 Arts', 'Ruth House', '020 765 4321'],
      ['Emmanuel Kojo Antwi', 'Male', 'Form 2 Business', 'St. Peter Hall', '055 987 6543'],
      ['Priscilla Ewurama Baidoo', 'Female', 'Form 2 Science', 'Esther House', '024 555 6667'],
      ['David Osei Poku', 'Male', 'Form 3 Arts', 'St. Luke Hall', '024 333 4445'],
      ['Blessing Nana Yaa Frimpong', 'Female', 'Form 2 Visual Arts', 'Esther House', '050 111 2233'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delegates');
    XLSX.writeFile(wb, 'retreat_student_roster_template.xlsx');
  };

  const downloadCsvTemplate = (e) => {
    e.preventDefault();
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
    link.href = url;
    link.download = 'retreat_student_roster_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ─── 3. Form Submit & Immediate 1-Page Batch Print ───
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.registrant_name.trim()) {
      alert('Please enter your Full Name.');
      return;
    }
    if (!formData.registrant_contact.trim()) {
      alert('Please enter your Contact Phone / WhatsApp number.');
      return;
    }
    if (!formData.school_name.trim()) {
      alert('Please enter the Name of School.');
      return;
    }
    if (!formData.teacher_incharge_name.trim()) {
      alert('Please enter the Teacher In-Charge of Students Name.');
      return;
    }
    if (!formData.teacher_incharge_contact.trim()) {
      alert('Please enter the Teacher In-Charge Contact Phone / WhatsApp.');
      return;
    }
    if (parsedStudents.length === 0) {
      alert('Please upload an Excel / CSV file containing the student delegates.');
      return;
    }

    setIsSubmitting(true);

    const schoolCode = formData.school_name
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'SCH';

    const formattedStudents = parsedStudents.map((st, idx) => {
      const studentIdx = String(idx + 1).padStart(3, '0');
      const studentId = `RET26-${schoolCode}-${studentIdx}`;
      return {
        id: studentId,
        school_name: formData.school_name.trim(),
        full_name: st.full_name,
        gender: st.gender,
        level_class: st.level_class,
        room_dorm: st.room_dorm,
        emergency_contact: st.emergency_contact || formData.teacher_incharge_contact,
        qr_payload: studentId,
      };
    });

    const payload = {
      school: {
        school_code: schoolCode,
        name: formData.school_name.trim(),
        registrant_name: formData.registrant_name.trim(),
        registrant_contact: formData.registrant_contact.trim(),
        teacher_incharge_name: formData.teacher_incharge_name.trim(),
        teacher_incharge_contact: formData.teacher_incharge_contact.trim(),
      },
      students: formattedStudents,
    };

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data.ok) {
        setSubmittedData({
          school: data.school || payload.school,
          students: data.students || formattedStudents,
        });
      } else {
        // Fallback to local submission
        setSubmittedData({ school: payload.school, students: formattedStudents });
      }
    } catch (err) {
      console.warn('Network submit fallback:', err);
      setSubmittedData({ school: payload.school, students: formattedStudents });
    } finally {
      setIsSubmitting(false);

      // Trigger automatic batch print so all badges are printed at once
      setTimeout(() => {
        window.print();
      }, 600);
    }
  };

  const maleCount = parsedStudents.filter((s) => s.gender === 'Male').length;
  const femaleCount = parsedStudents.filter((s) => s.gender === 'Female').length;

  return (
    <div className="school-module-wrap" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Dedicated Header (No Global Footer) ─── */}
      <header className="ret-header">
        <div className="ret-header-inner">
          <Link to="/school" className="ret-brand">
            <div className="ret-brand-icon">🕊️</div>
            <div className="ret-brand-text">
              <h1>PENSA Schools & Campus Retreat 2026</h1>
              <p>
                <span className="ret-live-pill"><span className="ret-live-dot"></span> REGISTRATION PORTAL</span>
                <span>• Official School & Student Delegate Intake</span>
              </p>
            </div>
          </Link>

          <div className="ret-header-actions no-print">
            <Link to="/school/admin" className="ret-btn ret-btn-outline" style={{ textDecoration: 'none', fontSize: '13px' }}>
              <span>📷 Gate Scanner Terminal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main style={{ flex: 1, padding: '24px 16px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* If Badges Generated -> Show 5-per-row grid and batch print view */}
          {submittedData ? (
            <div className="ret-print-results-view">
              {/* Toolbar (hidden on print) */}
              <div className="ret-badges-toolbar no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    ✅ Badges Generated for {submittedData.school.name}
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                    {submittedData.students.length} Student Gate Passes generated (5 cards per line • 1-page paper batch print).
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="ret-btn ret-btn-gold"
                    style={{ fontSize: '14px', padding: '10px 20px' }}
                  >
                    🖨️ Print All Badges (1-Page)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedData(null);
                      clearUploaded();
                    }}
                    className="ret-btn ret-btn-outline"
                    style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                  >
                    ➕ Register Another School
                  </button>
                </div>
              </div>

              {/* 5-per-row Badges Grid */}
              <div className="ret-badges-grid" id="badges-grid-container">
                {submittedData.students.map((student) => (
                  <BadgeCard
                    key={student.id}
                    student={student}
                    schoolName={submittedData.school.name}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* ─── Registration Form View ─── */
            <div className="ret-card ret-reg-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #061121 0%, #0a1e38 100%)', color: '#ffffff' }}>
                <span className="ret-live-pill" style={{ marginBottom: '10px' }}>OFFICIAL REGISTRATION</span>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '6px 0 4px', color: '#ffffff' }}>
                  School & Student Delegate Roster Intake
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  Fill in your school & teacher details, upload your Excel or CSV student list, and generate ready-to-print official QR gate passes.
                </p>
              </div>

              <div style={{ padding: '28px' }}>
                <form onSubmit={handleSubmit} noValidate>
                  {/* STEP 1: Registrant Information */}
                  <div className="ret-form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '15px', color: '#0f172a', marginBottom: '16px' }}>
                    <span className="ret-step-num" style={{ background: '#2563eb', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>1</span>
                    <span>Registrant Information</span>
                  </div>

                  <div className="ret-form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                    <div className="ret-form-group">
                      <label className="ret-form-label" htmlFor="field-registrant-name">
                        <span>Your Full Name <span className="ret-req">*</span></span>
                      </label>
                      <input
                        type="text"
                        id="field-registrant-name"
                        name="registrant_name"
                        value={formData.registrant_name}
                        onChange={handleInputChange}
                        className="ret-form-input"
                        placeholder="e.g. Deacon Dennis Mensah"
                        required
                      />
                    </div>

                    <div className="ret-form-group">
                      <label className="ret-form-label" htmlFor="field-registrant-contact">
                        <span>Your Contact (Phone / WhatsApp) <span className="ret-req">*</span></span>
                      </label>
                      <input
                        type="tel"
                        id="field-registrant-contact"
                        name="registrant_contact"
                        value={formData.registrant_contact}
                        onChange={handleInputChange}
                        className="ret-form-input"
                        placeholder="e.g. +233 24 123 4567"
                        required
                      />
                    </div>
                  </div>

                  {/* STEP 2: School & Teacher In-Charge Details */}
                  <div className="ret-form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '15px', color: '#0f172a', marginBottom: '16px', marginTop: '28px' }}>
                    <span className="ret-step-num" style={{ background: '#2563eb', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>2</span>
                    <span>School &amp; Teacher In-Charge</span>
                  </div>

                  <div className="ret-form-group" style={{ marginBottom: '18px' }}>
                    <label className="ret-form-label" htmlFor="field-school-name">
                      <span>Name of School <span className="ret-req">*</span></span>
                    </label>
                    <input
                      type="text"
                      id="field-school-name"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleInputChange}
                      className="ret-form-input"
                      placeholder="e.g. St. Thomas Aquinas Senior High School"
                      required
                    />
                  </div>

                  <div className="ret-form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                    <div className="ret-form-group">
                      <label className="ret-form-label" htmlFor="field-teacher-name">
                        <span>Teacher In-Charge of Students Name <span className="ret-req">*</span></span>
                      </label>
                      <input
                        type="text"
                        id="field-teacher-name"
                        name="teacher_incharge_name"
                        value={formData.teacher_incharge_name}
                        onChange={handleInputChange}
                        className="ret-form-input"
                        placeholder="e.g. Elder Emmanuel Osei"
                        required
                      />
                    </div>

                    <div className="ret-form-group">
                      <label className="ret-form-label" htmlFor="field-teacher-contact">
                        <span>Teacher In-Charge Contact <span className="ret-req">*</span></span>
                      </label>
                      <input
                        type="tel"
                        id="field-teacher-contact"
                        name="teacher_incharge_contact"
                        value={formData.teacher_incharge_contact}
                        onChange={handleInputChange}
                        className="ret-form-input"
                        placeholder="e.g. +233 20 987 6543"
                        required
                      />
                    </div>
                  </div>

                  {/* STEP 3: Student Attendees File Upload */}
                  <div className="ret-form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '15px', color: '#0f172a', marginBottom: '16px', marginTop: '28px' }}>
                    <span className="ret-step-num" style={{ background: '#2563eb', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>3</span>
                    <span>Student Attendees File Upload</span>
                  </div>

                  {/* Template download buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Upload your school list (.xlsx, .xls, .csv, .ods):
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={downloadExcelTemplate}
                        style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        📊 Download Excel Template (.xlsx)
                      </button>
                      <button
                        type="button"
                        onClick={downloadCsvTemplate}
                        style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        📄 CSV Template
                      </button>
                    </div>
                  </div>

                  {/* Dropzone */}
                  {parsedStudents.length === 0 ? (
                    <div
                      className={`ret-dropzone ${isDragOver ? 'dragover' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="ret-dropzone-icon">📊</div>
                      <div className="ret-dropzone-title">Click to browse or Drag &amp; Drop Student Roster File</div>
                      <div className="ret-dropzone-subtitle">Supports all Excel files (.xlsx, .xls, .xlsb, .xlsm, .ods) and CSV spreadsheets</div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.xlsb,.xlsm,.ods,.csv"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processFile(file);
                        }}
                      />
                    </div>
                  ) : (
                    /* Uploaded Success Preview */
                    <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
                            {parsedStudents.length} Student Delegates Loaded
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginLeft: '8px' }}>
                              (👨 {maleCount} Male • 👩 {femaleCount} Female)
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                            <strong>File:</strong> {uploadedFileName}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={clearUploaded}
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          ✕ Change / Re-upload File
                        </button>
                      </div>

                      {/* Delegate preview chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {parsedStudents.slice(0, 10).map((st, idx) => (
                          <span
                            key={idx}
                            style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#1e293b' }}
                          >
                            #{idx + 1} <strong>{st.full_name}</strong> {st.gender === 'Female' ? '👩' : '👨'}
                          </span>
                        ))}
                        {parsedStudents.length > 10 && (
                          <span style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '700' }}>
                            + {parsedStudents.length - 10} more delegates
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Direct Paste Fallback Toggle */}
                  <div style={{ marginTop: '12px', marginBottom: '24px' }}>
                    <button
                      type="button"
                      onClick={() => setPasteOpen(!pasteOpen)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: 0 }}
                    >
                      {pasteOpen ? '✕ Hide Paste Box' : '📋 Or paste names from clipboard'}
                    </button>

                    {pasteOpen && (
                      <div style={{ marginTop: '10px' }}>
                        <textarea
                          rows={4}
                          value={pasteText}
                          onChange={(e) => handlePasteChange(e.target.value)}
                          placeholder="Paste student names here, one per line (e.g. Kwame Mensah Addo, Male, Form 3 Science)..."
                          className="ret-form-textarea"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ret-btn ret-btn-gold"
                    style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '800', borderRadius: '12px' }}
                  >
                    {isSubmitting ? '⏳ Processing & Generating Badges...' : '🚀 Submit Registration & Print Badges (1-Page)'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
