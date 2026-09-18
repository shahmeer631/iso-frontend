import icon from '@/public/library/Icon (8).png'
import Image from 'next/image';

export default function AiToolsSection() {
  const tools = ["Briefing Doc (Summary)", "Study Notes (Key Takeaways)", "Notes (Auto-generated)", "Analogy (Simplifying the concept)"];
  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">AI Learning Tools</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tools.map((tool) => (
          <button
            key={tool}
            className="flex flex-col items-center rounded-lg border bg-white p-6 text-center hover:border-blue-500 hover:shadow-sm"
          >
            <div className="mb-2 text-2xl">
              <Image 
              src={icon}
              width={24}
              height={24}
              alt=''
              />
            </div>
            <span className="text-sm font-medium">{tool}</span>
          </button>
        ))}
      </div>
    </div>
  );
}