import React, { useRef, useState, useEffect } from "react";
import { Button, Input, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

// 本地图片（请按你的目录调整）
import clearIcon from "../assets/qingchu.png";

/**
 * Props（全部可选）:
 * - prohibit?: boolean                          // 是否禁用交互
 * - onSend?: (payload: string | any[]) => void  // 点击发送
 * - onModelChange?: (model: 'tongyi'|'deepseek') => void
 * - onComplaint?: () => void                    // “File a Complaint”
 * - onClearAll?: () => void                     // 清空消息
 * - uploadFile?: (file: File) => Promise<string> // 文件上传，返回可访问的 URL
 */
export default function InputArea({
  prohibit = false,
  onSend,
  onModelChange,
  onComplaint,
  onClearAll,
  uploadFile,
}) {
  // 是否显示“功能区”而不是图片预览（与原 showImage 逻辑相同：true=显示按钮区；false=只显示图片预览）
  const [showImage, setShowImage] = useState(true);
  const [fileUrl, setFileUrl] = useState(""); // 上传后图片 URL
  const [modelType, setModelType] = useState(0); // 0=Qwen, 1=DeepSeek
  const [inputContent, setInputContent] = useState("");

  // 进入页面重置（等价 onMounted）
  useEffect(() => {
    setModelType(0);
    onModelChange?.("tongyi");
  }, []); // eslint-disable-line

  const modelList = ["Qwen (Image Q&A)", "DeepSeek (R1)"];

  const switchModel = (index) => {
    if (prohibit) return;
    setModelType(index);
    onModelChange?.(index === 0 ? "tongyi" : "deepseek");
  };

  // 校验图片类型（等价 beforeRead）
  const validateImage = (file) => {
    const okTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!okTypes.includes(file.type)) {
      message.warning("Please upload a valid image (jpeg/jpg/png/webp).");
      return false;
    }
    return true;
  };

  // 上传处理（等价 afterRead）
  const handleCustomUpload = async ({ file, onSuccess, onError }) => {
    try {
      if (!validateImage(file))
        return onError?.(new Error("Invalid file type"));
      // 加载提示
      const hide = message.loading("Uploading...", 0);
      try {
        let url = "";
        if (uploadFile) {
          // 使用外部传入的上传函数（推荐）
          url = await uploadFile(file);
        } else {
          // Demo：如果没有提供 uploadFile，就用本地预览 URL 代替
          url = URL.createObjectURL(file);
        }
        setFileUrl(url);
        setShowImage(false);
        onSuccess?.("ok");
      } finally {
        hide();
      }
    } catch (e) {
      message.error("Upload failed");
      onError?.(e);
    }
  };

  // 删除图片（等价 beforeDelete）
  const clearImage = () => {
    setFileUrl("");
    setShowImage(true);
  };

  // 发送
  const sendMessage = () => {
    if (prohibit) return;
    if (!inputContent.trim()) return;

    // 如果带图询问，需要切回 Qwen
    let finalModelType = modelType;
    if (fileUrl) {
      finalModelType = 0;
      setModelType(0);
      onModelChange?.("tongyi");
    }

    const payload = showImage
      ? inputContent
      : [
          { type: "text", text: inputContent },
          { type: "image_url", image_url: { url: fileUrl } },
        ];

    onSend?.(payload);

    // 复位
    clearImage();
    setInputContent("");
  };

  // 一键投诉
  const sendComplaint = () => {
    if (prohibit) return;
    onComplaint?.();
  };

  // 清空消息
  const removeAll = () => {
    if (prohibit) return;
    onClearAll?.();
  };

  return (
    <>
      {/* 样式等价注入（将原 Less 转为普通 CSS） */}
      <style>{cssText}</style>

      <div className="input-container">
        {/* 图片上传后的预览（等价 van-uploader，preview-size=60，禁用状态） */}
        {!showImage && (
          <div className="upload-image">
            <div className="van-uploader__wrapper--disabled">
              <div className="van-uploader__preview">
                <img
                  src={fileUrl}
                  alt="preview"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 6,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 功能按钮区（模型切换 + 图片问答 + 投诉），与 showImage 互斥 */}
        {showImage && (
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

            {/* Image Q&A 上传按钮 */}
            <Upload
              customRequest={handleCustomUpload}
              showUploadList={false}
              disabled={prohibit}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              name="file"
            >
              <Button size="small" type="default" icon={<UploadOutlined />}>
                Image Q&A
              </Button>
            </Upload>
          </div>
        )}

        {/* 底部输入区域 */}
        <div className="input-box-area">
          <img src={clearIcon} alt="clear" onClick={removeAll} />
          <div className="input-content">
            <Input.TextArea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              autoSize={{ minRows: 1, maxRows: 6 }}
              bordered={false}
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
            onClick={sendMessage}
            disabled={prohibit}
          >
            Send
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
.input-container .upload-image {
  margin-left: 15px;
}
/* 复原 Vant 的禁用包装器视觉： */
.input-container .van-uploader__wrapper--disabled {
  opacity: inherit;
}
.input-container .van-uploader__wrapper--disabled .van-uploader__preview {
  background-color: #ffffff;
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
