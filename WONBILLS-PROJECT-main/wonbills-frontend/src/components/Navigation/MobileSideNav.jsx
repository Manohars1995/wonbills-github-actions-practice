import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { WonBillsContext } from "../../store/WonBillsContext";

import { FaUser } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { PiInvoiceLight } from "react-icons/pi";
import { IoWallet } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { RiHome6Line } from "react-icons/ri";
import { MdOutlineLogout } from "react-icons/md";

import ConfirmModal from "../UI-Elements/modals/ConfirmModal";
import { toast } from "sonner";

const tabs = [
  { label: "Dashboard", link: "/Dashboard", icon: <RiHome6Line size={20} /> },
  { label: "Clients", link: "/clients", icon: <FaUser size={18} /> },
  { label: "Items", link: "/items", icon: <AiFillProduct size={19} /> },
  { label: "Invoices", link: "/invoices", icon: <PiInvoiceLight size={20} /> },
  { label: "Purchases", link: "/purchases", icon: <IoWallet size={20} /> },
  { label: "Settings", link: "/settings", icon: <IoIosSettings size={22} /> }
];

const MobileSideNavBurger = () => {
  const { pathname } = useLocation();
  const { activeTab, setActiveTab, logout, businessLogo } =
    useContext(WonBillsContext);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const match = tabs.find(tab =>
      pathname.toLowerCase().startsWith(tab.link.toLowerCase())
    );
    if (match && match.label !== activeTab) {
      setActiveTab(match.label);
    }
  }, [pathname]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    toast.success("Logged out successfully");
    await logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center px-4 pb-2 border-b border-dashed">
          <img
            src={
              businessLogo ??
              "https://res.cloudinary.com/dca9sij3n/image/upload/v1752656168/logo-wonBridge-2_nl8nts.png"
            }
            alt="WonBills"
            className="h-18 object-contain rounded-2xl"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-1 py-2 space-y-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.label;

            return (
              <Link key={tab.label} to={tab.link}>
                <div
                  onClick={() => setActiveTab(tab.label)}
                  className={`
                    flex items-center h-11 rounded-lg
                    ${isActive ? "bg-blue-50" : "hover:bg-gray-100"}
                  `}
                >
                  <div
                    className={`
                      w-12 flex justify-center
                      ${isActive ? "text-blue-600" : "text-gray-500"}
                    `}
                  >
                    {tab.icon}
                  </div>

                  <span
                    className={`
                      text-sm font-medium
                      ${isActive ? "font-semibold text-black" : "text-gray-700"}
                    `}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-dashed p-2">
          <button
            onClick={handleLogoutClick}
            className="flex items-center h-11 w-full rounded-lg bg-red-100 hover:bg-red-200"
          >
            <div className="w-12 flex justify-center text-lg">
              <MdOutlineLogout />
            </div>
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <ConfirmModal
          title="Confirm logout"
          confirmText="Log out"
          cancelText="Cancel"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        >
          Are you sure you want to log out of your account?
        </ConfirmModal>
      )}
    </>
  );
};

export default React.memo(MobileSideNavBurger);
