import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const { pathname } = useLocation();

  return (
    <header
      className="
        sticky top-0 z-50
        h-auto sm:h-[9vh]
        flex flex-col sm:flex-row
        items-center justify-between
        gap-3
        px-4 sm:px-6
        py-2
        bg-blue-50
        border-b border-blue-200
      "
    >
      {/* Logo */}
      <Link to="/">
        <img
          src="https://wonbillsnew.s3.ap-south-1.amazonaws.com/Untitled+design.png"
          alt="WON Logo"
          className="h-12 sm:h-15 w-auto object-contain"
        />
      </Link>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Link
          to="/"
          className="
            px-5 py-2 rounded-xl
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white font-bold
            shadow-lg shadow-indigo-500/40
            hover:from-indigo-700 hover:to-purple-700
            transition-all
          "
        >
          Home
        </Link>

        <Link
          to="/signup"
          className="
            px-4 py-1.5 rounded-xl
            bg-blue-600 text-white font-semibold
            hover:bg-blue-700 transition
          "
        >
          Register
        </Link>

        <Link
          to="/signin"
          className="
            px-4 py-1.5 rounded-xl
            border border-blue-600 text-blue-600 font-semibold
            hover:bg-blue-100 transition
          "
        >
          Sign In
        </Link>
      </div>
    </header>
  );
};


export default Header;
