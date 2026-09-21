import { AssistantThread } from '@/components/assistant-thread';
import { StackScreen } from '@/components/stack-screen';

export default function NewAssistantConversationScreen() {
  return (
    <StackScreen title="Nouvelle conversation" backLabel="Assistant">
      <AssistantThread conversationId={null} />
    </StackScreen>
  );
}
