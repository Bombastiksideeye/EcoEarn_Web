'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AdminService } from '@/lib/admin-service';

interface QRCodeScannerProps {
  onBinActivated: (binId: string) => void;
  userId: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onBinActivated, userId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeBinId, setActiveBinId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setScanStatus('scanning');
      setIsScanning(true);
      setErrorMessage('');

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start QR code detection
      detectQRCode();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrorMessage('Camera access denied or not available');
      setScanStatus('error');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setScanStatus('idle');
    setScanResult(null);
  };

  const detectQRCode = () => {
    // Simple QR code detection using a basic approach
    // In a real implementation, you would use a library like jsQR or @zxing/library
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const checkForQR = () => {
      if (!isScanning || !videoRef.current) return;
      
      if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        if (context) {
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Here you would use a QR code detection library
          // For now, we'll simulate detection with a manual input
        }
      }
      
      if (isScanning) {
        requestAnimationFrame(checkForQR);
      }
    };
    
    checkForQR();
  };

  const handleManualQRInput = () => {
    const qrData = prompt('Enter QR code data or scan manually:');
    if (qrData) {
      processQRCode(qrData);
    }
  };

  const handleDeactivateBin = async () => {
    if (!activeBinId) return;

    try {
      const adminService = new AdminService();
      await adminService.deactivateBinForUser(activeBinId, userId);
      
      setActiveBinId(null);
      setScanResult(null);
      setScanStatus('idle');
      alert('Bin deactivated successfully');
    } catch (error) {
      console.error('Error deactivating bin:', error);
      alert('Failed to deactivate bin');
    }
  };

  const processQRCode = async (qrData: string) => {
    try {
      const qrObject = JSON.parse(qrData);
      
      if (qrObject.type === 'bin_activation' && qrObject.binId) {
        const adminService = new AdminService();
        
        // Check if bin is available for activation
        const binDoc = await adminService.getBinById(qrObject.binId);
        
        if (!binDoc) {
          setErrorMessage('Bin not found');
          setScanStatus('error');
          return;
        }
        
        if (binDoc.status === 'active' && binDoc.currentUser !== userId) {
          setErrorMessage('This bin is already in use by another user');
          setScanStatus('error');
          return;
        }
        
        // Activate the bin
        await adminService.activateBin(qrObject.binId, userId);
        setScanResult(qrObject.binId);
        setActiveBinId(qrObject.binId);
        setScanStatus('success');
        onBinActivated(qrObject.binId);
        
      } else {
        setErrorMessage('Invalid QR code format');
        setScanStatus('error');
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      setErrorMessage('Invalid QR code data');
      setScanStatus('error');
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Scanner</h3>
      
      <div className="space-y-4">
        {/* Camera View */}
        <div className="relative">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {isScanning ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-blue-500 rounded-lg animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Status Display */}
        {scanStatus !== 'idle' && (
          <div className="text-center">
            {scanStatus === 'scanning' && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Scanning for QR code...</span>
              </div>
            )}
            
            {scanStatus === 'success' && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Bin activated successfully!</span>
              </div>
            )}
            
            {scanStatus === 'error' && (
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Start Scanning</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Stop Scanning</span>
              </button>
            )}
            
            <button
              onClick={handleManualQRInput}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Manual Input</span>
            </button>
          </div>

          {/* Deactivate Button */}
          {activeBinId && (
            <button
              onClick={handleDeactivateBin}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Deactivate Bin ({activeBinId})</span>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">How to use:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Click "Start Scanning" to activate camera</li>
            <li>• Point camera at the QR code on the bin</li>
            <li>• Wait for automatic detection</li>
            <li>• Or use "Manual Input" to enter QR data</li>
            <li>• Only one user can use a bin at a time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
