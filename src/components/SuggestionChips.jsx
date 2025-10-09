import React from "react";

export default function SuggestionChips({ onSelect, disabled = false }) {
  const suggestions = [
    "Recommend trails",
    "Plan a route",
    "Check the weather",
    "Gear checklist",
    "Transport options",
  ];

  // Map suggestions to specific questions
  const suggestionQuestions = {
    "Recommend trails":
      "What are the best hiking trails near Queenstown for beginners?",
    "Plan a route": "Help me plan a 3-day itinerary for the South Island",
    "Check the weather":
      "What's the weather like in New Zealand during spring?",
    "Gear checklist":
      "Create a gear checklist for a 2-day alpine hike in spring",
    "Transport options":
      "What are the best transport options for traveling around New Zealand?",
  };

  const handleClick = (suggestion) => {
    if (disabled) return;
    const question = suggestionQuestions[suggestion] || suggestion;
    onSelect?.(question);
  };

  return (
    <div style={styles.container}>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          style={styles.chip}
          onClick={() => handleClick(suggestion)}
          disabled={disabled}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    padding: "0 24px 16px 24px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e9ecef",
    overflowX: "auto",
    whiteSpace: "nowrap",
  },
  chip: {
    backgroundColor: "#ffffff",
    border: "1px solid #d0d0d0",
    borderRadius: "20px",
    padding: "8px 16px",
    fontSize: "12px",
    color: "#333333",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    whiteSpace: "nowrap",
    flexShrink: 0,
    fontWeight: "400",
  },
};
