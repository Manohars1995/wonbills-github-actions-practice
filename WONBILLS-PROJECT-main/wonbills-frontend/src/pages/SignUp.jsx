import React from "react";
import SignupForm from "../components/UI-Components/Forms/SignUp/SignupForm";
import SEO from "../components/SEO";

const SignUp = () => {
  return (
    <>
      <SEO
        title="Online Invoice & Billing Software"
        description="Create invoices, collect online payments, automate reminders and manage billing with ease."
        keywords="billing software, invoice software, GST billing"
        canonical="https://wonbills.com/"
        image="https://wonbillsnew.s3.ap-south-1.amazonaws.com/Untitled+design.png"
      />
      <div
        translate="no"
        className="notranslate 
        min-h-screen
        w-full
        bg-cover bg-center
        flex
        items-center
        justify-center
        px-4
        py-10
      "
        style={{ backgroundImage: "url('/images/bglogin.png')" }}
      >
        <SignupForm />
      </div>
    </>
  );
};

export default SignUp;
