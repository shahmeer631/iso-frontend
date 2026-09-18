// components/RelatedStandards.tsx
import victor from '@/public/library/Vector.png'
import Image from 'next/image';

export default function RelatedStandards() {
  const standards = [
    { code: "ISO 9004", title: "Quality Management — Performance", desc: "Explore +", icon: victor },
    { code: "ISO 14001", title: "Environmental Management", desc: "Explore +", icon: victor },
    { code: "ISO 45001", title: "Occupational Health & Safety", desc: "Explore +", icon: victor },
  ];

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Related Standards</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {standards.map((std) => (
          <div key={std.code} className="rounded-lg border bg-white p-6 hover:border-blue-500">
            <div className='mb-2'>
              <Image
            src={std.icon}
            alt=""
            width={24}
            height={24}
            className=''
            />
            </div>
            <h3 className="font-bold">{std.code}</h3>
            <p className="mt-1 text-sm text-gray-600">{std.title}</p>
            <button className="mt-4 text-sm text-blue-600 hover:underline">
              {std.desc}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}