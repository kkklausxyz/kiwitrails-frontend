import React from "react";
import introImg from "../assets/intro-section.png";

export default function IntroParagraph() {
  return (
    <div style={styles.introParagraph}>
      <div>
        <p style={styles.nameField}>Hi, I’m KiwiTrails</p>
        <p style={styles.introSection}>
          Your personal travel assistant for exploring New Zealand — I can help
          you plan routes, discover must-see destinations, and answer your
          travel questions anytime!
        </p>
      </div>
      <div>
        <img src={introImg} alt="Intro section" style={styles.img} />
      </div>
    </div>
  );
}

const styles = {
  introParagraph: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    padding: "30px 0",
  },
  img: {
    width: "100%",
    objectFit: "fill",
  },
  nameField: {
    fontSize: 20,
    color: "#4d7cd6",
    fontFamily: '"NAME"', // keep same font if you have it imported
    margin: 0,
  },
  introSection: {
    fontWeight: "bold",
    lineHeight: 2,
    margin: 0,
  },
};
