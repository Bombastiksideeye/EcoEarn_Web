'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bin } from '@/lib/admin-service';

interface MapComponentProps {
  bins: Bin[];
  onBinSelect: (bin: Bin) => void;
  selectedBin?: Bin | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ bins, onBinSelect, selectedBin }) => {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Additional effect to ensure map container is ready
  useEffect(() => {
    if (isClient && mapRef.current) {
      // Force a re-render to ensure container is properly mounted
      const timer = setTimeout(() => {
        if (mapRef.current) {
          console.log('Map container is ready');
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    // Clean up existing map
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Clear markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear container
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
    }

    // Dynamically import Leaflet only on client side
    const initMap = async () => {
      // Double check that the container still exists and has dimensions
      if (!mapRef.current) {
        console.error('Map container not found during initialization');
        return;
      }

      // Check if container has proper dimensions
      const rect = mapRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.error('Map container has no dimensions');
        return;
      }

      const L = await import('leaflet');
      
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create map
      const map = L.map(mapRef.current!, {
        center: [7.5, 124.25],
        zoom: 7.5,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Store map reference
      leafletMapRef.current = map;

      // Add markers
      const markers: any[] = [];
      bins.forEach((bin) => {
        // Use default coordinates if not provided (for future smart bin integration)
        const lat = bin.lat ?? 8.4855; // Default to Oroquieta City
        const lng = bin.lng ?? 123.8064;
        const level = bin.level ?? 0; // Default to empty

        const getMarkerColor = (level: number, status: string) => {
          if (status === 'active') return 'blue'; // Active bins are blue
          if (level >= 80) return 'red';
          if (level >= 50) return 'orange';
          return 'green';
        };

        const createCustomIcon = (color: string, status: string) => {
          const isActive = status === 'active';
          const iconColor = isActive ? '#3B82F6' : '#6B7280'; // Blue for active, gray for inactive
          const shadowColor = isActive ? '#1E40AF' : '#4B5563';
          
          return L.divIcon({
            html: `
              <div style="
                position: relative;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <!-- Outer ring -->
                <div style="
                  position: absolute;
                  width: 40px;
                  height: 40px;
                  background: ${iconColor};
                  border-radius: 50%;
                  opacity: 0.2;
                  animation: pulse 2s infinite;
                "></div>
                
                <!-- Main marker -->
                <div style="
                  position: relative;
                  width: 32px;
                  height: 32px;
                  background: linear-gradient(135deg, ${iconColor}, ${shadowColor});
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 2;
                ">
                  <!-- Inner icon -->
                  <div style="
                    width: 16px;
                    height: 16px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                    color: ${iconColor};
                  ">
                    ${isActive ? '✓' : '○'}
                  </div>
                </div>
                
                <!-- Status indicator -->
                <div style="
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 12px;
                  height: 12px;
                  background: ${isActive ? '#10B981' : '#EF4444'};
                  border: 2px solid white;
                  border-radius: 50%;
                  z-index: 3;
                "></div>
                
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.1); opacity: 0.1; }
                    100% { transform: scale(1); opacity: 0.2; }
                  }
                </style>
              </div>
            `,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
          });
        };

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(getMarkerColor(level, bin.status), bin.status)
        }).addTo(map);

        // Add popup
        const popupContent = `
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${bin.name}</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
              <strong>Bin ID:</strong> ${bin.id}
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
              <strong>Location:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
              <strong>Status:</strong> 
              <span style="
                margin-left: 4px;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                ${bin.status === 'active' ? 'background: #dbeafe; color: #1e40af;' : 'background: #fee2e2; color: #991b1b;'}
              ">
                ${bin.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
              <strong>Fill Level:</strong> 
              <span style="
                margin-left: 4px;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                ${level >= 80 ? 'background: #fee2e2; color: #991b1b;' :
                  level >= 50 ? 'background: #fed7aa; color: #9a3412;' :
                  'background: #dcfce7; color: #166534;'}
              ">
                ${level >= 80 ? 'Full' : 
                  level >= 50 ? 'Half Full' : 'Empty'}
              </span>
            </p>
            ${bin.currentUser ? `
              <p style="font-size: 14px; color: #666; margin-bottom: 4px;">
                <strong>Current User:</strong> ${bin.currentUser.substring(0, 8)}...
              </p>
            ` : ''}
            ${bin.image ? `
              <div style="margin-top: 8px;">
                <img src="${bin.image}" alt="Bin" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" />
              </div>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        
        // Add click handler
        marker.on('click', () => {
          onBinSelect(bin);
        });

        markers.push(marker);
      });

      markersRef.current = markers;

      // Fit bounds if there are bins with coordinates
      const binsWithCoords = bins.filter(bin => bin.lat && bin.lng);
      if (binsWithCoords.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    };

    // Add a small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      initMap().catch((error) => {
        console.error('Map initialization failed:', error);
        // Retry once more after a longer delay
        setTimeout(() => {
          initMap().catch((retryError) => {
            console.error('Map initialization retry failed:', retryError);
          });
        }, 500);
      });
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [isClient, bins, onBinSelect]);

  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full rounded-xl overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
};

export default MapComponent;