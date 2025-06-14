
// src/components/shared/FormattedDateDisplay.tsx
"use client";

import { useState, useEffect } from 'react';

interface FormattedDateDisplayProps {
  dateString: string;
  className?: string;
}

export default function FormattedDateDisplay({ dateString, className }: FormattedDateDisplayProps) {
  const [clientFormattedDate, setClientFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setClientFormattedDate(new Date(dateString).toLocaleDateString());
  }, [dateString]);

  if (!clientFormattedDate) {
    // Render a consistent placeholder or null until client-side formatting is ready.
    // This ensures server and initial client render are the same before the effect runs.
    // A simple "Loading..." or just the date part of ISO string can be used.
    // For this fix, we'll use a generic placeholder.
    return <span className={className}>....-..-..</span>;
  }

  return <span className={className}>{clientFormattedDate}</span>;
}
