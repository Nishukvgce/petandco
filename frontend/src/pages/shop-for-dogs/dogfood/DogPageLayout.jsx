import React from 'react';

// Minimal placeholder layout restored during revert
export default function DogPageLayout({ activeLabel = 'All Dog Food' }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{activeLabel}</h1>
      <p className="text-sm text-muted-foreground">This page was restored to a simple placeholder during revert.</p>
    </div>
  );
}
