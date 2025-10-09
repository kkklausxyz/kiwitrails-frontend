import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";

// 本地图片（请按你的目录调整）
import clearIcon from "../assets/qingchu.png";

const InputArea = forwardRef(
  (
    {
      prohibit = false,
      onSend,
      onStop,
      onModelChange,
      onClearAll,
      isGenerating = false,
    },
    ref
  ) => {
    const [modelType, setModelType] = useState(0); // 0=DeepSeek
    const [inputContent, setInputContent] = useState("");

    // Expose setValue method to parent component
    useImperativeHandle(ref, () => ({
      setValue: (value) => {
        setInputContent(value);
      },
    }));

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
                placeholder="Send a message..."
                style={{
                  backgroundColor: "transparent",
                  padding: 0,
                  // Prevent iOS auto-zoom on focus
                  fontSize: 16,
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
                color: isGenerating ? "#ff4d4f" : "#ffffff",
                fontWeight: isGenerating ? "bold" : "normal",
                backgroundColor: isGenerating ? "#ff4d4f" : "#2d5a2d",
              }}
            >
              {isGenerating ? "✕" : <SendOutlined />}
            </Button>
          </div>
        </div>
      </>
    );
  }
);

InputArea.displayName = "InputArea";

export default InputArea;

/* —— 来自原 <style scoped lang="less"> 的等价样式 —— */
const cssText = `
.input-container {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: #ffffff;
  z-index: 1000;
  border-top: 1px solid #e5e5e7;
  border-radius: 0 0 12px 12px;
}

.input-container .data-query {
  display: flex;
  align-items: center;
  padding: 0 15px;
  background-color: transparent;
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
  padding: 12px 20px 20px 20px;
  border-top: 1px solid #f0f0f0;
  gap: 8px;
}

.input-container .input-box-area img {
  width: 27px;
  height: 27px;
  margin: 0 10px;
  cursor: pointer;
}

.input-container .input-box-area .input-content {
  background-color: #ffffff;
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  padding: 12px 16px;
}

.input-container .input-box-area .send-button {
  border: none;
  font-size: 15px;
  color: #ffffff;
  font-weight: bold;
  background-color: #2d5a2d;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.input-container .input-box-area .send-button:hover {
  background-color: #1e3d1e;
}

.input-container .input-box-area .send-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 1280px) {
  .input-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .input-container .input-box-area {
    padding: 5px 10px 20px 10px;
  }
  
  .input-container .data-query {
    padding: 0 10px;
  }
}
`;
