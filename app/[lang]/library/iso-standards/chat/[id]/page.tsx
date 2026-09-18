import ChatInterface from "@/components/Library/iso-standards/ChatInterface";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id } = await params;

  return <ChatInterface id={id} />;
}

