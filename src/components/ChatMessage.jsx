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
                {isArrayContent ? (
                  <p>{item?.content?.[0]?.text || ""}</p>
                ) : (
                  <p>{item?.content || ""}</p>
                )}
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
                {/* 通用AI回复显示 */}
                {!item.progress && (
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

                {/* 加载中 */}
                {item.progress && (
                  <div className="mark-text">
                    <Loading text="Generating recommendations…" />
                  </div>
                )}
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
}
.chat-message .user-message p {
  font-size: 16px;
  line-height: 1.5;
  background-color: #3a71e8;
  border-bottom-left-radius: 10px;
  border-top-left-radius: 10px;
  border-bottom-right-radius: 10px;
  color: #ffffff;
  padding: 5px;
  margin: 0;
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
}
.chat-message .ai-message .mark-text {
  font-size: 16px;
  line-height: 1.6;
  background-color: #ffffff;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  color: #333;
  padding: 12px;
  white-space: pre-wrap; /* 保持换行和空格 */
}

/* Markdown样式 */
.chat-message .ai-message .mark-text h1,
.chat-message .ai-message .mark-text h2,
.chat-message .ai-message .mark-text h3,
.chat-message .ai-message .mark-text h4,
.chat-message .ai-message .mark-text h5,
.chat-message .ai-message .mark-text h6 {
  margin: 12px 0 8px 0;
  font-weight: bold;
}

.chat-message .ai-message .mark-text p {
  margin: 8px 0;
}

.chat-message .ai-message .mark-text ul,
.chat-message .ai-message .mark-text ol {
  margin: 8px 0;
  padding-left: 20px;
}

.chat-message .ai-message .mark-text li {
  margin: 4px 0;
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
  margin: 8px 0;
  border-radius: 10px;
  font-size: 14px;
}
.chat-message .ai-message .mark-text .deepseek-reasoning p {
  font-size: 14px !important;
  color: #343761;
  margin: 0 0 8px 0;
}
`;
