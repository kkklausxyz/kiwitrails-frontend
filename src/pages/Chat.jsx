import { useEffect, useRef, useState } from "react";
import throttle from "lodash/throttle";
import Layout from "../components/Layout";
import IntroParagraph from "../components/IntroParagraph";
import DefaultQuestion from "../components/DefaultQuestion";
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
    },
  ]);
  const [userScrolled, setUserScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState(null);

  const contentRef = useRef(null);
  const lastScrollTopRef = useRef(0);

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
        const newMessages = [...prevMessages, { role: "user", content: text }];
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
        // API call failed, show error message
        setError(result.error || "Network request failed");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, the service is temporarily unavailable. Please try again later.",
          },
        ]);
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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, the service is temporarily unavailable. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  return (
    <Layout background="linear-gradient(180deg, #EEF2F7 0%, #F7F9FC 100%)">
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
        <>
          <div
            className="content"
            ref={contentRef}
            style={{ padding: "0 15px" }}
          >
            <IntroParagraph />
            <DefaultQuestion onSelect={handleSend} disabled={loading} />
            <ChatMessage messages={messages} />
            {loading && <Loading text="Generating recommendations…" />}
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
            onSend={handleSend}
            onStop={handleStop}
            prohibit={loading}
            isGenerating={isGenerating}
          />
          <div style={{ height: 300 }} />
        </>
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
      `}</style>
    </Layout>
  );
}
