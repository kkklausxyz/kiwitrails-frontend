import React from "react";
import { Avatar } from "antd";
import { RobotOutlined } from "@ant-design/icons";

export default function ChatHeader() {
  return (
    <div style={styles.container}>
      <div style={styles.headerBanner}>
        <span style={styles.waveEmoji}>👋</span>
        <span style={styles.headerText}>Hi, I'm your KiwiTrails guide.</span>
      </div>
      <h1 style={styles.mainPrompt}>
        How can I help you plan your next adventure?
      </h1>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#ffffff",
  },
  headerBanner: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "20px",
  },
  waveEmoji: {
    fontSize: "20px",
    marginRight: "8px",
  },
  headerText: {
    fontSize: "16px",
    color: "#2d5a2d",
    fontWeight: "500",
  },
  mainPrompt: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: "0",
    lineHeight: "1.3",
  },
};
