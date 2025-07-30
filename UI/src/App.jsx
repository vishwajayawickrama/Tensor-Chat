import React, { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const API_BASE = 'http://localhost:5001';

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("API error:", err);
    }

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 text-center text-2xl font-bold">
          Tensor Chat
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50 scroll-smooth">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg text-sm shadow transition-all duration-300 
                  ${message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                <p>{message.text}</p>
                <div className="text-xs text-right mt-1 opacity-70">{message.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex border-t border-gray-300">
          <input
            type="text"
            className="flex-1 px-4 py-3 text-sm focus:outline-none text-gray-800"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 text-sm font-medium transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
