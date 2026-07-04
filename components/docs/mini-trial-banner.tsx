'use client';

import { useState } from 'react';

export default function MiniTrialBanner() {
  const [daysLeft, setDaysLeft] = useState(5);
  const totalDays = 7;
  const progress = ((totalDays - daysLeft) / totalDays) * 100;
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 2 && daysLeft > 0;

  const bannerColor = isExpired ? '#ef4444' : isUrgent ? '#f97316' : '#3b82f6';
  const bannerBg = isExpired
    ? 'rgba(239,68,68,0.08)'
    : isUrgent
      ? 'rgba(249,115,22,0.08)'
      : 'rgba(59,130,246,0.06)';

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1rem',
        margin: '1.5rem 0',
      }}
    >
      {/* Trial banner mock */}
      <div
        style={{
          background: bannerBg,
          border: `1px solid ${bannerColor}30`,
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
        >
          <span style={{ fontSize: '14px' }}>{isExpired ? '⚠' : '🎉'}</span>
          <span style={{ fontSize: '13px', color: bannerColor, fontWeight: 600 }}>
            {isExpired
              ? 'Trial expired'
              : daysLeft === 1
                ? 'Trial ends today'
                : `${daysLeft} days left`}
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
            7-day free trial
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: '4px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: bannerColor,
              borderRadius: '2px',
              transition: 'width 0.3s',
            }}
          />
        </div>

        {/* Days remaining dots */}
        <div style={{ display: 'flex', gap: '3px', marginTop: '0.5rem' }}>
          {Array.from({ length: totalDays }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '2px',
                background: i < totalDays - daysLeft ? bannerColor : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {isExpired && (
          <p style={{ fontSize: '11px', color: 'rgba(239,68,68,0.7)', margin: '0.5rem 0 0' }}>
            Features are paused. Subscribe to continue using Syntheon Hub.
          </p>
        )}
        {!isExpired && (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0.5rem 0 0' }}>
            {totalDays - daysLeft} of {totalDays} days used · {daysLeft} remaining
          </p>
        )}
      </div>

      {/* Day slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Day 7</span>
        <input
          type="range"
          min="0"
          max={totalDays}
          value={totalDays - daysLeft}
          onChange={(e) => setDaysLeft(totalDays - Number(e.target.value))}
          style={{ flex: 1, accentColor: bannerColor }}
        />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Day 0</span>
      </div>

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.5rem',
          textAlign: 'center',
        }}
      >
        Drag to simulate trial progression — banner turns orange at 2 days, red when expired
      </p>
    </div>
  );
}
