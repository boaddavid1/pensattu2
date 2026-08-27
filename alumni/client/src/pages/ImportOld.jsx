// ImportOld.jsx — Import old alumni list (4-column CSV: name, contact, program, year)
import { useState, useRef } from 'react';
import { alumniApi } from '../api/alumniApi.js';

export default function ImportOld() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [yearOverride, setYearOverride] = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setSuccess('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length === 0) { setError('File is empty'); return; }

      // Parse CSV — try to detect header
      const firstLine = lines[0].toLowerCase();
      const hasHeader = firstLine.includes('name') || firstLine.includes('contact') || firstLine.includes('program');
      const dataLines = hasHeader ? lines.slice(1) : lines;

      const parsed = dataLines.map((line, i) => {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        return {
          surname: cols[0] || '',
          contact: cols[1] || '',
          program: cols[2] || '',
          graduation_year: cols[3] || yearOverride || '',
        };
      });

      setParsedData(parsed);
      setPreview(parsed.slice(0, 10));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');
    setSuccess('');
    try {
      const data = await alumniApi.importOldList({ members: parsedData, year: yearOverride });
      setSuccess(`Imported ${data.imported} alumni successfully`);
      setParsedData([]);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) { setError(err.message); }
    finally { setImporting(false); }
  };

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Import Old List</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Import Old</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="card">
        <h3>Import Old Alumni List</h3>
        <p style={{ color: 'var(--dark-grey)', marginBottom: 16 }}>
          Upload a CSV file with 4 columns: <strong>Name, Contact, Program, Graduation Year</strong>.
          The first row should be a header (will be skipped).
        </p>

        <div className="form-group">
          <label>Override Graduation Year (optional — applies to all rows if column 4 is empty)</label>
          <input type="number" value={yearOverride} onChange={e => setYearOverride(e.target.value)}
            placeholder="e.g. 2020" style={{ maxWidth: 200 }} />
        </div>

        <div className="form-group">
          <label>CSV File</label>
          <input type="file" accept=".csv" ref={fileRef} onChange={handleFile} />
        </div>

        {preview && (
          <>
            <p style={{ marginTop: 16 }}>
              <strong>{parsedData.length}</strong> records ready to import. Preview (first 10):
            </p>
            <table style={{ marginTop: 12 }}>
              <thead><tr><th>Name</th><th>Contact</th><th>Program</th><th>Year</th></tr></thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i}>
                    <td>{r.surname}</td>
                    <td>{r.contact}</td>
                    <td>{r.program}</td>
                    <td>{r.graduation_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleImport} className="btn btn-primary" style={{ marginTop: 16 }}
              disabled={importing || parsedData.length === 0}>
              {importing ? 'Importing...' : <><i className='bx bx-import'></i> Import {parsedData.length} Alumni</>}
            </button>
          </>
        )}
      </div>
    </>
  );
}
