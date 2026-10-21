import React from "react";

const Policy = () => {
  return (
    <div className="
      mx-auto
      w-full
      max-w-4xl
      border border-gray-400
      p-4 sm:p-6
    ">
      {/* Header */}
      <div className="flex flex-col gap-y-2">
        <h2 className="text-lg sm:text-xl font-bold">
          NOWIT SERVICES - Privacy Policy
        </h2>

        <p className="text-xs sm:text-sm text-gray-600">
          Nowit Services is committed to safeguarding user privacy on the{" "}
          <strong>WONPlus Bills</strong> web app. This policy outlines how we
          handle data collection, usage, and security.
        </p>

        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-semibold">
            App Name: WONPlus Bills (Web App)
          </h4>
          <h4 className="text-xs sm:text-sm font-semibold">
            Developer: NOWIT SERVICES Pvt Ltd
          </h4>
          <h4 className="text-xs sm:text-sm font-semibold">
            Document: Terms & Conditions, Privacy Policy, Refund Policy
          </h4>
        </div>
      </div>

      <hr className="my-4 border-dashed border-gray-400" />

      {/* Policy Content */}
      <ol className="list-decimal space-y-4 pl-4 sm:pl-5">
        {[
          ["General Terms",
            "This Privacy Policy forms part of the Terms of Service for this web app. By accessing or using this service, you accept these terms. If you do not agree, please refrain from using the app."
          ],
          ["Modification of Terms",
            "Our Terms may change over time. Continued use of the web app after updates indicates acceptance of any changes. Please review our Terms and Privacy Policy periodically."
          ],
          ["Services Provided",
            "This web app provides online billing, invoicing, and basic accounting tools for small and medium businesses. Accessible through web browsers, it allows for secure cloud-based storage of billing records. Users are responsible for compliance with relevant legal and regulatory requirements."
          ],
        ].map(([title, text], i) => (
          <li key={i}>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs sm:text-sm text-gray-600">{text}</p>
          </li>
        ))}

        <li>
          <p className="font-semibold text-sm">Charges</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-xs sm:text-sm text-gray-600">
            <li><strong>Transaction Fees:</strong> 1% per transaction</li>
            <li><strong>Payment Method:</strong> Auto-deducted</li>
            <li><strong>Future Changes:</strong> Prior notice</li>
          </ul>
        </li>

        <li>
          <p className="font-semibold text-sm">Data Security and Ownership</p>
          <p className="text-xs sm:text-sm text-gray-600">
            You retain full ownership of your data. Industry-standard security
            measures including encryption and firewalls are used.
          </p>
        </li>

        <li>
          <p className="font-semibold text-sm">Refund Policy</p>
          <p className="text-xs sm:text-sm text-gray-600">
            As the service is free, refunds are not applicable.
          </p>
        </li>
      </ol>
    </div>
  );
};


export default Policy;
