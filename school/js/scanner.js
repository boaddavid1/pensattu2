// school/js/scanner.js — Live QR Code Camera Scanner & Clock-In/Clock-Out Logic

let html5QrCode = null;
let isScannerRunning = false;
let currentCameraMode = 'environment'; // Back camera by default on phones
let currentScannerMode = 'auto'; // 'clock_in', 'clock_out', 'auto'
let lastScannedCode = '';
let lastScannedTime = 0;

// Web Audio synthesizer for instant audible feedback (no external mp3 needed)
class SoundFx {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playClockIn() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6
      osc2.frequency.setValueAtTime(1174.66, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.12);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }

  playClockOut() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25); // E5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playWarning() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(370, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playError() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(196, now + 0.15);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }
}

export const sound = new SoundFx();

/**
 * Initializes and starts the camera QR scanner
 */
export async function startScanner(onScanSuccess) {
  if (isScannerRunning) return;

  const readerElement = document.getElementById('reader');
  if (!readerElement || !window.Html5Qrcode) return;

  try {
    if (!html5QrCode) {
      html5QrCode = new window.Html5Qrcode('reader');
    }

    const config = {
      fps: 15,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
    };

    await html5QrCode.start(
      { facingMode: currentCameraMode },
      config,
      (decodedText) => {
        handleQrDetected(decodedText, onScanSuccess);
      },
      (errorMessage) => {
        // Continuous scan frame error, safely ignore
      }
    );

    isScannerRunning = true;
    updateScannerControls();
  } catch (err) {
    console.error('Camera start error:', err);
    updateScannerControls(err.message || 'Camera permission denied or camera not found');
  }
}

/**
 * Stops the camera stream
 */
export async function stopScanner() {
  if (html5QrCode && isScannerRunning) {
    try {
      await html5QrCode.stop();
    } catch (e) {}
    isScannerRunning = false;
    updateScannerControls();
  }
}

/**
 * Switches between front and back camera
 */
export async function toggleCamera(onScanSuccess) {
  currentCameraMode = currentCameraMode === 'environment' ? 'user' : 'environment';
  if (isScannerRunning) {
    await stopScanner();
    await startScanner(onScanSuccess);
  }
}

/**
 * Handles decoded QR text from camera or manual entry
 */
function handleQrDetected(text, callback) {
  if (!text) return;
  const clean = text.trim();

  // Debounce duplicate scans within 2.5 seconds
  const now = Date.now();
  if (clean === lastScannedCode && now - lastScannedTime < 2500) {
    return;
  }

  lastScannedCode = clean;
  lastScannedTime = now;

  if (typeof callback === 'function') {
    callback(clean, currentScannerMode);
  }
}

/**
 * Set Clock-In vs Clock-Out Mode
 */
export function setScannerMode(mode) {
  currentScannerMode = mode; // 'clock_in', 'clock_out', 'auto'
  document.querySelectorAll('.ret-mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

export function getScannerMode() {
  return currentScannerMode;
}

function updateScannerControls(errorMsg = '') {
  const statusEl = document.getElementById('camera-status-text');
  const toggleBtn = document.getElementById('toggle-camera-btn');
  const overlay = document.querySelector('.ret-scan-overlay');

  if (statusEl) {
    if (errorMsg) {
      statusEl.innerHTML = `<span style="color: #f87171;">⚠️ Camera error: ${errorMsg}</span>`;
    } else if (isScannerRunning) {
      statusEl.innerHTML = `<span style="color: #34d399;">● Camera Active (${currentCameraMode === 'environment' ? 'Rear' : 'Front'})</span>`;
    } else {
      statusEl.innerHTML = `<span style="color: #94a3b8;">○ Camera Paused</span>`;
    }
  }

  if (toggleBtn) {
    toggleBtn.textContent = isScannerRunning ? '⏸️ Pause Camera' : '▶️ Start Camera';
  }

  if (overlay) {
    overlay.style.display = isScannerRunning ? 'block' : 'none';
  }
}
