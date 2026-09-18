'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Check, ArrowLeft } from 'lucide-react';

interface QRScannerProps {
  onVerified: () => void;
  onBack: () => void;
  venueName?: string;
}

export function QRScanner({ onVerified, onBack, venueName }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setVerified(true);
      setTimeout(() => {
        onVerified();
      }, 800);
    }, 2000);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6">
      <button
        onClick={onBack}
        className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-border transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-gradient glow-primary">
          <QrCode className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Escanea el QR del venue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {venueName ? `Accede al lounge de ${venueName}` : 'Escanea el código QR de la discoteca'}
        </p>
      </motion.div>

      <div className="relative h-64 w-64 overflow-hidden rounded-3xl border-2 border-border bg-card">
        {!scanning && !verified && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <QrCode className="h-16 w-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Coloca el QR aquí</p>
          </div>
        )}

        {scanning && (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-48 w-48 rounded-2xl border-2 border-primary" />
            </div>
            <motion.div
              initial={{ top: '10%' }}
              animate={{ top: '90%' }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              className="absolute left-4 right-4 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(280 100% 65%), transparent)',
                boxShadow: '0 0 10px hsl(280 100% 65%)',
              }}
            />
            <div className="absolute left-6 top-6 h-8 w-8 border-l-4 border-t-4 rounded-tl-lg" style={{ borderColor: 'hsl(280 100% 65%)' }} />
            <div className="absolute right-6 top-6 h-8 w-8 border-r-4 border-t-4 rounded-tr-lg" style={{ borderColor: 'hsl(280 100% 65%)' }} />
            <div className="absolute bottom-6 left-6 h-8 w-8 border-b-4 border-l-4 rounded-bl-lg" style={{ borderColor: 'hsl(280 100% 65%)' }} />
            <div className="absolute bottom-6 right-6 h-8 w-8 border-b-4 border-r-4 rounded-br-lg" style={{ borderColor: 'hsl(280 100% 65%)' }} />
          </>
        )}

        {verified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="flex h-full w-full flex-col items-center justify-center gap-3"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-green-500">Acceso verificado</p>
          </motion.div>
        )}
      </div>

      <button
        onClick={handleScan}
        disabled={scanning || verified}
        className="mt-8 w-full max-w-xs rounded-2xl bg-neon-gradient py-4 font-bold text-white transition-all active:scale-[0.97] glow-primary disabled:opacity-50"
      >
        {scanning ? 'Escaneando...' : verified ? 'Acceso concedido' : 'Simular escaneo QR'}
      </button>
    </div>
  );
}
