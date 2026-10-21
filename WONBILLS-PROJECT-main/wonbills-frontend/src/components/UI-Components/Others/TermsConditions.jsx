import React from "react";

const TermsConditions = () => {
  return (
    <div className="
    w-full flex flex-col gap-3
    px-3 sm:px-4 md:px-6
    py-3
    overflow-y-auto
  ">
      <h1 className="
      font-semibold
      text-sm sm:text-base
    ">
        NOWIT SERVICES - Privacy Policy
      </h1>

      <p className="
      text-[0.7rem] sm:text-xs
    ">
        Nowit Services is committed to safeguarding user privacy on the{" "}
        <span className="font-semibold">WONPlus Bills</span> web app. This policy
        outlines how we handle data collection, usage, and security.
      </p>

      <div className="space-y-1">
        <p className="text-[0.7rem] sm:text-xs">
          <span className="font-semibold">App Name:</span> WONPlus Bills (Web App)
        </p>
        <p className="text-[0.7rem] sm:text-xs">
          <span className="font-semibold">Developer:</span> NOWIT SERVICES Pvt Ltd
        </p>
        <p className="text-[0.7rem] sm:text-xs">
          <span className="font-semibold">Document:</span> Terms & Conditions,
          Privacy Policy, Refund Policy
        </p>
      </div>

      <div className="w-full h-px bg-black my-2" />

      <ol className="list-decimal list-outside pl-4 sm:pl-6 space-y-3">
        <li>
          <p className="text-[0.7rem] sm:text-xs font-semibold">General Terms</p>
          <p className="text-[0.7rem] sm:text-xs">
            This Privacy Policy forms part of the Terms of Service for this web app.
          </p>
        </li>

        <li>
          <p className="text-[0.7rem] sm:text-xs font-semibold">
            Modification of Terms
          </p>
          <p className="text-[0.7rem] sm:text-xs">
            Continued use indicates acceptance of changes.
          </p>
        </li>

        <li>
          <p className="text-[0.7rem] sm:text-xs font-semibold">
            Services Provided
          </p>
          <p className="text-[0.7rem] sm:text-xs">
            Online billing, invoicing, and accounting tools with secure cloud
            storage.
          </p>
        </li>

        <li>
          <p className="text-[0.7rem] sm:text-xs font-semibold">Charges</p>
          <ul className="list-disc pl-4 sm:pl-6 space-y-1">
            <li className="text-[0.7rem] sm:text-xs">
              <span className="font-semibold">Transaction Fees:</span> 1% per
              transaction
            </li>
            <li className="text-[0.7rem] sm:text-xs">
              <span className="font-semibold">Payment Method:</span> Auto-deducted
            </li>
            <li className="text-[0.7rem] sm:text-xs">
              <span className="font-semibold">Future Changes:</span> Prior notice
            </li>
          </ul>
        </li>

        <li>
          <p className="text-[0.7rem] sm:text-xs font-semibold">
            Data Security and Ownership
          </p>
          <p className="text-[0.7rem] sm:text-xs">
            You retain ownership of all data. Industry-standard security is used.
          </p>
        </li>

        <li>
          <p className="text-[0.7rem] sm:text-xs font-semibold">Refund Policy</p>
          <p className="text-[0.7rem] sm:text-xs">
            As a free service, no refunds apply.
          </p>
        </li>
      </ol>
    </div>
  );

};

export default TermsConditions;
