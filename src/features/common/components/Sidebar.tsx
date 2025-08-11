/// <reference types="react/jsx-runtime" />
import React from "react";
import { NavLink } from 'react-router-dom';
import type React from 'react';

import { useAuthStore } from '../../auth/store/authStore';
import { Link, NavLink } from 'react-router-dom';

/**
 * Sidebar navigation component for the main application layout
 */
const Sidebar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <aside className="w-64 bg-white shadow-sm hidden md:block">
      <div className="p-4">
        <nav className="space-y-1">
          {/* Main navigation links */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isActive
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
            end
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </NavLink>

          <NavLink
            to="/trending"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isActive
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Trending
          </NavLink>

          <NavLink
            to="/shorts"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isActive
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.293 5.293L16.707 2.707C16.316 2.316 15.684 2.316 15.293 2.707L12.707 5.293C12.316 5.684 12.316 6.316 12.707 6.707C13.098 7.098 13.73 7.098 14.121 6.707L15 5.828V13C15 13.552 14.552 14 14 14H10C9.448 14 9 13.552 9 13V5.828L9.879 6.707C10.27 7.098 10.902 7.098 11.293 6.707C11.684 6.316 11.684 5.684 11.293 5.293L8.707 2.707C8.316 2.316 7.684 2.316 7.293 2.707L4.707 5.293C4.316 5.684 4.316 6.316 4.707 6.707C5.098 7.098 5.73 7.098 6.121 6.707L7 5.828V13C7 14.657 8.343 16 10 16H14C15.657 16 17 14.657 17 13V5.828L17.879 6.707C18.27 7.098 18.902 7.098 19.293 6.707C19.684 6.316 19.684 5.684 19.293 5.293Z" />
            </svg>
            Shorts
          </NavLink>

          {/* Authenticated user links */}
          {isAuthenticated && (
            <>
              <NavLink
                to="/subscriptions"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Subscriptions
              </NavLink>

              <div className="pt-5 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Your Library
                </h3>
              </div>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </NavLink>

              <NavLink
                to="/watch-later"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Later
              </NavLink>

              <NavLink
                to="/liked-videos"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Liked Videos
              </NavLink>

              <NavLink
                to="/playlists"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Playlists
              </NavLink>

              <div className="pt-5 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Create
                </h3>
              </div>

              <NavLink
                to="/studio"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                YouTube Studio
              </NavLink>

              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Video
              </NavLink>

              <NavLink
                to="/go-live"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-red-700 bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Go Live
              </NavLink>
            </>
          )}

          {/* Show login link for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-6 px-4 py-2">
              <p className="text-sm text-gray-600 mb-2">
                Sign in to like videos, comment, and subscribe.
              </p>
              <NavLink
                to="/login"
                className="flex items-center justify-center px-4 py-2 border border-blue-600 rounded-full text-blue-600 text-sm font-medium hover:bg-blue-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sign in
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;


declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
