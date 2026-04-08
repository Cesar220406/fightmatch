'use client';

import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#f0f0f0',
            border: '1px solid #2a2a2a',
            borderLeft: '3px solid #d4a017',
            borderRadius: '0',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            style: { borderLeftColor: '#10b981' },
            iconTheme: { primary: '#10b981', secondary: '#0a0a0a' },
          },
          error: {
            style: { borderLeftColor: '#c41e1e' },
            iconTheme: { primary: '#c41e1e', secondary: '#0a0a0a' },
          },
        }}
      />
    </>
  );
}
