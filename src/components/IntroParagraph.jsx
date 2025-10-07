import React from "react";
import introImg from "../assets/intro-section.png";

export default function IntroParagraph() {
  return (
    <div style={styles.introParagraph}>
      <div style={styles.textContainer}>
        <p style={styles.nameField}>Hi, I'm KiwiTrails</p>
        <p style={styles.introSection}>
          Your personal travel assistant for exploring New Zealand — I can help
          you plan routes, discover must-see destinations, and answer your
          travel questions anytime!
        </p>
      </div>
      <div style={styles.imageContainer}>
        <img src={introImg} alt="Intro section" style={styles.img} />
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
  },
  textContainer: {
    width: "100%",
    marginBottom: "20px",
    textAlign: "center",
  },
  imageContainer: {
    width: "60%",
    display: "flex",
    justifyContent: "center",
  },
  img: {
    width: "60%",
    maxWidth: "300px",
    objectFit: "contain",
  },
  nameField: {
    fontSize: 20,
    color: "#4d7cd6",
    fontFamily: '"NAME"', // keep same font if you have it imported
    fontWeight: 700,
    margin: 0,
  },
  introSection: {
    fontWeight: "normal",
    lineHeight: 2,
    margin: 0,
  },
};
