import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw } from 'lucide-react';

interface QRScannerCameraProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScannerCamera({ onScanSuccess, onClose }: QRScannerCameraProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const elementId = "qr-reader-target";
    const qrCode = new Html5Qrcode(elementId);

    const startScanning = async () => {
      try {
        setErrorMsg(null);
        setIsScanning(true);
        await qrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const min = Math.min(width, height);
              const size = Math.floor(min * 0.7);
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            if (qrCode.isScanning) {
              qrCode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch(err => {
                console.error("Error stopping qrCode on success", err);
                onScanSuccess(decodedText);
              });
            } else {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Ignored verbose debug messages
          }
        );
      } catch (err: any) {
        console.error("Camera scan error:", err);
        setErrorMsg("Không truy cập được camera. Hãy chắc chắn bạn đã cấp quyền và truy cập bằng kết nối an toàn (HTTPS/localhost).");
        setIsScanning(false);
      }
    };

    // Delay slightly to ensure element is completely rendered in DOM
    const timeout = setTimeout(() => {
      startScanning();
    }, 400);

    return () => {
      clearTimeout(timeout);
      if (qrCode && qrCode.isScanning) {
        qrCode.stop().catch(err => console.error("Error stopping qrCode on unmount", err));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="space-y-4">
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center border border-slate-800">
        <div id="qr-reader-target" className="w-full h-full"></div>
        
        {!isScanning && !errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900/90 space-y-3 z-10 p-4">
            <RefreshCw size={32} className="animate-spin text-indigo-500" />
            <p className="text-[11px] font-bold">Đang kết nối camera...</p>
          </div>
        )}

        {errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-300 bg-slate-900/95 space-y-3 z-20 p-6">
            <Camera size={36} className="text-indigo-400" />
            <p className="text-xs font-bold text-slate-200">Không mở được camera</p>
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">{errorMsg}</p>
          </div>
        )}

        {isScanning && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10 z-10">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[9px] text-white font-mono font-bold tracking-wider uppercase">CAMERA ĐANG QUÉT TRỰC TIẾP</span>
          </div>
        )}
      </div>
    </div>
  );
}
