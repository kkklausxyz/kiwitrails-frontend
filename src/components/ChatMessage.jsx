import React from "react";
import { marked } from "marked";

// ⬇️ 若你已有这几个 React 组件，请按你的实际路径调整
import Loading from "./Loading";
// import QueryTrainTickets from "../toolComponents/QueryTrainTickets";
// import Weather from "../toolComponents/Weather";
// import SearchGoods from "../toolComponents/SearchGoods";

/**
 * Props:
 * - messages: Array<{
 *     role: 'user' | 'assistant',
 *     content: string | Array<any>,              // 当为 array 时: [TextContent, ImageContent]
 *     modelType?: 'tongyi' | 'deepseek',
 *     progress?: boolean,                        // 加载中
 *     deepSeekContent?: string,                  // deepseek 的第二段内容
 *     functionName?: 'trainTickets' | 'getWeather' | string,
 *     toolData?: any,
 *     searchGoodsData?: any[]
 *   }>
 *
 * 约定的 content 结构（与原 Vue 相同）：
 * - 如果是数组：content[0].text （文本）， content[1].image_url.url（图片）
 */
export default function ChatMessage({ messages = [] }) {
  return (
    <>
      {/* 注入与原组件等价的样式（类名保持一致） */}
      <style>{cssText}</style>

      {messages.map((item, index) => {
        const isUser = item.role === "user";
        const isAssistant = item.role === "assistant";
        const isArrayContent = Array.isArray(item.content);

        return (
          <div className="chat-message" key={index}>
            {/* 用户文本 */}
            {isUser && (
              <div className="user-message">
                <div className="message-bubble user-bubble">
                  {isArrayContent ? (
                    <p>{item?.content?.[0]?.text || ""}</p>
                  ) : (
                    <p>{item?.content || ""}</p>
                  )}
                </div>
                <div className="message-time">
                  {item.timestamp ||
                    new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                </div>
              </div>
            )}

            {/* 用户发送图片 */}
            {isUser && isArrayContent && (
              <div className="send-image">
                <div
                  className="van-image"
                  style={{ alignSelf: "flex-end", marginTop: 4 }}
                >
                  <img
                    src={item?.content?.[1]?.image_url?.url || ""}
                    alt=""
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 5,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            )}

            {/* 大模型回复 */}
            {isAssistant && (
              <div className="ai-message">
                <div className="message-bubble ai-bubble">
                  {/* 思考中状态 */}
                  {item.thinking && !item.content && (
                    <div className="thinking-text">KiwiTrails is thinking…</div>
                  )}

                  {/* 错误状态 */}
                  {item.error && item.content && (
                    <div className="error-text">{item.content}</div>
                  )}

                  {/* 通用AI回复显示 */}
                  {!item.thinking && !item.error && item.content && (
                    <div className="mark-text">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: marked(item.content || "", {
                            breaks: true, // 启用换行符支持
                            gfm: true, // 启用GitHub风格Markdown
                          }),
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="message-time">
                  {item.timestamp ||
                    new Date().toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* —— 等价样式（把原来的 <style scoped lang="less"> 转成普通 CSS 文本） —— */
const cssText = `
.chat-message {
  display: flex;
  flex-direction: column;
}
.chat-message .user-message {
  margin-top: 15px;
  max-width: 70%;
  align-self: flex-end;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.2s ease-in-out forwards;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.chat-message .user-message .message-bubble {
  background-color: #f0f0f0;
  border-radius: 18px;
  padding: 12px 16px;
  margin-bottom: 4px;
  max-width: 100%;
}
.chat-message .user-message .user-bubble {
  background-color: #f0f0f0;
}
.chat-message .user-message p {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin: 0;
}
.chat-message .user-message .message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.chat-message .send-image {
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.2s ease-in-out forwards;
}
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.chat-message .ai-message {
  margin-top: 15px;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.chat-message .ai-message .message-bubble {
  background-color: #e8f5e8;
  border-radius: 18px;
  padding: 12px 16px;
  margin-bottom: 4px;
  max-width: 100%;
}
.chat-message .ai-message .ai-bubble {
  background-color: #e8f5e8;
}
.chat-message .ai-message .mark-text {
  font-size: 16px;
  line-height: 1.2;
  color: #333;
  white-space: pre-wrap; /* 保持换行和空格 */
}
.chat-message .ai-message .thinking-text {
  font-size: 14px;
  color: #999;
  font-style: italic;
}
.chat-message .ai-message .error-text {
  font-size: 14px;
  color: #d32f2f;
  font-weight: 500;
}
.chat-message .ai-message .message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* Markdown样式 */
.chat-message .ai-message .mark-text h1,
.chat-message .ai-message .mark-text h2,
.chat-message .ai-message .mark-text h3,
.chat-message .ai-message .mark-text h4,
.chat-message .ai-message .mark-text h5,
.chat-message .ai-message .mark-text h6 {
  margin: 4px 0 2px 0;
  font-weight: bold;
}

.chat-message .ai-message .mark-text p {
  margin: 2px 0;
}

.chat-message .ai-message .mark-text ul,
.chat-message .ai-message .mark-text ol {
  margin: 2px 0;
  padding-left: 20px;
}

.chat-message .ai-message .mark-text li {
  margin: 1px 0;
}

.chat-message .ai-message .mark-text strong {
  font-weight: bold;
}

.chat-message .ai-message .mark-text em {
  font-style: italic;
}


.chat-message .ai-message .mark-text .deepseek-reasoning {
  background-color: #f2f4f9;
  padding: 8px;
  margin: 2px 0;
  border-radius: 10px;
  font-size: 14px;
}
.chat-message .ai-message .mark-text .deepseek-reasoning p {
  font-size: 14px !important;
  color: #343761;
  margin: 0 0 2px 0;
}
`;
