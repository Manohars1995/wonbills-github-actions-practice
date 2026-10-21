import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { WonBillsContext } from "../../store/WonBillsContext";

// ICONS
import { FaUser } from "react-icons/fa";
import { AiFillProduct } from "react-icons/ai";
import { PiInvoiceLight } from "react-icons/pi";
import { IoWallet } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";
import { RiHome6Line } from "react-icons/ri";
import { MdOutlineLogout } from "react-icons/md";

import { SidebarToggleIcon } from "../UI-Elements/Custom-svgs/MyCustomSvgs";
import ConfirmModal from "../UI-Elements/modals/ConfirmModal";
import { toast } from "sonner";




const SideNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { isNavExpanded, activeTab, setNavExpanded, setActiveTab, logout, businessLogo } =
    useContext(WonBillsContext);

  const TabOptions = [
    { label: "Dashboard", link: "/Dashboard", icon: <RiHome6Line size={20} /> },
    { label: "Clients", link: "/clients", icon: <FaUser size={18} /> },
    { label: "Items", link: "/items", icon: <AiFillProduct size={19} /> },
    { label: "Invoices", link: "/invoices", icon: <PiInvoiceLight size={20} /> },
    { label: "Purchases", link: "/purchases", icon: <IoWallet size={20} /> },
    { label: "Settings", link: "/settings", icon: <IoIosSettings size={22} /> }
  ];

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const currentPath = pathname.toLowerCase();

    const match = TabOptions.find(tab =>
      currentPath.startsWith(tab.link.toLowerCase())
    );

    if (match && match.label !== activeTab) {
      setActiveTab(match.label);
    }
  }, [pathname]);


  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirm = async () => {
    setShowLogoutConfirm(false);
    toast.success("Logged out successfully");
    await logout();
  };

  const handleCancel = () => {
    setShowLogoutConfirm(false);
  };



  return (
    <aside
      className={`
        h-full bg-white border-2 border-gray-200 rounded-2xl flex flex-col p-0.5
        transition-all duration-300 ease-in-out
        ${isNavExpanded ? "w-56" : "w-16"}
        overflow-hidden shadow-md
      `}
    >
      {/* Toggle */}

      <div className="h-12 flex items-center relative">
        {/* Icon Rail (same as nav items) */}
        <div className="w-16 flex items-center justify-center">
          <button
            onClick={() => {
              if (!isNavExpanded) {
                setNavExpanded(true);
              } else {
                navigate("/Dashboard");
              }
            }}
            className="relative flex items-center justify-center group"
          >
            {/* Logo */}
           <div className="h-9 w-9 flex items-center justify-center hover:bg-blue-50 rounded-lg">
  <img
    src={
      businessLogo
        ? businessLogo
        : "https://res.cloudinary.com/dca9sij3n/image/upload/v1752656168/logo-wonBridge-2_nl8nts.png"
    }
    alt="WonBills Logo"
    className="h-8 w-8 object-contain block"
  />
</div>


            {/* Expand Icon (ONLY when collapsed & hover) */}
            {!isNavExpanded && (
              <span
                className="
            absolute inset-0 flex items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            bg-gray-50 rounded-lg cursor-e-resize h-9 w-9
          "
              >
                <SidebarToggleIcon />
              </span>
            )}
          </button>
        </div>

        {/* Toggle (ONLY when expanded) */}
        {isNavExpanded && (
          <button
            onClick={() => setNavExpanded(false)}
            className="absolute right-2 h-9 w-9 flex items-center justify-center
                 text-xl text-gray-700 cursor-e-resize
                 hover:bg-gray-200 rounded-lg p-1 transition "
          >
            <SidebarToggleIcon />
          </button>
        )}
      </div>



      {/* NAV */}
      <nav className="flex-1 px-1 flex flex-col mt-2 gap-y-1">
        {TabOptions.map((tab) => {
          const isActive = activeTab === tab.label;

          return (
            <Link key={tab.label} to={tab.link}>
              <div
                onClick={() => setActiveTab(tab.label)}
                className={`
                  flex items-center h-11 rounded-lg cursor-pointer
                  transition-colors duration-200
                  ${isActive ? "bg-blue-50" : "hover:bg-gray-100"}
                `}
              >
                {/* Icon Rail (Fixed Width) */}
                <div
                  className={`
                    w-16 flex items-center justify-center
                    ${isActive ? "text-blue-600" : "text-gray-500"}
                  `}
                >
                  {tab.icon}
                </div>

                {/* Label */}
                <div
                  className={`
                    flex-1 overflow-hidden transition-all duration-300
                    ${isNavExpanded ? "opacity-100" : "opacity-0"}
                  `}
                >
                  <span
                    className={`
                      text-sm font-medium whitespace-nowrap
                      ${isActive ? "text-black font-semibold" : "text-gray-700"}
                    `}
                  >
                    {tab.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-dashed border-gray-200 px-1 pb-1 pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center h-11 w-full rounded-xl bg-red-100 hover:bg-red-200 transition cursor-pointer"
        >
          <div className="w-16 flex items-center justify-center text-xl text-gray-600 ">
            <MdOutlineLogout />
          </div>

          <div
            className={`
              flex-1 overflow-hidden transition-all duration-300
              ${isNavExpanded ? "opacity-100" : "opacity-0"}
            `}
          >
            <span className="text-sm font-bold text-gray-700">
              Logout
            </span>
          </div>
        </button>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Confirm logout"
          confirmText="Log out"
          cancelText="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        >
          Are you sure you want to log out of your account?
        </ConfirmModal>

      )}
    </aside >
  );
};

export default React.memo(SideNav);
