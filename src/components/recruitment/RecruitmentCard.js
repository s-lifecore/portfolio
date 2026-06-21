import Link from 'next/link';

export default function RecruitmentCard({ item }) {
    return (
        <Link
            href={`/recruitment/details/${item.id}`}
            className="block border rounded-lg p-4 hover:shadow transition bg-white"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{item.summary}</p>
                </div>

                <div className="text-right text-sm text-gray-500">
                    <div>{item.createdAt}</div>
                    <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded">{item.category}</div>
                </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">{item.location}</div>
        </Link>
    );
}
