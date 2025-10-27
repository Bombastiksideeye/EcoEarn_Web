'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AdminService, Bin } from '@/lib/admin-service';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  ),
});

interface BinMapProps {
  bins: Bin[];
  onBinSelect: (bin: Bin) => void;
  selectedBin?: Bin | null;
}

const BinMap: React.FC<BinMapProps> = ({ bins, onBinSelect, selectedBin }) => {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden">
      <MapComponent
        bins={bins}
        onBinSelect={onBinSelect}
        selectedBin={selectedBin}
      />
    </div>
  );
};

export default BinMap;
