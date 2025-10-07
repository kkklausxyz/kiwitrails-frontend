import React from "react";

/**
 * Layout Component
 * Provides a centered container with max-width constraint
 *
 * Props:
 * - children: React nodes to be rendered inside the layout
 * - maxWidth?: string - Maximum width of the container (default: "1200px")
 */
export default function Layout({ children, maxWidth = "1200px", background }) {
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
  justify-content: center;
}

.app-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color:rgb(171, 219, 243);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  position: relative;
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
