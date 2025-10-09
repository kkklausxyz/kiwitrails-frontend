import { useEffect, useRef, useState } from "react";
import throttle from "lodash/throttle";
import Layout from "../components/Layout";
import ChatHeader from "../components/ChatHeader";
import SuggestionChips from "../components/SuggestionChips";
import ContentCards from "../components/ContentCards";
import ChatMessage from "../components/ChatMessage";
import InputArea from "../components/InputArea";
import Loading from "../components/Loading";
import { sendChatMessage } from "../api/chatService";

export default function Chat() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Kia ora! I'm your New Zealand travel guide. Tell me your dates, budget, transport, and interests, and I'll plan a route.",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    },
  ]);
  const [userScrolled, setUserScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState(null);

  const contentRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const inputRef = useRef(null);

  // Welcome screen animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500); // Show welcome screen for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Stop generation function
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsGenerating(false);
    setLoading(false);
  };

  // auto-scroll to bottom when messages change (unless user scrolled up)
  useEffect(() => {
    if (userScrolled) return;
    const contentEl = contentRef.current;
    if (!contentEl) return;
    window.scrollTo({ top: contentEl.scrollHeight, behavior: "smooth" });
  }, [messages, userScrolled]);

  // Debug message changes

  // detect upward scroll => freeze auto-scroll
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || 0;
      if (y <= lastScrollTopRef.current) setUserScrolled(true);
      lastScrollTopRef.current = y;
    };
    const throttled = throttle(handleScroll, 300);
    window.addEventListener("scroll", throttled);
    return () => {
      window.removeEventListener("scroll", throttled);
      throttled.cancel?.();
    };
  }, []);

  // Handle suggestion chip clicks - populate input field
  const handleSuggestionClick = (text) => {
    // This will be passed to InputArea to populate the input field
    if (inputRef.current) {
      inputRef.current.setValue(text);
    }
  };

  // unified send handler (for default questions & input)
  const handleSend = async (text) => {
    if (!text?.trim()) return;

    setUserScrolled(false);
    setLoading(true);
    setError(null);
    setIsGenerating(true);

    // Create AbortController for request cancellation
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Prepare conversation history (including new user message)
      const conversationWithNewMessage = [
        ...messages,
        { role: "user", content: text },
      ];

      // Add user message to state first
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          {
            role: "user",
            content: text,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          },
        ];
        return newMessages;
      });

      // Call real API with complete conversation history

      // Add empty AI message for real-time streaming display
      setMessages((prev) => {
        const newMessages = [
          ...prev,
          {
            role: "assistant",
            content: "",
            thinking: true,
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          },
        ];
        return newMessages;
      });

      // Use streaming callback to handle real-time response
      let accumulatedContent = ""; // Accumulated content for deduplication
      const result = await sendChatMessage(
        conversationWithNewMessage,
        (content) => {
          // Accumulate content
          accumulatedContent += content;

          // Update AI message content in real-time
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              // Use accumulated content to avoid duplication
              lastMessage.content = accumulatedContent;
              lastMessage.thinking = false; // Stop showing thinking message
            }
            return newMessages;
          });
        },
        controller.signal // Pass AbortSignal
      );

      if (result.success) {
      } else if (result.aborted) {
        // User actively cancelled, don't show error message
      } else {
        // API call failed, update the existing thinking message with error
        setError(result.error || "Network request failed");
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content =
              "Sorry, the service is temporarily unavailable. Please try again later.";
            lastMessage.thinking = false;
            lastMessage.error = true;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Check if user actively cancelled
      if (error.name === "AbortError" || error.message.includes("aborted")) {
        // User actively stopped, don't show error message
        return;
      }

      // Only show error message for real errors
      setError("Failed to send message, please check your network connection");
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content =
            "Sorry, the service is temporarily unavailable. Please try again later.";
          lastMessage.thinking = false;
          lastMessage.error = true;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  return (
    <Layout background="#f5f5f5" showNavbar={!showWelcome}>
      {showWelcome ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(180deg, #EEF2F7 0%, #F7F9FC 100%)",
            zIndex: 9999,
            animation: "fadeOut 0.5s ease-out 2s forwards",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#4d7cd6",
              marginBottom: "16px",
              animation: "fadeInUp 0.8s ease-out",
            }}
          >
            Hi, I'm KiwiTrails
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#333",
              textAlign: "center",
              maxWidth: "600px",
              padding: "0 20px",
              lineHeight: 1.6,
              animation: "fadeInUp 0.8s ease-out 0.3s backwards",
            }}
          >
            Your personal travel assistant for exploring New Zealand
          </p>
        </div>
      ) : (
        <div className="main-content-wrapper" style={styles.mainContentWrapper}>
          <div className="main-container" style={styles.mainContainer}>
            {/* Left Column - Chat Interface */}
            <div className="chat-column" style={styles.chatColumn}>
              <div
                className="chat-interface-container"
                style={styles.chatInterfaceContainer}
              >
                <ChatHeader />
                <SuggestionChips
                  onSelect={handleSuggestionClick}
                  disabled={loading}
                />

                <div
                  className="content"
                  ref={contentRef}
                  style={styles.chatContent}
                >
                  <ChatMessage messages={messages} />
                  {error && (
                    <div
                      style={{
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                        padding: "10px",
                        borderRadius: "5px",
                        margin: "10px 0",
                        fontSize: "14px",
                      }}
                    >
                      ⚠️ {error}
                    </div>
                  )}
                </div>

                <InputArea
                  ref={inputRef}
                  onSend={handleSend}
                  onStop={handleStop}
                  prohibit={loading}
                  isGenerating={isGenerating}
                />
              </div>
            </div>

            {/* Right Column - Content Cards */}
            <div className="sidebar-column" style={styles.sidebarColumn}>
              <ContentCards />
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
        
        /* Responsive styles */
        @media (max-width: 1024px) {
          .main-content-wrapper {
            padding: 10px !important;
          }
          
          .main-container {
            flex-direction: column !important;
            height: auto !important;
            min-height: calc(100vh - 80px) !important;
            gap: 15px !important;
          }
          
          .chat-column {
            order: 2 !important;
            min-height: 60vh !important;
          }
          
          .chat-interface-container {
            min-height: 60vh !important;
          }
          
          .sidebar-column {
            order: 1 !important;
            min-height: auto !important;
            max-height: none !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </Layout>
  );
}

const styles = {
  mainContentWrapper: {
    padding: "20px",
    maxWidth: "1160px",
    margin: "0 auto",
  },
  mainContainer: {
    display: "flex",
    height: "calc(100vh - 100px)", // Subtract navbar height and padding
    gap: "20px",
  },
  chatColumn: {
    flex: "2",
    display: "flex",
    flexDirection: "column",
  },
  chatInterfaceContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e5e7",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  chatContent: {
    flex: "1",
    overflowY: "auto",
    padding: "0 20px",
    paddingBottom: "20px",
  },
  sidebarColumn: {
    flex: "1",
    padding: "20px",
    backgroundColor: "#ffffff",
    minHeight: "calc(100vh - 100px)",
    overflowY: "auto",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e5e7",
  },
};
