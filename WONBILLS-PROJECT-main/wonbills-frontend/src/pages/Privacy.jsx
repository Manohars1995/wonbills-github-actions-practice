import PolicyLayout from "./Policylayout";

const Privacy = () => (
    <PolicyLayout title="NOWIT SERVICES - Privacy Policy">
        <p className="text-[0.7rem] lg:text-[0.9rem]">
            NowIT Services is committed to safeguarding user privacy on the <span className="font-semibold">WON Bills</span> web app. This policy outlines how we handle data collection, usage, and security.
        </p>

        <p className="text-[0.7rem] text-black">
            <span className="font-semibold">App Name:</span> WON Bills (Web App)
        </p>
        <p className="text-[0.7rem] text-black">
            <span className="font-semibold">Developer:</span> NOWIT SERVICES Pvt Ltd
        </p>
        <p className="text-[0.7rem] text-black">
            <span className="font-semibold">Document:</span> Privacy Policy
        </p>

        <div className="w-full h-px bg-black my-1"></div>

        <ol className="list-decimal pl-4 space-y-2 text-[0.7rem] text-justify leading-relaxed">
            <li>
                <span className="font-semibold">Introduction -</span> This Privacy Policy describes how NOWIT SERVICES INDIA PRIVATE LIMITED and its affiliates ("NOWIT SERVICES INDIA PRIVATE LIMITED", "we", "our", "us") collect, use, share, protect or otherwise process your information/personal data through our website https://wonbills.com (hereinafter referred to as "Platform"). Please note that you may be able to browse certain sections of the Platform without registering with us. We do not offer any product/service under this Platform outside India and your personal data will primarily be stored and processed in India. By visiting this Platform, providing your information or availing any product/service offered on the Platform, you expressly agree to be bound by the terms and conditions of this Privacy Policy, the Terms of Use and applicable laws of India. If you do not agree please do not use or access our Platform.
            </li>

            <li>
                <span className="font-semibold">Collection -</span> We collect your personal data when you use our Platform, services or otherwise interact with us. This includes name, date of birth, address, phone number, email ID and identity proofs. Sensitive data like bank or card details may be collected with your consent. You may choose not to provide information by not using certain features.
            </li>

            <li>
                <span className="font-semibold">Usage -</span> We use your data to provide services, improve experience, resolve issues, send updates, prevent fraud, and comply with legal obligations. You may opt out of marketing communications.
            </li>

            <li>
                <span className="font-semibold">Sharing -</span> We may share your data with affiliates, service providers, business partners, or authorities when required for service delivery, legal compliance, fraud prevention, or enforcement of terms.
            </li>

            <li>
                <span className="font-semibold">Security Precautions -</span> We implement reasonable security measures to protect your data. However, internet transmission is not fully secure, and users are responsible for safeguarding login credentials.
            </li>

            <li>
                <span className="font-semibold">Data Retention -</span> We retain your data only as long as necessary for service purposes or legal compliance. You may request deletion of your account, subject to pending obligations.
            </li>

            <li>
                <span className="font-semibold">Your Rights -</span> You may access, update, or correct your personal data through available features on the Platform.
            </li>

            <li>
                <span className="font-semibold">Consent -</span> By using the Platform, you consent to data collection, usage, and communication via SMS, email, or calls. You may withdraw consent by contacting us.
            </li>

            <li>
                <span className="font-semibold">Policy Updates -</span> We may update this Privacy Policy periodically. Continued use indicates acceptance of changes.
            </li>

            <li>
                {/* <span className="font-semibold">Grievance Officer -</span><br /> */}
                                NOWIT SERVICES Pvt Ltd <br />

                {/* Name: <br /> */}
                {/* Designation: <br /> */}
                {/* Address: <br /> */}
                Contact: +91 7893536373<br />
                Email: sales@nowitservices.com<br />
                Working Hours: Monday - Saturday (10:00 AM - 6:00 PM)
            </li>
        </ol>
    </PolicyLayout>
);

export default Privacy;