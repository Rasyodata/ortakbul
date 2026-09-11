'use client';
import React from 'react';

type Kind = 'error' | 'success' | 'warn' | 'info';
const ICON: Record<Kind, string> = { error: '⛔', success: '✅', warn: '⚠️', info: 'ℹ️' };

// Profesyonel, dil-bağımsız uyarı kutusu. children çeviriyle gelir.
export default function Alert({ kind = 'info', children, style }: { kind?: Kind; children: React.ReactNode; style?: React.CSSProperties }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${kind}`} style={style} role={kind === 'error' ? 'alert' : 'status'}>
      <span className="alert-ico" aria-hidden>{ICON[kind]}</span>
      <div>{children}</div>
    </div>
  );
}
