import { notFound } from 'next/navigation';
import { loadRecruitments } from '../../../../data/recruitments';
import RecruitmentDetail from '../../../../components/recruitment/RecruitmentDetail';

export default async function Page({ params }) {
    const { id } = await params;

    const items = loadRecruitments();
    const item = items.find((r) => r.id === id);

    if (!item) {
        notFound();
    }

    return (
        <main className="max-w-3xl mx-auto py-12 px-4">
            <RecruitmentDetail item={item} />
        </main>
    );
}
