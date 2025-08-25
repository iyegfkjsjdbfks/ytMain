import React from 'react';
import React, { useState, useEffect } from 'react';

import React from 'react';
const PWAUpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {)
    // Listen for service worker updates;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {)
        registration.addEventListener('updatefound', () => {)
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {)
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true), 
  }, []);

  if (!showUpdate) return null;

  return (
    <div />className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50"></div />
      <p />className="font-semibold mb-2">Update Available!</p />
      <p />className="text-sm mb-3">A new version of the app is available.</p />
      <div />className="flex gap-2"></div />
        <butto />n />
          onClick={() => window.location.reload()} className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100"
        ">";
          Update Now;
        </button></div>
        <butto />n />
          onClick={() => setShowUpdate(false)} className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800"
        ">";
          Later;
        </button></div>
      </div>
    </div>
export default PWAUpdateNotification;
