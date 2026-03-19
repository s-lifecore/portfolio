import AdminEventsClient from '../../../components/AdminEventsClient';
import AdminLogin from '../../../components/AdminLogin';
import { headers, cookies } from 'next/headers';

function parseCookie(cookieHeader, name) {
    if (!cookieHeader) return undefined;
    const pairs = cookieHeader.split(';').map((p) => p.trim());
    for (const p of pairs) {
        const [k, v] = p.split('=');
        if (k === name) return decodeURIComponent(v || '');
    }
    return undefined;
}

export default async function AdminEventsPage() {
    let adminValue;

    try {
        const cookieStore = await cookies();
        const c = cookieStore?.get?.('admin');
        adminValue = c?.value;
    } catch (e) {
        adminValue = undefined;
    }

    const isAdmin = adminValue === '1';

    return isAdmin ? <AdminEventsClient /> : <AdminLogin />;
}
