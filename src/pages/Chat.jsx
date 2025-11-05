import { useEffect, useRef, useState } from "react";
import throttle from "lodash/throttle";
import { CloseOutlined } from "@ant-design/icons";
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
  const inputContainerRef = useRef(null);
  const chatColumnRef = useRef(null);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);

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

    // Scroll the chat content area to bottom
    contentEl.scrollTo({
      top: contentEl.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, userScrolled]);

  // Auto-scroll during content generation for mobile
  useEffect(() => {
    if (!isGenerating || userScrolled) return;

    const interval = setInterval(() => {
      const contentEl = contentRef.current;
      if (!contentEl) return;

      contentEl.scrollTo({
        top: contentEl.scrollHeight,
        behavior: "smooth",
      });
    }, 300); // Check every 300ms during generation

    return () => clearInterval(interval);
  }, [isGenerating, userScrolled]);

  // Debug message changes

  // detect upward scroll => freeze auto-scroll
  useEffect(() => {
    const handleScroll = () => {
      const contentEl = contentRef.current;
      if (!contentEl) return;

      const scrollTop = contentEl.scrollTop;
      const scrollHeight = contentEl.scrollHeight;
      const clientHeight = contentEl.clientHeight;

      // If user is near the bottom (within 100px), allow auto-scroll
      if (scrollHeight - scrollTop - clientHeight < 100) {
        setUserScrolled(false);
      } else {
        setUserScrolled(true);
      }
    };

    const contentEl = contentRef.current;
    if (contentEl) {
      contentEl.addEventListener("scroll", handleScroll);
      return () => {
        contentEl.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  // Prevent body scroll when chat is in fullscreen mode on mobile
  useEffect(() => {
    if (window.innerWidth > 768) return; // Only on mobile
    
    if (isChatFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isChatFullscreen]);

  // Detect when chat interface enters viewport and enable fullscreen on mobile
  useEffect(() => {
    if (window.innerWidth > 768) return; // Only on mobile

    const handleWindowScroll = throttle(() => {
      if (!chatColumnRef.current) return;

      const rect = chatColumnRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if chat interface is in the viewport
      const isInViewport = rect.top < windowHeight && rect.bottom > 0;
      
      // Calculate how much of the chat interface top is visible
      const topVisible = Math.max(0, windowHeight - rect.top);
      const threshold = windowHeight * 0.2; // Trigger when 20% of top is visible
      
      // Enable fullscreen when chat interface enters viewport from top
      if (isInViewport && topVisible > threshold && rect.top < windowHeight * 0.3) {
        if (!isChatFullscreen) {
          setIsChatFullscreen(true);
        }
      } 
      // Disable fullscreen when scrolling up and chat interface is mostly out of view
      else if (rect.top > windowHeight * 0.5 || rect.bottom < windowHeight * 0.3) {
        if (isChatFullscreen) {
          setIsChatFullscreen(false);
        }
      }
    }, 150);

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    handleWindowScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, [isChatFullscreen]);

  // Handle exit fullscreen
  const handleExitFullscreen = () => {
    setIsChatFullscreen(false);
  };

  // Handle suggestion chip clicks - populate input field
  const handleSuggestionClick = (text) => {
    // This will be passed to InputArea to populate the input field
    if (inputRef.current) {
      inputRef.current.setValue(text);
    }
  };

  // Handle content card button clicks - populate input field
  const handleContentCardClick = (question) => {
    if (inputRef.current) {
      inputRef.current.setValue(question);
    }
    
    // Scroll to input box on mobile devices
    if (window.innerWidth <= 768 && inputContainerRef.current) {
      setTimeout(() => {
        const inputRect = inputContainerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = inputRect.top + scrollTop - 20; // 20px offset for better visibility
        
        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        });
      }, 100); // Small delay to ensure input is populated
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
            <div 
              ref={chatColumnRef}
              className={`chat-column ${isChatFullscreen ? 'chat-fullscreen' : ''}`}
              style={styles.chatColumn}
            >
              <div
                className={`chat-interface-container ${isChatFullscreen ? 'chat-interface-fullscreen' : ''}`}
                style={styles.chatInterfaceContainer}
              >
                {/* Exit fullscreen button - only visible in fullscreen mode */}
                {isChatFullscreen && (
                  <div style={styles.exitButtonContainer}>
                    <button
                      onClick={handleExitFullscreen}
                      style={styles.exitButton}
                      aria-label="Exit fullscreen"
                    >
                      <CloseOutlined style={styles.exitIcon} />
                    </button>
                  </div>
                )}
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

                <div ref={inputContainerRef}>
                  <InputArea
                    ref={inputRef}
                    onSend={handleSend}
                    onStop={handleStop}
                    prohibit={loading}
                    isGenerating={isGenerating}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Content Cards */}
            <div className="sidebar-column" style={styles.sidebarColumn}>
              <ContentCards onQuestionSelect={handleContentCardClick} />
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
            min-height: calc(100vh - 60px) !important;
            gap: 15px !important;
          }
          
          .chat-column {
            order: 2 !important;
            min-height: 75vh !important;
          }
          
          .chat-interface-container {
            min-height: 75vh !important;
          }
          
          .sidebar-column {
            order: 1 !important;
            min-height: auto !important;
            max-height: none !important;
            padding: 20px !important;
          }
        }
        
        /* Additional mobile optimizations */
        @media (max-width: 768px) {
          .chat-column {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative !important;
          }
          
          .chat-column.chat-fullscreen {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f5f5f5 !important;
          }
          
          .chat-interface-container {
            min-height: 80vh !important;
            max-height: 80vh !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            border-radius: 12px !important;
          }
          
          .chat-interface-container.chat-interface-fullscreen {
            min-height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          .chat-fullscreen .content {
            max-height: calc(100vh - 200px) !important;
          }
          
          .main-content-wrapper {
            padding: 5px !important;
            transition: opacity 0.3s ease !important;
          }
          
          /* Fix suggestion chips from being squeezed */
          .chat-interface-container > div:first-of-type {
            flex-shrink: 0 !important;
            min-height: auto !important;
          }
          
          /* Ensure suggestion chips container is stable and horizontally scrollable */
          .chat-interface-container > div:nth-of-type(2) {
            flex-shrink: 0 !important;
            min-height: auto !important;
            max-height: 80px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            width: 100% !important;
          }
          
          /* Enhanced mobile scrolling */
          .content {
            -webkit-overflow-scrolling: touch !important;
            scroll-behavior: smooth !important;
            overscroll-behavior: contain !important;
            max-height: calc(80vh - 200px) !important;
            overflow-y: auto !important;
            flex: 1 !important;
            min-height: 0 !important;
          }
          
          /* Keep input area visible and fixed */
          .input-container {
            position: sticky !important;
            bottom: 0 !important;
            z-index: 1000 !important;
            background: white !important;
            border-top: 1px solid #e5e5e7 !important;
            flex-shrink: 0 !important;
          }
        }
        
        /* Exit button hover effect */
        .chat-interface-container button[aria-label="Exit fullscreen"]:hover {
          background-color: rgba(0, 0, 0, 0.7) !important;
          transform: scale(1.1) !important;
        }
        
        .chat-interface-container button[aria-label="Exit fullscreen"]:active {
          transform: scale(0.95) !important;
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
    minHeight: 0, // Allow flex shrinking
  },
  exitButtonContainer: {
    position: "absolute",
    top: "12px",
    right: "12px",
    zIndex: 10001,
  },
  exitButton: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#ffffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    outline: "none",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  exitIcon: {
    fontSize: "18px",
    color: "#ffffff",
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
