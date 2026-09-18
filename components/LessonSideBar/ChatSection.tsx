// components/ChatSection.tsx
export default function
  ChatSection() {
  return (
    <div className="mb-12 rounded-lg border bg-white">
      <div className="border-b p-4">
        <h3 className="font-medium">Chat / Ask AI</h3>
        <p className="text-sm text-gray-500">No messages yet. Ask a question about this lesson...</p>
      </div>
      <div className="flex border-t p-4">
        <input
          type="text"
          placeholder="Start typing your question about this lesson..."
          className="min-w-0 flex-1 rounded-l-lg border border-r-0 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button className="rounded-r-lgbg-[#00f0ff] text-[#0F111A] px-6 text-white hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
}