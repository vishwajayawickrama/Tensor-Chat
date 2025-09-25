import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, MoreHorizontal, HelpCircle, Sparkles, Upload, X, FileText, CheckCircle } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const API_BASE = 'http://localhost:5001';

  const integrations = [
    { name: 'Visual Studio', description: 'Requires extension', status: 'Get', icon: '🔵' },
    { name: 'Anaconda', description: 'Requires permissions', status: 'Enable', icon: '🟢' },
    { name: 'IntelliJ Idea', description: 'Requires extension', status: 'Get', icon: '🔴' },
    { name: 'PyTorch', description: 'Requires permissions', status: 'Enable', icon: '🟠' },
    { name: 'PyCharm', description: 'Requires permissions', status: 'Enable', icon: '🟢' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if there's already a PDF loaded in the session
    const checkPdfStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/pdf-status`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.has_pdf) {
            // Set a placeholder since we don't have the original filename
            setUploadedPdf({
              name: 'Previously uploaded PDF',
              size: 0,
              uploadedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error checking PDF status:', error);
      }
    };

    checkPdfStatus();
  }, []);

  const uploadPdf = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch(`${API_BASE}/upload-pdf`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedPdf({
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });
        
        // Add system message about PDF upload
        const systemMsg = {
          id: Date.now(),
          sender: 'system',
          text: `PDF "${file.name}" has been uploaded successfully! You can now ask questions about this document.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, systemMsg]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) uploadPdf(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadPdf(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePdf = async () => {
    try {
      const response = await fetch(`${API_BASE}/remove-pdf`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUploadedPdf(null);
        const systemMsg = {
          id: Date.now(),
          sender: 'system',
          text: 'PDF has been removed. Upload a new document to continue asking questions about PDFs.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, systemMsg]);
      }
    } catch (error) {
      console.error('Error removing PDF:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
        credentials: 'include'
      });

      const data = await response.json();
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 1000);
    } catch (err) {
      console.error("API error:", err);
      setIsTyping(false);
    }

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Glass Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="max-w-2xl mx-auto text-center w-full">
              {/* Avatar */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg isolate"></div>
                <div className="absolute inset-2 flex items-center justify-center">
                  {/* Tensor Grid Pattern */}
                  <div className="grid grid-cols-3 gap-1 w-6 h-6 sm:w-8 sm:h-8">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/90 rounded-full shadow-sm"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/90 rounded-full shadow-sm"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/100 rounded-full shadow-lg shadow-blue-400/50"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/90 rounded-full shadow-sm"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/90 rounded-full shadow-sm"></div>
                  </div>
                </div>
                {/* Shimmer overlay */}
                <div className="absolute inset-0 rounded-2xl opacity-50 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
              </div>

              {/* Welcome Message */}
              <h2 className="text-white text-xl sm:text-2xl font-medium mb-4 sm:mb-6 px-4">Can I help you with anything?</h2>
              
              <div className="text-gray-400 text-sm mb-4 sm:mb-6 max-w-lg mx-auto leading-relaxed px-4">
                Modern AI chatbot powered by <span className="text-white font-semibold">LLaMA 3.3 70B via Groq</span>, with <span className="text-white font-semibold">LangChain</span>
              </div>
              
              <div className="text-gray-500 text-xs mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4">
                Ready to assist you with anything you need?<br />
                From answering questions, generation to providing<br />
                recommendations. Let's get started!
              </div>

              {/* PDF Upload Area */}
              <div className="max-w-md mx-auto mb-6 sm:mb-8 px-4">
                <div 
                  className={`bg-black/20 backdrop-blur-xl border-2 border-dashed ${
                    dragOver ? 'border-blue-400/60' : 'border-white/30'
                  } rounded-2xl shadow-lg isolate p-6 sm:p-8 text-center relative transition-all duration-300 hover:border-white/50`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {!uploadedPdf ? (
                      <>
                        <Upload className="w-8 h-8 text-white/60 mx-auto mb-3" />
                        <h3 className="text-white font-medium mb-2">Upload PDF Document</h3>
                        <p className="text-white/60 text-sm mb-4">
                          Drag and drop your PDF here or click to browse
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? 'Uploading...' : 'Choose PDF File'}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center mb-3">
                          <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                          <FileText className="w-6 h-6 text-white/60" />
                        </div>
                        <h3 className="text-white font-medium mb-2">PDF Loaded</h3>
                        <p className="text-white/60 text-sm mb-4">
                          {uploadedPdf.name}
                        </p>
                        <div className="flex space-x-2 justify-center">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                          >
                            Replace
                          </button>
                          <button
                            onClick={removePdf}
                            className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-red-300 px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Integrations Panel */}
              {showIntegrations && (
                <div className="bg-black/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg isolate p-4 sm:p-6 mb-6 sm:mb-8 text-left max-w-md mx-auto relative">
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-medium">Work with</span>
                      <HelpCircle className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="space-y-3">
                      {integrations.map((integration, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl isolate relative">
                          {/* Inner shimmer */}
                          <div className="absolute inset-0 rounded-xl opacity-20 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
                          <div className="flex items-center space-x-3 relative z-10 min-w-0 flex-1">
                            <span className="text-lg flex-shrink-0">{integration.icon}</span>
                            <div className="min-w-0">
                              <div className="text-white text-sm font-medium truncate">{integration.name}</div>
                              <div className="text-white/60 text-xs truncate">{integration.description}</div>
                            </div>
                          </div>
                          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 relative z-10 flex-shrink-0 ml-2">
                            {integration.status}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* PDF Status Bar */}
              {uploadedPdf && (
                <div className="bg-black/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg isolate p-3 sm:p-4 relative">
                  <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white text-sm font-medium">PDF Loaded</div>
                        <div className="text-white/60 text-xs">{uploadedPdf.name}</div>
                      </div>
                    </div>
                    <button
                      onClick={removePdf}
                      className="p-1 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 sm:space-x-3 ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  } ${message.sender === 'system' ? 'justify-center' : ''}`}
                >
                  {/* Avatar - only show for user and bot messages */}
                  {message.sender !== 'system' && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg isolate flex items-center justify-center flex-shrink-0 relative">
                      {message.sender === 'user' ? (
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          T
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-0.5 w-3 h-3 sm:w-4 sm:h-4">
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/90 rounded-full"></div>
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full"></div>
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/90 rounded-full"></div>
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full"></div>
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/100 rounded-full"></div>
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full"></div>
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/90 rounded-full"></div>
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full"></div>
                          <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/90 rounded-full"></div>
                        </div>
                      )}
                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`${message.sender === 'system' ? 'max-w-md' : 'flex-1 max-w-[calc(100%-3rem)] sm:max-w-xs md:max-w-md lg:max-w-lg'} ${
                    message.sender === 'user' ? 'ml-auto' : message.sender === 'system' ? 'mx-auto' : 'mr-auto'
                  }`}>
                    {message.sender !== 'system' && (
                      <div className="text-xs text-gray-400 mb-1 px-2">
                        {message.sender === 'user' ? 'Tommy Radison' : 'Tensor Chat'} • {message.time}
                      </div>
                    )}
                    <div className={`${
                      message.sender === 'system' 
                        ? 'bg-green-500/20 border-green-400/30' 
                        : 'bg-black/20 border-white/30'
                    } backdrop-blur-xl border rounded-2xl shadow-lg isolate px-3 py-2 sm:px-4 sm:py-3 relative`}>
                      <p className={`text-sm ${
                        message.sender === 'system' ? 'text-green-300 text-center' : 'text-white'
                      } leading-relaxed relative z-10 break-words`}>
                        {message.text}
                      </p>
                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 rounded-2xl opacity-20 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    </div>
                    {message.sender === 'bot' && (
                      <button className="mt-2 ml-2 text-xs text-gray-500 hover:text-gray-400 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Generate.</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg isolate flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-0.5 w-3 h-3 sm:w-4 sm:h-4">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/90 rounded-full"></div>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full"></div>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/90 rounded-full"></div>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full"></div>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/100 rounded-full"></div>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full"></div>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/90 rounded-full"></div>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full"></div>
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/90 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg isolate px-3 py-2 sm:px-4 sm:py-3 relative">
                    <div className="flex space-x-1 relative z-10">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 rounded-2xl opacity-20 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-6">
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-black/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg isolate p-2 flex items-center space-x-1 sm:space-x-2 relative">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
              
              {/* Attachment button */}
              <button 
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 relative z-10"
                onClick={() => fileInputRef.current?.click()}
                title="Upload PDF"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              {/* Hidden file input for quick access */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <input
                type="text"
                className="flex-1 bg-transparent text-white placeholder-white/40 outline-none px-3 py-2 sm:py-3 rounded-xl relative z-10 text-sm sm:text-base"
                placeholder={uploadedPdf ? "Ask about your PDF..." : "Ask me anything..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              
              <button 
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 relative z-10 flex-shrink-0"
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {/* Optional: Keep mic and more buttons, but make them smaller on mobile */}
              <button className="p-1.5 sm:p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 relative z-10 flex-shrink-0">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="p-1.5 sm:p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 relative z-10 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-white/40 text-xs mt-3 sm:mt-4 px-4">
            Tensor Chat may contain errors. We recommend checking important information.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;