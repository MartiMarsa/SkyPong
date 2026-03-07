'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../hooks/use-translation";
import { useStyles } from "../hooks/use-styles";
import { useAuth } from "../context/auth-context";
import { Button } from "./base/Button";
import { Avatar } from "./base/Avatar";
import SkypongLogo from "./skypong-logo.js";

const mobileStyles = {
  nav: "navigation-app",
};

const desktopStyles = {
  nav: "navigation-app",
};

export default function NavigationAppUI({
  home,
  userURL,
  compactGuestActions = false,
}) {
  const { t } = useTranslation();
  const { styles } = useStyles(mobileStyles, desktopStyles);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const showGuestActions = !user;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push('/');
  };

  const handleNavigate = (path) => {
    setIsDropdownOpen(false);
    router.push(path);
  };

  return (
    <nav className={styles.nav}>
      {/* Left side: SKYPONG logo (hidden on homepage) */}
      <SkypongLogo />

      {/* Right side: Authentication actions */}
      <div className="nav-actions">
        {showGuestActions ? (
          // Guest users: Login/Sign Up buttons
          <>
            <Button href="/login" variant="secondary" size="md" font="display">
              Login
            </Button>
            <Button href="/signup" variant="primary" size="md" font="display">
              Sign up
            </Button>
          </>
        ) : (
          // Logged in users: Avatar with dropdown menu
          <div className="relative" ref={dropdownRef}>
            <Avatar
              src={user?.avatarUrl}
              fallbackText={user?.nickname || "User"}
              size="md"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <>
                {/* Overlay backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                  onClick={() => setIsDropdownOpen(false)}
                />

                {/* Dropdown menu content */}
                <div className="dropdown-menu-avatar">
                  <Button
                    variant="ghost"
                    size="md"
                    font="body"
                    onClick={() => handleNavigate('/me')}
                  >
                    {t.navigation.profile}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    font="body"
                    onClick={() => handleNavigate('/updateme')}
                  >
                    {t.navigation.settings}
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    font="body"
                    onClick={handleLogout}
                  >
                    {t.navigation.logout}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
