
export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'participant';
  timestamp: string;
}
