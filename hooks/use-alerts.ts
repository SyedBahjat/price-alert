'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Alert, CreateAlertInput } from '@/lib/supabase/types';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const createAlert = async (input: CreateAlertInput) => {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create alert');
    const alert = await res.json();
    setAlerts(prev => [alert, ...prev]);
    return alert;
  };

  const updateAlert = async (id: string, updates: Partial<Alert>) => {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update alert');
    const updated = await res.json();
    setAlerts(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  };

  const deleteAlert = async (id: string) => {
    const res = await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete alert');
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return { alerts, loading, createAlert, updateAlert, deleteAlert, refetch: fetchAlerts };
}
