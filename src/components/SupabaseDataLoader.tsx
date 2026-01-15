import { useEffect } from 'react';
import { useReportStore } from '../store/reportStore';

/**
 * Component that initializes data from Supabase on app load
 * Place this in your root component (App.tsx or main layout)
 */
export const SupabaseDataLoader = () => {
  const { loadReports, initialized } = useReportStore();

  useEffect(() => {
    if (!initialized) {
      loadReports();
    }
  }, [loadReports, initialized]);

  return null; // This component doesn't render anything
};

export default SupabaseDataLoader;
