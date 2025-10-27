'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FirebaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        // Test basic Firebase connection
        console.log('Testing Firebase connection...');
        console.log('Environment variables:', {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set',
        });

        // Try to access a collection to test the connection
        const binsRef = collection(db, 'bins');
        const snapshot = await getDocs(binsRef);
        
        console.log('Firebase connection successful!');
        console.log('Bins collection documents:', snapshot.docs.length);
        
        setConnectionStatus('connected');
        
        // Get available collections (we'll test a few common ones)
        const collectionsToTest = ['bins', 'reports', 'recycling_requests', 'userActivities', 'transactions'];
        const availableCollections: string[] = [];
        
        for (const collectionName of collectionsToTest) {
          try {
            const testRef = collection(db, collectionName);
            const testSnapshot = await getDocs(testRef);
            availableCollections.push(`${collectionName} (${testSnapshot.docs.length} docs)`);
          } catch (err) {
            console.warn(`Could not access ${collectionName}:`, err);
          }
        }
        
        setCollections(availableCollections);
        
      } catch (error) {
        console.error('Firebase connection failed:', error);
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    testFirebaseConnection();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Firebase Connection Test</h3>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'testing' ? 'bg-yellow-500 animate-pulse' :
            connectionStatus === 'connected' ? 'bg-green-500' :
            'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {connectionStatus === 'testing' && 'Testing connection...'}
            {connectionStatus === 'connected' && '✅ Connected to Firebase'}
            {connectionStatus === 'error' && '❌ Connection failed'}
          </span>
        </div>

        {/* Environment Variables Status */}
        <div className="text-sm text-gray-600">
          <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Not set'}</p>
          <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</p>
          <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}</p>
        </div>

        {/* Error Message */}
        {connectionStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {errorMessage}
            </p>
          </div>
        )}

        {/* Available Collections */}
        {connectionStatus === 'connected' && collections.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Collections:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {collections.map((collection, index) => (
                <li key={index}>• {collection}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {connectionStatus === 'error' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Make sure you have created a <code>.env.local</code> file in your project root with your Firebase credentials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseTest;
