import React from 'react';
import { isIOS } from '@/utils/browser-check';

export default function InstagramWarning() {
  const handleOpenBrowser = () => {
    const currentURL = window.location.href;
    if (isIOS()) {
      window.location.href = currentURL;
    } else {
      window.location.href = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold text-foreground">⚠️ Open in Browser</h1>
        <p className="text-muted-foreground">
          To use all features, please tap the button below to open in your default browser.
        </p>
        <button
          onClick={handleOpenBrowser}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-sm hover:bg-primary/90"
        >
          Open in Browser
        </button>
      </div>
    </div>
  );
}
