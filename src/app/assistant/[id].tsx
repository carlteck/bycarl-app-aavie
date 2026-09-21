import { useLocalSearchParams } from 'expo-router';

import { AssistantThread } from '@/components/assistant-thread';
import { EmptyState } from '@/components/screen-state';
import { StackScreen } from '@/components/stack-screen';
import { asId } from '@/lib/remote-values';

export default function AssistantConversationScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = asId(params.id);
  return (
    <StackScreen title="Conversation" backLabel="Assistant">
      {id ? (
        <AssistantThread conversationId={id} />
      ) : (
        <EmptyState
          icon="alert-circle-outline"
          title="Conversation introuvable"
          message="Ce lien ne correspond à aucune de vos conversations."
        />
      )}
    </StackScreen>
  );
}
