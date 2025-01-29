import { FC, useEffect } from 'react';
import { getSelectors } from '../../../shared/store/getSelectors';
import { useChatStore } from '../../state';
import { ChatRoom } from './ChatRoom';
import { ChatLayout } from './ChatLayout';

export const ChatRoomContainer: FC = () => {
  const videoCallState = getSelectors(useChatStore, ['conversation']);

  return (
    <ChatLayout>
      <ChatRoom />
    </ChatLayout>
  );
};
