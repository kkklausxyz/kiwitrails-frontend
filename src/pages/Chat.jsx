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
      <div className="content" ref={contentRef} style={{ padding: "0 15px" }}>
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
    </Layout>
  );
}
