import { useState, useEffect } from 'react';
import api from '@/services/api';

export interface PlatformStats {
    totalRaised: number;
    totalSpent: number;
    remainingFund: number;
    animalFund: number;
    educationFund: number;
    medicalFund: number;
    oldAgeFund: number;
    generalFund: number;
    upiId: string;
    upiQrImageUrl: string | null;
    lastUpdated: string;
}

export function usePlatformStats() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/platform-stats');
            setStats(res.data);
        } catch (e) {
            console.error("Failed to fetch platform stats", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, refresh: fetchStats };
}
