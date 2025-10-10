import React from "react";
import southIslandImage from "../assets/south_island.JPG";
import northIslandImage from "../assets/north_island.jpg";
import aucklandImage from "../assets/auckland.jpg";

export default function ContentCards({ onQuestionSelect }) {
  const cards = [
    {
      id: 1,
      title: "New Zealand North Island",
      description:
        "Discover Auckland, Rotorua, Wellington and the North Island's volcanic landscapes, Maori culture, and stunning coastlines.",
      buttonText: "Explore North Island",
      image: northIslandImage,
      question:
        "What are the must-see attractions and activities on New Zealand's North Island?",
    },
    {
      id: 2,
      title: "New Zealand South Island",
      description:
        "Experience Queenstown, Fiordland, Southern Alps and the South Island's dramatic mountains, lakes, and adventure activities.",
      buttonText: "Explore South Island",
      image: southIslandImage,
      question:
        "What are the best hiking trails and scenic spots on New Zealand's South Island?",
    },
    {
      id: 3,
      title: "Travel Tips for New Zealand",
      description:
        "Essential travel information including visa requirements, weather, transportation, and cultural etiquette for visiting New Zealand.",
      buttonText: "Get Travel Tips",
      image: aucklandImage,
      question:
        "What are the essential travel tips and things to know before visiting New Zealand?",
    },
  ];

  const handleButtonClick = (question) => {
    if (onQuestionSelect) {
      onQuestionSelect(question);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        {cards.map((card) => (
          <div key={card.id} style={styles.card}>
            <div style={styles.imageContainer}>
              <img src={card.image} alt={card.title} style={styles.image} />
            </div>
            <div style={styles.content}>
              <h3 style={styles.title}>{card.title}</h3>
              <p style={styles.description}>{card.description}</p>
              <button
                style={styles.button}
                onClick={() => handleButtonClick(card.question)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f0f0f0";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                {card.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    height: "100%",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
    border: "1px solid #f0f0f0",
  },
  imageContainer: {
    width: "100%",
    height: "150px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  content: {
    padding: "16px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 8px 0",
  },
  description: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 12px 0",
    lineHeight: "1.4",
  },
  button: {
    backgroundColor: "#f5f5f5",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "14px",
    color: "#333",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    fontWeight: "500",
  },
};
