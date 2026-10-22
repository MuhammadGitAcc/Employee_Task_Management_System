import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Button from "~/components/ui/Button";
import { useAuth } from "~/features/auth/useAuth";
import NotificationBell from "~/features/notifications/NotificationBell";
import { env } from "~/utils/env";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/employees", label: "Employees" },
  { to: "/chat", label: "Chat" },
  { to: "/profile", label: "Profile" },
];

const desktopLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-md px-2 py-1 text-sm font-medium ${
    isActive
      ? "text-primary-700 dark:text-primary-300"
      : "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `block rounded-md px-3 py-2 text-base font-medium ${
    isActive
      ? "bg-primary-50 text-primary-700 dark:bg-gray-700 dark:text-primary-300"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
  }`;

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-30 bg-white shadow-md dark:bg-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex min-w-0 items-center">
            <Link
              to="/"
              className="truncate text-xl font-bold text-gray-800 dark:text-gray-100"
            >
              {env.appName}
            </Link>
          </div>
          <div className="flex shrink-0 items-center space-x-4">
            <div className="hidden items-center space-x-4 md:flex">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={desktopLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <ThemeToggle />
            {user && <NotificationBell key={user.id} />}
            {user && (
              <div className="hidden items-center space-x-4 md:flex">
                <span className="hidden text-sm text-gray-500 lg:inline dark:text-gray-400">
                  {user.name}
                </span>
                <Button variant="secondary" onClick={logout}>
                  Log out
                </Button>
              </div>
            )}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="rounded-md p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:text-white md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-gray-200 dark:border-gray-700 md:hidden"
        >
          <div className="space-y-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          {user && (
            <div className="border-t border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-700">
              <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                {user.name}
              </p>
              <Button variant="secondary" onClick={logout} className="w-full">
                Log out
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
