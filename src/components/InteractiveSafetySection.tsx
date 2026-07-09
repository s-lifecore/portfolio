'use client';

import { useState, useCallback } from 'react';
import DisasterSafetyBanner from './DisasterSafetyBanner';
import ConsentManager from './ConsentManager';

export default function InteractiveSafetySection() {
  const [consent, setConsent] = useState<{ hasConsent: boolean; location?: { lat: number; lon: number } }>({
    hasConsent: false
  });

  const handleConsentChange = useCallback((hasConsent: boolean, location?: { lat: number; lon: number }) => {
    setConsent(prev => {
      if (prev.hasConsent === hasConsent && 
          prev.location?.lat === location?.lat && 
          prev.location?.lon === location?.lon) {
        return prev;
      }
      return { hasConsent, location };
    });
  }, []);

  return (
    <>
      <DisasterSafetyBanner hasConsent={consent.hasConsent} location={consent.location} />
      <ConsentManager onConsentChange={handleConsentChange} />
    </>
  );
}
