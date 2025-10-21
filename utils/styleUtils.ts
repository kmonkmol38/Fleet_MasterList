import { Vehicle } from '../types';

export const getStatusBadgeClass = (status: Vehicle['status']) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'active') {
        return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
    if (lowerStatus === 'inactive') {
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
     if (lowerStatus === 'maintenance') {
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
    return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
};
