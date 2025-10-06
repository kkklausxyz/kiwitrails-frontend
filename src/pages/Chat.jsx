import { useEffect, useRef, useState } from "react";
import throttle from "lodash/throttle";
import IntroParagraph from "../components/IntroParagraph";
import DefaultQuestion from "../components/DefaultQuestion";
import ChatMessage from "../components/ChatMessage";
import InputArea from "../components/InputArea";
import Loading from "../components/Loading";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Kia ora! I’m your New Zealand travel guide. Tell me your dates, budget, transport, and interests, and I’ll plan a route.",
    },
  ]);
  const [userScrolled, setUserScrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  const contentRef = useRef(null);
  const lastScrollTopRef = useRef(0);

  // auto-scroll to bottom when messages change (unless user scrolled up)
  useEffect(() => {
    if (userScrolled) return;
    const contentEl = contentRef.current;
    if (!contentEl) return;
    window.scrollTo({ top: contentEl.scrollHeight, behavior: "smooth" });
  }, [messages, userScrolled]);

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
    setMessages((prev) => [...prev, { role: "user", text }]);
    setUserScrolled(false);
    setLoading(true);
    try {
      // const res = await chatRecommend(text);
      // setMessages((prev) => [...prev, { role: "ai", text: res.reply }]);

      // demo reply
      await new Promise((r) => setTimeout(r, 600));
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Here’s a sample NZ itinerary suggestion. Connect your backend later for real recommendations.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="content" ref={contentRef} style={{ padding: "0 15px" }}>
        <IntroParagraph />
        <DefaultQuestion onAsk={handleSend} />
        <ChatMessage messages={messages} />
        {loading && <Loading text="Generating recommendations…" />}
      </div>

      <InputArea onSend={handleSend} loading={loading} />
      <div style={{ height: 300 }} />
    </>
  );
}
