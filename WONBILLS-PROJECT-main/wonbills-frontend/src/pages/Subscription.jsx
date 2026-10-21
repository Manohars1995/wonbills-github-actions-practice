import React, { useContext, useState } from 'react';
import { toast } from "sonner";
import { createSubscription, checkSubscriptionStatus } from '../services/auth/auth';
import { BtnTag } from '../components/UI-Elements/Input-Elements/Input-tags';
import { WonBillsContext } from '../store/WonBillsContext';
import SEO from '../components/SEO';

const Subscription = () => {
    const razorpayKey = `${import.meta.env.VITE_RAZORPAY_KEY}`;
    const [loading, setLoading] = useState(false);
    const { userID } = useContext(WonBillsContext)


    const NavigateToFreeTrial = () => {
        window.location.href = "/signin";
    };

    const handleSubscribe = async () => {
        setLoading(true);

        if (!userID) {
            toast.error("User ID not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const { data } = await createSubscription();

            const options = {
                key: razorpayKey,
                amount: data.amount,
                currency: data.currency,
                name: "WON BILLS",
                description: "Subscription Payment",
                order_id: data.id,

                handler: async () => {
                    const toastId = toast.loading("Checking subscription status...");

                    try {
                        const { data: userData } = await checkSubscriptionStatus();

                        if (userData.success) {
                            toast.success("Subscription activated!", { id: toastId });
                            window.location.href = "/signin";
                        } else {
                            toast.error(
                                "Subscription not active yet. Try refreshing later.",
                                { id: toastId }
                            );
                        }
                    } catch (error) {
                        console.error(error)
                        toast.error("Error checking subscription status", { id: toastId });
                    }
                },

                theme: { color: "#3399cc" }
            };

            new window.Razorpay(options).open();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <SEO
                title="Subscription"
                noIndex={true}
            />
            <div className='flex items-center justify-center h-screen w-screen gap-6 '>
                {/* ---------------- FREE PLAN ---------------- */}
                <div className="bg-[#ecf0ff] relative shadow-xl rounded-3xl p-2 h-110 max-w-120 flex flex-col">
                    <span className="absolute top-0 right-0 bg-[#bed6fb] text-[#425475] font-semibold text-xl px-4 py-1 rounded-l-full">
                        Free
                    </span>
                    <div className=" flex flex-col items-center flex-1 p-3 pt-10  rounded-xl">


                        <p className="mt-3 text-xl font-bold text-[#425675]">
                            30 Days - Free Trial
                        </p>

                        <p className="mt-4 text-center text-[#697e91]">
                            Explore WonBills with essential tools to manage bills, track
                            expenses, and process payments for free.
                        </p>

                        <ul className="flex flex-col w-full flex-1 mt-4 gap-3">
                            {[
                                "Basic bill tracking",
                                "Automated reminders",
                                "Limited vendor payments",
                                "Basic expense reports"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1fcac5] text-white">
                                        ✓
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="w-full mt-auto">
                            <BtnTag
                                type='button'
                                onClick={NavigateToFreeTrial}
                                disabled={loading}
                                loading={loading}
                                BtnText="Start Free Trial"
                                styles="w-full bg-[#6558d3] text-white font-medium text-lg py-2 rounded-md hover:bg-[#4133b7]"
                            />
                        </div>
                    </div>
                </div>

                {/* ---------------- PRO PLAN ---------------- */}
                <div className="bg-[#ecf0ff] relative shadow-xl rounded-3xl p-2 h-110 max-w-120 flex flex-col">
                    <span className="absolute top-0 right-0 bg-[#bed6fb] text-[#425475] font-semibold text-xl px-4 py-1 rounded-l-full">
                        ₹999 <small className="text-xs text-[#707a91]">/ year</small>
                    </span>

                    <div className="flex flex-col items-center flex-1 p-3 pt-10 rounded-xl">
                        <p className="mt-3 text-xl font-bold text-[#425675]">Pro</p>

                        <p className="mt-4 text-center text-[#697e91]">
                            Unlock full access to WonBills with advanced bill tracking, secure
                            payments, and detailed reports.
                        </p>

                        <ul className="flex flex-col w-full flex-1 mt-4 gap-3">
                            {[
                                "Unlimited bill tracking",
                                "Advanced payment automation",
                                "Secure online payments",
                                "Unlimited vendor payments",
                                "Detailed financial reports"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1fcac5] text-white">
                                        ✓
                                    </span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="w-full mt-auto">
                            <BtnTag
                                type="button"
                                onClick={handleSubscribe}
                                disabled={loading}
                                loading={loading}
                                BtnText="Upgrade to Pro"
                                styles="w-full bg-[#6558d3] text-white font-medium text-lg py-2 rounded-md hover:bg-[#4133b7]"
                            />
                        </div>
                    </div>
                </div>

            </div>

        </>
    )
}

export default Subscription
