'use client';

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_FIREBASE_API_KEY:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'Not set'}</p>
        <p><strong>NEXT_PUBLIC_FIREBASE_PROJECT_ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</p>
        <p><strong>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}</p>
        <p><strong>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:</strong> {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Not set'}</p>
        <p><strong>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'Not set'}</p>
        <p><strong>NEXT_PUBLIC_FIREBASE_APP_ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'Not set'}</p>
      </div>
    </div>
  );
}
