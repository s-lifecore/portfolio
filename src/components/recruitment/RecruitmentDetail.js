export default function RecruitmentDetail({ item }) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{item.title}</h1>

            <p className="text-sm text-gray-500">{item.category} · {item.location} · {item.createdAt}</p>

            <div className="prose">
                {item.description.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                ))}
            </div>

            <div>
                <h2 className="text-lg font-semibold">応募条件</h2>
                <ul className="list-disc ml-6 mt-2">
                    {item.requirements.map((r) => (
                        <li key={r}>{r}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="text-lg font-semibold">歓迎スキル</h2>
                <ul className="list-disc ml-6 mt-2">
                    {item.welcomeSkills.map((s) => (
                        <li key={s}>{s}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
