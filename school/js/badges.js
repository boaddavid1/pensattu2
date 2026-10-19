// school/js/badges.js — Student QR Badges Studio & Printing

/**
 * Renders all student badges into the target grid container.
 * Every badge prominently features the Student's Unique Full Name ON TOP of the QR code.
 */
export function renderBadges(students, schools, containerId = 'badges-grid', filterSchool = '', searchQuery = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  let filtered = students || [];

  if (filterSchool) {
    filtered = filtered.filter((s) => s.school_id === filterSchool || s.school_name === filterSchool);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.school_name.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; color: var(--text-muted); background: #ffffff; border-radius: 16px; border: 1px dashed var(--border-subtle);">
        <div style="font-size: 40px; margin-bottom: 12px;">📇</div>
        <h3 style="font-size: 18px; color: var(--primary-900); margin-bottom: 6px;">No Badges Found</h3>
        <p style="font-size: 13.5px; margin: 0;">Try adjusting your school filter or search query, or register a new school.</p>
      </div>
    `;
    return;
  }

  // Create badge cards
  filtered.forEach((student) => {
    const card = document.createElement('div');
    card.className = 'ret-badge-pass';
    card.id = `badge-${student.id}`;

    // Unique QR Code payload
    const qrPayload = student.qr_payload || student.id;

    card.innerHTML = `
      <!-- Lanyard Punch Guide Hole -->
      <div class="ret-badge-top-lanyard">
        <div class="ret-badge-lanyard-hole"></div>
      </div>

      <!-- Badge Header Foil Banner -->
      <div class="ret-badge-header">
        <div class="ret-badge-event-tag">OFFICIAL DELEGATE PASS</div>
        <div class="ret-badge-event-title">PENSA RETREAT 2026</div>
      </div>

      <!-- Badge Main Body -->
      <div class="ret-badge-body">
        <!-- CRUCIAL REQUIREMENT: STUDENT'S UNIQUE FULL NAME ON TOP OF QR CODE -->
        <div class="ret-badge-student-name" title="${escapeHtml(student.full_name)}">
          ${escapeHtml(student.full_name)}
        </div>
        
        <div class="ret-badge-school-tag">
          🏫 ${escapeHtml(student.school_name)}
        </div>

        <!-- High-Contrast QR Code Box -->
        <div class="ret-badge-qr-wrap" id="qr-box-${escapeId(student.id)}"></div>

        <!-- Student ID & Category Tag -->
        <div class="ret-badge-id-pill">
          ${escapeHtml(student.id)}
        </div>

        <div class="ret-badge-meta-row">
          <span>📚 ${escapeHtml(student.level_class || 'Delegate')}</span>
          <span>•</span>
          <span>${student.gender === 'Female' ? '👩 Female' : '👨 Male'}</span>
          ${student.room_dorm ? `<span>• 🛏️ ${escapeHtml(student.room_dorm)}</span>` : ''}
        </div>
      </div>

      <!-- Badge Actions Footer -->
      <div class="ret-badge-footer no-print">
        <span style="font-size: 11px; font-weight: 600; color: #64748b;">Scan to Clock-In</span>
        <div class="ret-badge-actions">
          <button type="button" class="ret-badge-btn-mini" onclick="window.printSingleBadge('${escapeId(student.id)}')">
            🖨️ Print
          </button>
          <button type="button" class="ret-badge-btn-mini" onclick="window.downloadBadgeImage('${escapeId(student.id)}')">
            💾 Save
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);

    // Generate crisp QR code canvas inside this card
    setTimeout(() => {
      const qrTarget = document.getElementById(`qr-box-${escapeId(student.id)}`);
      if (qrTarget && window.QRCode) {
        qrTarget.innerHTML = '';
        new window.QRCode(qrTarget, {
          text: qrPayload,
          width: 140,
          height: 140,
          colorDark: '#061121',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H,
        });
      }
    }, 10);
  });
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

/**
 * Print a single student badge pass
 */
export function printSingleBadge(studentId) {
  const card = document.getElementById(`badge-${studentId}`);
  if (!card) return;

  const printWindow = window.open('', '_blank', 'width=450,height=600');
  if (!printWindow) {
    alert('Please allow popups to print individual badge passes.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Badge - ${studentId}</title>
      <link rel="stylesheet" href="css/styles.css">
      <style>
        body { background: #fff; padding: 20px; display: flex; justify-content: center; }
        .ret-badge-pass { width: 320px; box-shadow: none; border: 2px dashed #000; }
        .ret-badge-footer { display: none !important; }
      </style>
    </head>
    <body>
      ${card.outerHTML}
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Downloads a single badge as a PNG image
 */
export function downloadBadgeImage(studentId) {
  const qrTarget = document.querySelector(`#badge-${studentId} .ret-badge-qr-wrap canvas, #badge-${studentId} .ret-badge-qr-wrap img`);
  if (!qrTarget) {
    window.printSingleBadge(studentId);
    return;
  }

  // If canvas exists, trigger download
  if (qrTarget.tagName.toLowerCase() === 'canvas') {
    const link = document.createElement('a');
    link.download = `BADGE-${studentId}.png`;
    link.href = qrTarget.toDataURL('image/png');
    link.click();
  } else if (qrTarget.src) {
    const link = document.createElement('a');
    link.download = `BADGE-${studentId}.png`;
    link.href = qrTarget.src;
    link.click();
  }
}
