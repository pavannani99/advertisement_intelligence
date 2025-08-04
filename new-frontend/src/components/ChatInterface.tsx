import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { ChatResponse, ChatMessage, ConversationStage, AdIdea } from '../types';

const ChatInterface: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ideas, setIdeas] = useState<AdIdea[]>([]);
  const [stage, setStage] = useState<ConversationStage>(ConversationStage.GATHERING_INFO);

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    const response = await apiClient.startPrompt('Start session with assistant');
    setSessionId(response.session_id);
    appendMessage('assistant', 'How can I help you today?');
  };

  const sendMessage = async () => {
    if (!sessionId || !input.trim()) return;

    appendMessage('user', input);
    const response = await apiClient.chat(sessionId, input);
    processResponse(response);
    setInput('');
  };

  const processResponse = (response: ChatResponse) => {
    appendMessage('assistant', response.response);
    setStage(response.stage);
    if (response.ideas) {
      setIdeas(response.ideas);
    }
  };

  const appendMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  return (
    <div className="terminal-card p-4 m-4 max-w-3xl mx-auto shadow-lg">
      <div className="overflow-auto max-h-96">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}>
            {msg.content}
          </div>
        ))}
      </div>
      {stage === ConversationStage.SHOWING_IDEAS && ideas.length > 0 && (
        <div className="mt-4">
          <h3 className="text-terminal-accent text-lg">Ad Ideas:</h3>
          {ideas.map((idea, idx) => (
            <div key={idx} className="terminal-card my-2 p-2">
              <strong>{idea.name}</strong>: {idea.description}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <input
          type="text"
          className="terminal-input w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message and press Enter..."
        />
      </div>
    </div>
  );
};

export default ChatInterface;

