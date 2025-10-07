import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";

// 本地图片（请按你的目录调整）
import clearIcon from "../assets/qingchu.png";

export default function InputArea({
  prohibit = false,
  onSend,
  onStop,
  onModelChange,
  onClearAll,
  isGenerating = false,
}) {
  const [modelType, setModelType] = useState(0); // 0=DeepSeek
  const [inputContent, setInputContent] = useState("");

  // 进入页面重置（等价 onMounted）
  useEffect(() => {
    setModelType(0);
    onModelChange?.("deepseek");
  }, []); // eslint-disable-line

  const modelList = ["DeepSeek (R1)"];

  const switchModel = (index) => {
    if (prohibit) return;
    setModelType(index);
    onModelChange?.("deepseek");
  };

  // 发送
  const sendMessage = () => {
    if (prohibit) return;
    if (!inputContent.trim()) return;

    onSend?.(inputContent);
    setInputContent("");
  };

  // 清空输入框
  const clearInput = () => {
    if (prohibit) return;
    setInputContent("");
  };

  return (
    <>
      {/* 样式等价注入（将原 Less 转为普通 CSS） */}
      <style>{cssText}</style>

      <div className="input-container">
        {/* 功能按钮区 */}
        <div className="data-query">
          {modelList.map((item, index) => (
            <Button
              key={item}
              size="small"
              type={modelType === index ? "primary" : "default"}
              disabled={prohibit}
              onClick={() => switchModel(index)}
              style={{ marginLeft: 15, marginBottom: 5 }}
            >
              {item}
            </Button>
          ))}
        </div>

        {/* 底部输入区域 */}
        <div className="input-box-area">
          <img src={clearIcon} alt="clear" onClick={clearInput} />
          <div className="input-content">
            <Input.TextArea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              autoSize={{ minRows: 1, maxRows: 6 }}
              variant="borderless"
              placeholder="Type your question here…"
              style={{
                backgroundColor: "transparent",
                padding: 0,
              }}
            />
          </div>
          <Button
            className="send-button"
            size="small"
            type="text"
            onClick={isGenerating ? onStop : sendMessage}
            disabled={prohibit && !isGenerating}
            style={{
              color: isGenerating ? "#ff4d4f" : "#1890ff",
              fontWeight: isGenerating ? "bold" : "normal",
            }}
          >
            {isGenerating ? "Stop" : "Send"}
          </Button>
        </div>
      </div>
    </>
  );
}

/* —— 来自原 <style scoped lang="less"> 的等价样式 —— */
const cssText = `
.input-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}
.input-container .data-query {
  display: flex;
  align-items: center;
}
.input-container .data-query .ant-btn {
  margin-left: 15px;
  margin-bottom: 5px;
  opacity: 1;
}
.input-container .input-box-area {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  padding-top: 5px;
}
.input-container .input-box-area img {
  width: 27px;
  height: 27px;
  margin: 0 10px;
  cursor: pointer;
}
.input-container .input-box-area .input-content {
  background-color: #f8f9fd;
  flex: 1;
  border-radius: 10px;
  padding: 6px;
}
.input-container .input-box-area .send-button {
  border: none;
  font-size: 15px;
  color: #3a71e8;
  font-weight: bold;
  margin: 0 5px;
}
`;
