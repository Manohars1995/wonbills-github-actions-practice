"use client";

import React, { useState, useEffect } from "react";
import { slide as BurgerMenu } from "react-burger-menu";
import { useLocation } from "react-router-dom";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

import MobileSideNavBurger from "../MobileSideNav";
import "./BurgerStyles.css";

export default function BurgerSideNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <BurgerMenu
      right={false}
      width={200}              // IMPORTANT
      isOpen={menuOpen}
      onStateChange={({ isOpen }) => setMenuOpen(isOpen)}
      customBurgerIcon={<HiOutlineMenuAlt2 size={22} />}
      disableAutoFocus
    >
      <MobileSideNavBurger />
    </BurgerMenu>
  );
}
