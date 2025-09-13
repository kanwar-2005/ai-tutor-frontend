import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Import the new library
import './App.css'; 

// --- SVG Icons ---
const TutorIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 11-1.06-1.06l1.59-1.591a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.803 17.803a.75.75 0 01-1.06 0l-1.59-1.591a.75.75 0 111.06-1.06l1.591 1.59a.75.75 0 010 1.06zM12 21.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0V21a.75.75 0 01-.75.75zM6.106 18.894a.75.75 0 01-1.06 0l-1.591-1.59a.75.75 0 111.06-1.06l1.591 1.59a.75.75 0 010 1.06zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zM6.197 6.197a.75.75 0 010-1.06l1.59-1.591a.75.75 0 111.06 1.06L7.258 6.197a.75.75 0 01-1.06 0z" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export default function App() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', content: "Hello! I'm your personal AI Tutor. How can I help you learn today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const newChatHistory = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(newChatHistory);
    const currentQuestion = question;
    setQuestion('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'The server returned an error.');
      }
      const data = await response.json();
      setChatHistory([...newChatHistory, { role: 'model', content: data.answer }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <TutorIcon className="header-icon" />
          <h1 className="header-title">AI Virtual Tutor</h1>
        </div>
      </header>

      <main className="chat-area">
        <div className="chat-history">
          {chatHistory.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.role}`}>
              <div className={`message-bubble ${message.role}`}>
                {/* --- THIS IS THE KEY CHANGE --- */}
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper model">
              <div className="message-bubble model">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="footer">
        <div className="form-container">
          <form onSubmit={handleSendMessage} className="input-form">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything..."
              className="chat-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="send-button"
            >
              <SendIcon className="send-icon" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}