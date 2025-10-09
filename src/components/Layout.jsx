import React from "react";
import Navbar from "./Navbar";

/**
 * Layout Component
 * Provides a centered container with max-width constraint
 *
 * Props:
 * - children: React nodes to be rendered inside the layout
 * - maxWidth?: string - Maximum width of the container (default: "1200px")
 */
export default function Layout({
  children,
  maxWidth = "1160px",
  background,
  showNavbar = true,
}) {
  return (
    <>
      <style>{styles}</style>
      <div
        className="app-layout"
        style={{
          background:
            background || "linear-gradient(180deg, #EEF2F7 0%, #F7F9FC 100%)",
        }}
      >
        {showNavbar && <Navbar />}
        <div className="app-container" style={{ maxWidth }}>
          {children}
        </div>
      </div>
    </>
  );
}

const styles = `
.app-layout {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  background-color: transparent;
  position: relative;
  flex: 1;
}

/* Responsive adjustments */
@media (max-width: 1280px) {
  .app-container {
    max-width: 100%;
    box-shadow: none;
  }
}

@media (max-width: 768px) {
  .app-layout {
    background-color: #ffffff;
  }
}
`;
