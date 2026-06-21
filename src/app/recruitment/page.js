import { recruitments } from '../../data/recruitments';
import RecruitmentCard from '../../components/recruitment/RecruitmentCard';

export default function RecruitmentPage() {
    return (
        <main className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">募集一覧</h1>

            <div className="grid gap-6 sm:grid-cols-2">
                {recruitments.map((item) => (
                    <RecruitmentCard key={item.id} item={item} />
                ))}
            </div>
        </main>
    );
}
