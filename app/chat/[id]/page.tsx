import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;
  return <ChatWorkspace initialChatId={id} />;
}

