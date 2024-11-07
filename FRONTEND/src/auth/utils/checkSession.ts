import { extractToken } from './extractToken';

export const checkSession = (): any | null => {
    const token = localStorage.getItem('authToken');
    if (token) {
        return extractToken(token);
    }
    return null;
};
