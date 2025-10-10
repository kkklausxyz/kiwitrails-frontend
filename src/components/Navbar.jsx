import React, { useState } from "react";
import {
  HomeOutlined,
  EnvironmentOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const menuItems = [
    // "Explore Trails",
    // "Destinations",
    // "Blog",
    // "About",
    // "Contact",
    // "Back to Home",
  ];

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      // Start closing animation
      setIsClosing(true);
      setTimeout(() => {
        setIsMobileMenuOpen(false);
        setIsClosing(false);
      }, 300); // Match animation duration
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <>
      <style>{responsiveStyles}</style>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          {/* Logo Section */}
          <div style={styles.logoSection}>
            <EnvironmentOutlined style={styles.logoIcon} />
            <span style={styles.logoText}>KiwiTrails</span>
          </div>

          {/* Desktop Menu Items */}
          <div className="desktop-menu" style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <a key={index} href="#" style={styles.menuItem}>
                {item}
              </a>
            ))}
          </div>

          {/* Mobile Hamburger Menu */}
          {/* <div className="mobile-menu-toggle" style={styles.mobileMenuToggle}>
            {isMobileMenuOpen ? (
              <CloseOutlined
                className="hamburger-close"
                style={styles.hamburgerIcon}
                onClick={toggleMobileMenu}
              />
            ) : (
              <MenuOutlined
                className="hamburger-normal"
                style={styles.hamburgerIcon}
                onClick={toggleMobileMenu}
              />
            )}
          </div> */}
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            className={`mobile-menu ${isClosing ? "closing" : ""}`}
            style={styles.mobileMenu}
          >
            {menuItems.map((item, index) => (
              <a
                key={index}
                href="#"
                style={styles.mobileMenuItem}
                onClick={closeMobileMenu}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}

const styles = {
  navbar: {
    backgroundColor: "#2d5a2d",
    padding: "0 20px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "0 20px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logoIcon: {
    color: "#ffffff",
    fontSize: "20px",
  },
  logoText: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "bold",
  },
  menuSection: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
  },
  menuItem: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "color 0.2s ease",
    cursor: "pointer",
  },
  mobileMenuToggle: {
    display: "none",
  },
  hamburgerIcon: {
    color: "#ffffff",
    fontSize: "20px",
    cursor: "pointer",
  },
  mobileMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#2d5a2d",
    borderTop: "1px solid #3a6a3a",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
  },
  mobileMenuItem: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    padding: "12px 20px",
    borderBottom: "1px solid #3a6a3a",
    transition: "background-color 0.2s ease",
    cursor: "pointer",
  },
};

const responsiveStyles = `
  @media (max-width: 768px) {
    .desktop-menu {
      display: none !important;
    }
    
    .mobile-menu-toggle {
      display: block !important;
    }
    
    .mobile-menu {
      display: flex !important;
    }
  }
  
  @media (min-width: 769px) {
    .desktop-menu {
      display: flex !important;
    }
    
    .mobile-menu-toggle {
      display: none !important;
    }
    
    .mobile-menu {
      display: none !important;
    }
  }
  
  /* macOS-style animations */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }
  
  /* Mobile menu animations */
  .mobile-menu {
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .mobile-menu.closing {
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Icon animations */
  .hamburger-normal {
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hamburger-close {
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* macOS-style menu item hover effects */
  .mobile-menu a:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transition: background-color 0.2s ease;
  }
`;
