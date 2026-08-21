import { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Copy, Check, Download, Printer, ExternalLink, Sparkles } from 'lucide-react';

interface QRCodeSectionProps {
  orgId: number;
  orgName: string;
  orgCode?: string;
  logoUrl?: string;
}

export default function QRCodeSection({ orgId, orgName, orgCode, logoUrl }: QRCodeSectionProps) {
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // Compute Visitor Registration Form Link
  const visitorHost = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5174` : 'http://localhost:5174';
  const registrationUrl = `${visitorHost}/visitor/form/${orgId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Create a higher resolution canvas for downloading
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const qrSize = 300;
    const headerHeight = 90;
    const footerHeight = 60;
    
    exportCanvas.width = qrSize + (padding * 2);
    exportCanvas.height = qrSize + padding * 2 + headerHeight + footerHeight;

    // Background fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Border line
    ctx.strokeStyle = '#035352';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, exportCanvas.width - 20, exportCanvas.height - 20);

    // Header - Org Name
    ctx.fillStyle = '#035352';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(orgName || 'Organisation Check-In', exportCanvas.width / 2, padding + 30);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.fillText('Scan QR Code to Check In', exportCanvas.width / 2, padding + 55);

    // Draw QR Code
    ctx.drawImage(canvas, padding, padding + headerHeight, qrSize, qrSize);

    // Footer - Branding
    ctx.fillStyle = '#035352';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Powered by DIGI-GATE', exportCanvas.width / 2, exportCanvas.height - padding);

    // Download trigger
    const link = document.createElement('a');
    link.download = `${(orgName || 'Org').replace(/\s+/g, '_')}_DigiGate_QR.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#035352]/10 border border-[#035352]/20 flex items-center justify-center text-[#035352]">
            <QrCode className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#172525]">Visitor Gate Pass QR Code</h3>
            <p className="text-xs text-slate-500 font-medium">Display or print this QR code at your reception desk for instant visitor check-in</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Active Scanner Ready
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* QR Code Visual Box */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80 relative group">
          <div ref={qrCanvasRef} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/60">
            <QRCodeCanvas
              value={registrationUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>
          {/* Hidden SVG version for vector display if needed */}
          <div className="hidden">
            <QRCodeSVG value={registrationUrl} size={180} level="H" />
          </div>

          <p className="text-xs font-extrabold text-[#035352] mt-3 tracking-wide uppercase">
            {orgName} {orgCode ? `(${orgCode})` : ''}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Scan with smartphone camera
          </p>
        </div>

        {/* Action Controls */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Direct Visitor Check-In URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={registrationUrl}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 outline-none focus:border-[#035352]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#035352] text-white hover:bg-[#023e3d] shadow-md shadow-[#035352]/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-[#172525] border border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-[#035352]" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs bg-[#F3E8BC] text-[#172525] hover:bg-[#e8da9d] border border-[#e5d59e] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#035352]" />
              <span>Print Gate Poster</span>
            </button>

            <a
              href={registrationUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              title="Test Open Visitor Form in New Tab"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Print Gate Poster Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Poster Preview */}
            <div className="border-4 border-[#035352] rounded-2xl p-6 text-center space-y-4 bg-gradient-to-b from-slate-50 to-white print:border-none">
              {logoUrl ? (
                <img src={logoUrl} alt={orgName} className="h-14 mx-auto object-contain rounded-lg" />
              ) : (
                <div className="w-12 h-12 bg-[#035352] text-[#F3E8BC] rounded-xl flex items-center justify-center mx-auto font-black text-xl">
                  {(orgName || 'D')[0]}
                </div>
              )}
              
              <div>
                <h2 className="text-2xl font-black text-[#172525]">{orgName}</h2>
                <p className="text-xs font-bold text-[#035352] uppercase tracking-wider mt-1">Visitor Self Check-In Gate</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-md inline-block my-2">
                <QRCodeSVG value={registrationUrl} size={220} level="H" />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[#172525]">SCAN QR TO CHECK IN</p>
                <p className="text-xs text-slate-500 mt-0.5">Point camera at QR code or use DigiGate Visitor App</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Powered by DIGI-GATE</span>
                <span>{orgCode ? `Org Code: ${orgCode}` : ''}</span>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-[#035352] text-white hover:bg-[#023e3d] flex items-center justify-center gap-2 shadow-md shadow-[#035352]/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Standee</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
