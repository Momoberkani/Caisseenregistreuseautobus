import { useState } from 'react';
import { CaisseEnregistreuse } from './components/CaisseEnregistreuse';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <CaisseEnregistreuse />
    </div>
  );
}