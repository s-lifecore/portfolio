import AdminBusinessCardSchedulesClient from '../../../components/AdminBusinessCardSchedulesClient';
import AdminLogin from '../../../components/AdminLogin';
import { cookies } from 'next/headers';

export const metadata = { title: 'ビジネスカード スケジュール管理' };

export default async function AdminBusinessCardSchedulesPage() {
  let adminValue;

  try {
    const cookieStore = await cookies();
    const c = cookieStore?.get?.('admin');
    adminValue = c?.value;
  } catch (e) {
    adminValue = undefined;
  }

  const isAdmin = adminValue === '1';

  return isAdmin ? (
    <AdminBusinessCardSchedulesClient />
  ) : (
    <AdminLogin />
  );
}
