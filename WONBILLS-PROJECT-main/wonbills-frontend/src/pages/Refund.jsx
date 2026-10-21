import PolicyLayout from "./Policylayout";

const Refund = () => (
    <PolicyLayout title="NOWIT SERVICES - Refund Policy">
        <p className="text-[0.7rem] lg:text-[0.9rem]">
            NowIT Services provides services through <span className="font-semibold">WON Bills</span>. This policy clearly states our refund and cancellation terms.
        </p>

        <p className="text-[0.7rem] text-black">
            <span className="font-semibold">App Name:</span> WON Bills (Web App)
        </p>
        <p className="text-[0.7rem] text-black">
            <span className="font-semibold">Developer:</span> NOWIT SERVICES Pvt Ltd
        </p>
        <p className="text-[0.7rem] text-black">
            <span className="font-semibold">Document:</span> Refund Policy
        </p>

        <div className="w-full h-px bg-black my-1"></div>

        <ol className="w-full list-outside">
            <li className="mb-2 flex flex-col">
                <span>Refund Policy</span>
                <span className="text-[0.7rem]">
                    All payments made for services, subscriptions, or digital products on WON Bills are final and non-refundable.
                </span>
            </li>

            <li className="mb-2">
                <span className="text-[0.7rem]">
                    Once a service is purchased, activated, or accessed, no refund will be provided under any circumstances.
                </span>
            </li>

            <li className="mb-2">
                <span className="text-[0.7rem]">
                    Cancellation of a subscription does not entitle the user to any refund for the remaining period.
                </span>
            </li>

            <li className="mb-2">
                <span className="text-[0.7rem]">
                    No return, exchange, or replacement is applicable for any services or digital products provided through WON Bills.
                </span>
            </li>

            <li className="mb-2">
                <span className="text-[0.7rem]">
                    By using our services, you acknowledge and agree that all purchases are non-refundable and non-returnable.
                </span>
            </li>

            <li className="mb-2">
                <span className="text-[0.7rem]">
                    This policy applies to all users without exception unless explicitly stated in a separate written agreement approved by NOWIT SERVICES Pvt Ltd.
                </span>
            </li>

            <li className="mb-2">
                <span className="text-[0.7rem]">
                    For any questions or concerns, you may contact us:
                    <br />
                    Phone: +91 7893536373
                    <br />
                    Email: sales@nowitservices.com
                    <br />
                    Working Hours: Monday - Saturday (10:00 AM - 6:00 PM)
                </span>
            </li>
        </ol>
    </PolicyLayout>
);

export default Refund;