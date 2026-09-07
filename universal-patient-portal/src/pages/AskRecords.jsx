import { useState, useRef, useEffect } from "react";
import { askRecords } from "../services/api";
import { Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AskRecords = () => {
  const prn = localStorage.getItem("universal_prn");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I am your CorePulse Records Assistant. I can help you find specific information within your medical history. What would you like to know?" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    const question = text || query;
    if (!question.trim()) return;

    const newMessages = [...messages, { role: "user", text: question }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      // Pass previous history for context
      const history = newMessages.slice(0, -1);
      const data = await askRecords(prn, question, history);
      
      setMessages([...newMessages, { role: "assistant", text: data.answer }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", text: "Sorry, I encountered an error accessing your records. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "When was my last consultation?",
    "What medicines was I prescribed recently?",
    "Which clinics have I visited?",
    "What were my blood pressure readings?"
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Sparkles size={24} color="#0ea5e9" />
        </div>
        <div>
          <h1 style={styles.title}>Ask Your Records</h1>
          <p style={styles.subtitle}>Chat with your medical history to quickly find factual answers.</p>
        </div>
      </div>

      <div style={styles.chatContainer}>
        <div style={styles.messagesArea}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{...styles.messageWrapper, justifyContent: msg.role === "user" ? "flex-end" : "flex-start"}}>
              {msg.role === "assistant" && (
                <div style={styles.avatarBot}><Bot size={18} color="white" /></div>
              )}
              
              <div style={{
                ...styles.messageBubble, 
                background: msg.role === "user" ? "#0ea5e9" : "#f1f5f9",
                color: msg.role === "user" ? "white" : "#0f172a",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px"
              }}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>

              {msg.role === "user" && (
                <div style={styles.avatarUser}><User size={18} color="white" /></div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{...styles.messageWrapper, justifyContent: "flex-start"}}>
              <div style={styles.avatarBot}><Bot size={18} color="white" /></div>
              <div style={{...styles.messageBubble, background: "#f1f5f9", color: "#64748b"}}>
                <div className="typing-indicator">Searching your records...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div style={styles.suggestionsContainer}>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 0.5rem 0" }}>Suggested questions:</p>
            <div style={styles.suggestionsList}>
              {suggestedQuestions.map((q, idx) => (
                <button key={idx} onClick={() => handleSend(q)} style={styles.suggestionBadge}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.inputArea}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question here..."
            style={styles.textarea}
            rows={2}
          />
          <button 
            onClick={() => handleSend()} 
            disabled={!query.trim() || loading}
            style={{...styles.sendBtn, opacity: (!query.trim() || loading) ? 0.5 : 1}}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      <p style={styles.disclaimer}>
        This AI assistant only reads the data explicitly written in your records. It cannot provide medical advice, interpret symptoms, or diagnose conditions.
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 80px)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "2rem"
  },
  headerIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    background: "#e0f2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
    color: "#0f172a"
  },
  subtitle: {
    margin: "0.25rem 0 0 0",
    color: "#64748b"
  },
  chatContainer: {
    flex: 1,
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  messagesArea: {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  messageWrapper: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "flex-end"
  },
  avatarBot: {
    width: "32px", height: "32px", borderRadius: "50%", background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center"
  },
  avatarUser: {
    width: "32px", height: "32px", borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center"
  },
  messageBubble: {
    padding: "0.75rem 1.25rem",
    maxWidth: "75%",
    fontSize: "0.95rem",
    lineHeight: "1.5"
  },
  suggestionsContainer: {
    padding: "0 1.5rem 1rem 1.5rem"
  },
  suggestionsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem"
  },
  suggestionBadge: {
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    padding: "0.4rem 0.8rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
    color: "#334155",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  inputArea: {
    padding: "1.25rem",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  },
  textarea: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "0.95rem"
  },
  sendBtn: {
    background: "#0ea5e9",
    color: "white",
    border: "none",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  disclaimer: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "#94a3b8"
  }
};

export default AskRecords;
