import React, { useMemo, useState } from "react";

// ⬇️ 根据你的目录调整路径（示例为 src/assets/...）
import kefuImg from "../assets/kefu.png";
import questionIcon from "../assets/wenti.png";
import shuffleIcon from "../assets/huanyihuan.png";

/**
 * Props:
 * - onSelect?: (text: string) => void   // 点击问题时回调
 * - disabled?: boolean                  // 禁用点击
 */
export default function DefaultQuestion({ onSelect, disabled = false }) {
  // 默认问题（与项目相关的英文）
  const customerServiceList = useMemo(
    () => [
      "Can I visit Milford Sound on a one-day trip from Queenstown?",
      "What are the best night markets in Auckland's city center?",
      "Is it possible to take a boat on Lake Tekapo?",
      "Plan a 3-day family-friendly trip in Queenstown, please.",
      "What should I do if a tour guide behaves unprofessionally in NZ?",
      "How do I get to Aoraki / Mount Cook without a car?",
      "Which must-see spots are inside the Hobbiton™ Movie Set?",
      "Which Māori cultural experiences are worth it in Rotorua?",
      "Where can I try an authentic hangi or seafood in NZ?",
      "Which small towns near Christchurch are good for a day trip?",
      "Which famous NZ tea brands or local specialties should I buy?",
      "How can I experience local customs and festivals in NZ?",
      "What are the can’t-miss activities in Fiordland National Park?",
      "Beginner-friendly hiking trails around Wellington?",
      "Where are the best spots for wedding/engagement photos in NZ?",
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  // 取当前显示的 5 条
  const displayedList = useMemo(
    () => customerServiceList.slice(currentIndex, currentIndex + 5),
    [customerServiceList, currentIndex]
  );

  // “换一换”：每次向后移动 5 条，到结尾后从头开始
  const switchMode = () => {
    const next = currentIndex + 5;
    setCurrentIndex(next >= customerServiceList.length ? 0 : next);
  };

  const selectSend = (val) => {
    if (disabled) return;
    onSelect?.(val);
  };

  return (
    <>
      {/* 顶部客服信息 */}
      <div className="support-agent" style={styles.supportAgent}>
        <img src={kefuImg} alt="agent" style={styles.agentImg} />
        <p style={styles.agentName}>KiwiTrails</p>
      </div>

      {/* 默认问题列表 */}
      <div className="customer-service" style={styles.customerService}>
        <span className="tips" style={styles.tips}>
          You can ask me:
        </span>

        {displayedList.map((item, index) => (
          <div
            key={index}
            className="customer-service-list"
            style={styles.customerServiceItem}
            onClick={() => selectSend(item)}
          >
            <img src={questionIcon} alt="prompt" style={styles.questionIcon} />
            <p style={styles.itemText}>{item}</p>
          </div>
        ))}
      </div>

      {/* 换一换 */}
      <div
        className="change-section"
        style={styles.changeSection}
        onClick={switchMode}
      >
        <img src={shuffleIcon} alt="shuffle" style={styles.shuffleIcon} />
        <p style={styles.changeText}>Shuffle</p>
      </div>
    </>
  );
}

/* —— 等价的样式（将原 LESS 转为内联样式） —— */
const styles = {
  supportAgent: {
    display: "flex",
    alignItems: "center",
  },
  agentImg: {
    objectFit: "cover",
    width: 35,
    height: 35,
    marginRight: 8,
  },
  agentName: {
    fontSize: 14,
    margin: 0,
  },

  customerService: {
    backgroundColor: "#ffffff",
    margin: "10px 0",
    padding: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  tips: {
    fontSize: 16,
  },
  customerServiceItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f2f4ff",
    borderRadius: 40,
    marginTop: 10,
    padding: "5px 7px",
    cursor: "pointer",
  },
  questionIcon: {
    width: 25,
    height: 25,
    objectFit: "cover",
  },
  itemText: {
    fontSize: 14,
    paddingLeft: 4,
    margin: 0,
  },

  changeSection: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#a8abb0",
    borderRadius: 40,
    padding: "4px 7px",
    cursor: "pointer",
  },
  shuffleIcon: {
    width: 20,
    height: 20,
  },
  changeText: {
    fontSize: 14,
    paddingLeft: 7,
    color: "#ffffff",
    margin: 0,
  },
};
