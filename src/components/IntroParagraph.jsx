import React from "react";
import introImg from "../assets/intro-section.png";
import backgroundImg from "../assets/background.JPG";

export default function IntroParagraph() {
  return (
    <div style={styles.introParagraph}>
      <div style={styles.textContainer}>
        <p style={styles.nameField}>Hi, I'm KiwiTrails</p>
        <p style={styles.introSection}>
          Your personal travel assistant for exploring New Zealand. I can help
          you plan routes, discover must-see destinations, and answer your
          travel questions anytime!
        </p>
      </div>
      <div style={styles.imageContainer}>
        {/* Background image space - no separate image needed */}
      </div>
    </div>
  );
}

const styles = {
  introParagraph: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 0",
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
  },
  textContainer: {
    width: "100%",
    marginBottom: "20px",
    textAlign: "center",
    padding: "20px 20px 0 20px",
  },
  imageContainer: {
    width: "60%",
    height: "300px",
    display: "flex",
    justifyContent: "center",
  },
  nameField: {
    fontSize: 20,
    color: "#ffffff",
    fontFamily: '"NAME"', // keep same font if you have it imported
    fontWeight: 700,
    margin: 0,
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
  },
  introSection: {
    fontWeight: "normal",
    lineHeight: 2,
    margin: 0,
    color: "#ffffff",
    textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
  },
};
