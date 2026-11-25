import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

// Chat routes depend on request-specific params and the authenticated session.
// Allow this route to resolve at request time instead of requiring an instant shell.
export const instant = false;

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;
  return <ChatWorkspace initialChatId={id} />;
}

