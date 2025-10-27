'use client';

import React, { useState } from 'react';
import { Upload, QrCode, Download, Trash2 } from 'lucide-react';
import { AdminService } from '@/lib/admin-service';
import QRCode from 'qrcode';

// Image compression function
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Clear canvas with transparent background
      ctx?.clearRect(0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/png', // Use PNG to preserve transparency
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback to original file
        }
      }, 'image/png', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

interface SimpleBinFormProps {
  onBinAdded: () => void;
}

const SimpleBinForm: React.FC<SimpleBinFormProps> = ({ onBinAdded }) => {
  const [binName, setBinName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [generatedBinId, setGeneratedBinId] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQRCode = async (binId: string) => {
    setIsGeneratingQR(true);
    try {
      const qrData = JSON.stringify({
        binId: binId,
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
      return qrCodeDataURL; // Return the QR code data URL
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
      return null;
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `bin-${generatedBinId}-qr-code.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const handleSubmit = async () => {
    if (!binName.trim()) {
      alert('Please enter a bin name');
      return;
    }

    if (!selectedImage) {
      alert('Please select an image');
      return;
    }

    setIsUploading(true);
    try {
      const adminService = new AdminService();
      
      // Compress and convert image to base64
      const compressedImage = await compressImage(selectedImage);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Image = e.target?.result as string;
          
          // Create bin data
          const binData = {
            name: binName.trim(),
            image: base64Image,
            qrData: '', // Will be set after QR generation
          };

          // Add bin to Firestore
          const binId = await adminService.addBin(binData);
          setGeneratedBinId(binId);

          // Generate QR code
          const qrCodeDataURL = await generateQRCode(binId);
          
          if (!qrCodeDataURL) {
            throw new Error('Failed to generate QR code');
          }

          // Update bin with QR data and QR code photo
          const qrData = JSON.stringify({
            binId: binId,
            type: 'bin_activation',
            timestamp: new Date().toISOString(),
          });

          // Update the bin with QR data and QR code photo
          const { updateDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          await updateDoc(doc(db, 'bins', binId), {
            qrData: qrData,
            qrCodePhoto: qrCodeDataURL // Save QR code as photo in Firestore
          });

          alert('Bin created successfully! QR code generated.');
          onBinAdded();
        } catch (error) {
          console.error('Error creating bin:', error);
          alert('Failed to create bin');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(compressedImage);
    } catch (error) {
      console.error('Error creating bin:', error);
      alert('Failed to create bin');
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setBinName('');
    setSelectedImage(null);
    setImagePreview(null);
    setQrCodeUrl(null);
    setGeneratedBinId(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bin Information</h3>
      
      <div className="space-y-4">
        {/* Bin Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bin Name *
          </label>
          <input
            type="text"
            value={binName}
            onChange={(e) => setBinName(e.target.value)}
            placeholder="e.g., Mobod MRF"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bin Picture *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Bin preview"
                    className="w-full h-32 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-gray-600">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">Browse Files to upload</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* QR Code Display */}
        {qrCodeUrl && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Generated QR Code
            </label>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-32 h-32 mx-auto mb-2"
              />
              <p className="text-xs text-gray-600 mb-2">
                Bin ID: {generatedBinId}
              </p>
              <button
                onClick={downloadQRCode}
                className="flex items-center justify-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors mx-auto"
              >
                <Download className="w-3 h-3" />
                <span>Download QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleClear}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || isGeneratingQR || !binName.trim() || !selectedImage}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading || isGeneratingQR ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{isUploading ? 'Creating...' : 'Generating QR...'}</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Submit</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Instructions:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Enter a unique bin name</li>
            <li>• Upload a clear picture of the bin</li>
            <li>• Click Submit to generate QR code</li>
            <li>• Print and attach QR code to the bin</li>
            <li>• Users scan QR to activate bin for recycling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleBinForm;
