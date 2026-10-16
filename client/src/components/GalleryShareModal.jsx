import { useState, useEffect } from 'react';
import { copyToClipboard, getSocialShareUrls } from '../utils/galleryHelpers';
import { getImageUrl } from '../api';

export default function GalleryShareModal({
  isOpen,
  onClose,
  title = 'PENSA TTU Gallery',
  subtitle = '',
  url = '',
  imageUrl = '',
  type = 'album', // 'album' | 'photo'
  onShowToast,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [isOpen, url]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const shareTitle = subtitle ? `${title} — ${subtitle}` : title;
  const socialLinks = getSocialShareUrls({ title: shareTitle, url: shareUrl });

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      if (onShowToast) onShowToast(type === 'photo' ? 'Photo link copied to clipboard!' : 'Album link copied to clipboard!');
      setTimeout(() => setCopied(false), 2600);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Check out this ${type} from PENSA TTU!`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    }
  };

  return (
    <div
      className="ag-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 18, 38, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 460,
          boxShadow: '0 24px 60px rgba(10, 46, 92, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2ecf7',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0E4C92 0%, #1a66bc 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0A2E5C' }}>
                Share {type === 'photo' ? 'Photo' : 'Album'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Share this PENSA TTU moment with friends & community
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: 16,
              transition: 'all 0.2s',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Preview Card */}
          {(imageUrl || subtitle) && (
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                background: '#f8fafc',
                borderRadius: 14,
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
              }}
            >
              {imageUrl && (
                <img
                  src={getImageUrl(imageUrl, { width: 140, quality: 'auto' })}
                  alt="Preview"
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 10,
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#0E4C92',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {type === 'photo' ? 'Photo' : 'Album Collection'}
                </span>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {subtitle || title}
                </div>
                {subtitle && title && (
                  <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {title}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Direct Link Input with Copy Button */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              Direct Link
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '4px 6px 4px 12px',
              }}
            >
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 13,
                  color: '#334155',
                  outline: 'none',
                  textOverflow: 'ellipsis',
                }}
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: copied ? '#16a34a' : 'linear-gradient(135deg, #0E4C92, #1a66bc)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background 0.2s ease, transform 0.1s ease',
                  flexShrink: 0,
                }}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
              Share via Social Media
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {/* WhatsApp */}
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on WhatsApp"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 4px',
                  borderRadius: 12,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: 20 }}>💬</span>
                <span>WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on X (Twitter)"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 4px',
                  borderRadius: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 900 }}>𝕏</span>
                <span>X / Twitter</span>
              </a>

              {/* Facebook */}
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Facebook"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 4px',
                  borderRadius: 12,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: 20 }}>📘</span>
                <span>Facebook</span>
              </a>

              {/* Telegram */}
              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on Telegram"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 4px',
                  borderRadius: 12,
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: '#0284c7',
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: 20 }}>✈️</span>
                <span>Telegram</span>
              </a>

              {/* Email */}
              <a
                href={socialLinks.email}
                title="Share via Email"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 4px',
                  borderRadius: 12,
                  background: '#fdf4ff',
                  border: '1px solid #f5d0fe',
                  color: '#a21caf',
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'transform 0.15s ease',
                }}
              >
                <span style={{ fontSize: 20 }}>✉️</span>
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Native Mobile Share if available */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              type="button"
              onClick={handleNativeShare}
              style={{
                width: '100%',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              More sharing options...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
