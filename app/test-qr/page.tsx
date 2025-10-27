'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';
import QRCodeScanner from '@/components/bins/QRCodeScanner';
import { Download, QrCode } from 'lucide-react';

const TestQRPage: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [binId, setBinId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTestQR = async () => {
    if (!binId.trim()) {
      alert('Please enter a bin ID');
      return;
    }

    setIsGenerating(true);
    try {
      const qrData = JSON.stringify({
        binId: binId.trim(),
        type: 'bin_activation',
        timestamp: new Date().toISOString(),
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `bin-${binId}-qr-code.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const handleBinActivated = (activatedBinId: string) => {
    alert(`Bin ${activatedBinId} has been activated!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Scanner Test</h1>
          <p className="text-gray-600">Test the bin activation QR code scanning functionality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Generator */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Test QR Code</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bin ID
                </label>
                <input
                  type="text"
                  value={binId}
                  onChange={(e) => setBinId(e.target.value)}
                  placeholder="Enter bin ID (e.g., test-bin-001)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={generateTestQR}
                disabled={isGenerating || !binId.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Generate QR Code</span>
                  </>
                )}
              </button>

              {qrCodeUrl && (
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-32 h-32 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-600">Bin ID: {binId}</p>
                  </div>
                  
                  <button
                    onClick={downloadQRCode}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download QR Code</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Scanner */}
          <div>
            <QRCodeScanner
              onBinActivated={handleBinActivated}
              userId="test-user-123"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Test:</h3>
          <ol className="text-blue-800 space-y-2">
            <li>1. Enter a bin ID in the generator (e.g., "test-bin-001")</li>
            <li>2. Click "Generate QR Code" to create a test QR code</li>
            <li>3. Download the QR code or display it on another device</li>
            <li>4. Use the scanner on the right to scan the QR code</li>
            <li>5. The bin should activate and show "success" status</li>
            <li>6. Check the bin management page to see the status change</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestQRPage;
