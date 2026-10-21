import React, { useContext, useEffect } from "react";
import { IoNotifications } from "react-icons/io5";
import { WonBillsContext } from "../../store/WonBillsContext";
import { useNavigate } from "react-router-dom";
import { CiCalculator2 } from "react-icons/ci";

const STATUS_CLASS_MAP = {
    pro: "pro-pill",
    trial: "trial-pill",
    free: "trial-pill",
    expired: "expired-pill",
    error: "text-gray-500",
    loading: "text-gray-400"
};


const Header = () => {
    const {
        setPathText,
        profilePicture,
        companyName,
        subscription,
        isNotifyOpen,
        setNotifyOpen, isCalculatorOpen, setIsCalculatorOpen
    } = useContext(WonBillsContext);
    const navigate = useNavigate();

    useEffect(() => {
        const currentPath = window.location.pathname.split("/")[1] || "";
        setPathText(currentPath);
    }, [setPathText]);

    // do not render pill during loading/error
    const showSubscription =
        subscription.type !== "loading" &&
        subscription.type !== "error" &&
        Boolean(subscription.label);


    return (
        <div className="h-full w-full p-1 flex items-center justify-between">

            {/* Greeting */}
            <h1 className="text-black font-bold text-sm lg:text-2xl ml-11 lg:m-0">
                Hello, {companyName}
            </h1>

            {/* Right Section */}
            <div className="flex items-center gap-4">

                {/* Subscription Pill */}
                {showSubscription && (
                    <div className="flex items-center">
                        {/* Mobile: status dot */}
                        <span
                            className={`
                            lg:hidden
                            inline-block
                            w-5 h-5
                            rounded-full
                            ${STATUS_CLASS_MAP[subscription.type]}
                        `}
                            aria-label={subscription.label}
                        />

                        {/* Desktop: full pill */}
                        <h3
                            className={`
                            hidden lg:inline-flex
                            relative items-center
                            text-sm font-semibold
                            pill-shine px-5 py-1.5 rounded-2xl
                            ${STATUS_CLASS_MAP[subscription.type]}
                        `}
                        >
                            <span className="relative z-10">
                                {subscription.label}
                            </span>
                        </h3>
                    </div>
                )}




                {/* Notifications */}
                <button
                    type="button"
                    title="Notifications"
                    onClick={() => setNotifyOpen(!isNotifyOpen)}
                    className="h-10 w-10 text-2xl flex items-center justify-center rounded-full text-black bg-gray-200"
                >
                    <IoNotifications />
                </button>
                <button
                    type="button"
                    onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                    className="h-10 w-10 text-2xl flex items-center justify-center rounded-full text-black bg-gray-200">
                    <CiCalculator2 />
                </button>

                {/* Profile */}
                <button type="button" onClick={() => navigate("/settings")}>
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="Profile"
                            className="rounded-full w-10 h-10 object-cover"
                        />
                    ) : (
                        <span className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-blue-500 text-xl">
                            {companyName ? companyName.charAt(0).toUpperCase() : "N"}
                        </span>
                    )}
                </button>

            </div>
        </div>
    );
};

export default React.memo(Header);
