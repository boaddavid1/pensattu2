import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function BadgeCard({ student, schoolName, retreatTitle, retreatTheme }) {
  const [qrUrl, setQrUrl] = useState('');

  const studentName = student.full_name || student.name || 'Student Delegate';
  const displaySchool = schoolName || student.school_name || 'PENSA Retreat Delegation';
  const studentId = student.id || student.qr_payload || 'RET26-STUDENT';
  const studentLevel = student.level_class || student.class || 'Student Delegate';
  const studentRoom = student.room_dorm || student.room || '';
  const qrPayload = student.qr_payload || student.id || studentName;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrPayload]);

  const handlePrint = (e) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gate Pass — ${studentName}</title>
        <style>
          @page { size: auto; margin: 8mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .badge {
            width: 280px;
            border: 2px dashed #0f172a;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            background: #fff;
          }
          .badge-head {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #0f172a;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 6px;
            margin-bottom: 12px;
          }
          .student-name {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            margin: 6px 0 4px;
            text-transform: uppercase;
          }
          .school-tag {
            display: inline-block;
            background: #f1f5f9;
            color: #334155;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .qr-img {
            width: 150px;
            height: 150px;
            margin: 0 auto 10px;
            display: block;
          }
          .id-pill {
            font-family: monospace;
            font-weight: bold;
            font-size: 12px;
            letter-spacing: 0.08em;
            background: #e2e8f0;
            padding: 3px 10px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 8px;
          }
          .meta {
            font-size: 11px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="badge">
          <div class="badge-head">PENSA RETREAT 2026 • OFFICIAL PASS</div>
          <div class="student-name">${studentName}</div>
          <div class="school-tag">${displaySchool}</div>
          <img class="qr-img" src="${qrUrl}" alt="QR Code" />
          <div class="id-pill">${studentId}</div>
          <div class="meta">${studentLevel} ${studentRoom ? '• ' + studentRoom : ''}</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.download = `Badge_${studentId}_${studentName.replace(/\s+/g, '_')}.png`;
    link.href = qrUrl;
    link.click();
  };

  return (
    <div className="ret-badge-pass" id={`badge-${studentId}`}>
      {/* Badge Header Strip */}
      <div className="ret-badge-header">
        <div className="ret-badge-event-tag">PENSA RETREAT 2026</div>
        <div className="ret-badge-event-title">OFFICIAL PASS</div>
      </div>

      {/* Badge Body */}
      <div className="ret-badge-body">
        {/* Student Name */}
        <div className="ret-badge-student-name" title={studentName}>
          {studentName}
        </div>

        {/* School Name Tag */}
        <div className="ret-badge-school-tag" title={displaySchool}>
          {displaySchool}
        </div>

        {/* QR Code Container */}
        <div className="ret-badge-qr-wrap">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR Code for ${studentName}`} />
          ) : (
            <div style={{ width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>
              Generating...
            </div>
          )}
        </div>

        {/* Badge ID Pill */}
        <div className="ret-badge-id-pill">{studentId}</div>

        {/* Metadata: Class / Dorm */}
        <div className="ret-badge-meta-row">
          <span>{studentLevel}</span>
          {studentRoom && <span>• {studentRoom}</span>}
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="ret-badge-actions no-print">
          <button
            type="button"
            className="ret-badge-btn"
            title="Print Single Badge"
            onClick={handlePrint}
          >
            🖨️ Print
          </button>
          <button
            type="button"
            className="ret-badge-btn"
            title="Download QR"
            onClick={handleDownload}
          >
            ⬇️ Save
          </button>
        </div>
      </div>
    </div>
  );
}
