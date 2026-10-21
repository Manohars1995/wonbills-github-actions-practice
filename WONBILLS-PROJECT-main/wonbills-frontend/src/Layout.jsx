import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Navigation/Header";
import SideNav from "./components/Navigation/SideNav";
import BurgerSideNav from "./components/Navigation/Hamburger/HamburgerMenu.jsx";

import "react-international-phone/style.css";

import SlideModal from "./components/UI-Elements/modals/slider-modal.jsx";
import NotifyModal from "./components/UI-Components/Others/Notifications.jsx";
import NotificationsHost from "./components/UI-Components/Others/NotificationsHost.jsx";

const Layout = () => {
  return (
    /* REQUIRED BY react-burger-menu */
    <div id="outer-container" translate="no" className="notranslate h-screen w-full overflow-hidden">
      <div
        id="page-wrap"
        className="
          flex
          h-full
          w-full
          min-h-0
          bg-(--background-default)
          text-(--text-primary)
          p-2
          gap-x-2
          box-border
        "
      >
        {/* Desktop Sidebar */}
        <aside className="hidden md:block bg-white rounded-xl shrink-0">
          <SideNav />
        </aside>

        {/* Mobile Burger Menu */}
        <div className="md:hidden">
          <BurgerSideNav />
        </div>

        {/* MAIN COLUMN */}
        <div className="flex-1 min-w-0 flex flex-col gap-y-2 min-h-0">
          {/* Header */}
          <header className="h-[52px] shrink-0">
            <Header />
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 min-h-0 min-w-0 w-full overflow-hidden rounded-lg">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="h-8 w-8 border-3 border-blue-500 border-b-gray-200 rounded-full animate-spin" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>

        {/* Notifications */}
        <NotificationsHost />
      </div>

      {/* Global Modals */}
      {/* <SlideModal /> */}
      {/* <NotifyModal /> */}
    </div>
  );
};

export default Layout;
