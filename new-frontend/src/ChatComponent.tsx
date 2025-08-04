import React, { useState } from 'react';
import { apiClient } from './services/api';

const ChatComponent: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);

  const startSession = async () => {
    const response = await apiClient.startPrompt('Start chat session');
    setSessionId(response.session_id);
    setMessages([{ sender: 'assistant', text: 'Session started. How can I assist you today?' }]);
  };

  const sendMessage = async (message: string) => {
    if (!sessionId) {
      return;
    }

    setMessages((prev) => [...prev, { sender: 'user', text: message }]);
    const response = await apiClient.chat(sessionId, message);

    setMessages((prev) => [...prev, { sender: 'assistant', text: response.response }]);
    setInput('');
  };

  return (
    <div className="p-4">
      {!sessionId && (
        <button className="terminal-button-primary" onClick={startSession}>Start Session</button>
      )}
      <div className="terminal-card overflow-auto h-96 mt-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === 'user' ? 'message-user' : 'message-assistant'}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <input
          type="text"
          className="terminal-input w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default ChatComponent;
