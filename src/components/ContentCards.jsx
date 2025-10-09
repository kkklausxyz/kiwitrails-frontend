import React from "react";

export default function ContentCards() {
  const cards = [
    {
      id: 1,
      title: "Ready-made trails",
      description: "Explore popular hiking routes in New Zealand.",
      buttonText: "Explore trails",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    },
    {
      id: 2,
      title: "Multi-day journeys",
      description: "Discover multi-day hikes for a longer adventure.",
      buttonText: "See itineraries",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    },
    {
      id: 3,
      title: "South Island",
      description: "Find trails on New Zealand's South Island.",
      buttonText: "View region",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    },
  ];

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
              <button style={styles.button}>{card.buttonText}</button>
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
