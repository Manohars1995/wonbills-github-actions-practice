import SigninForm from "../components/UI-Components/Forms/SignIn/SigninForm";
import SEO from "../components/SEO";

const SignIn = () => {
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
        flex flex-col
        items-center
        justify-center
        relative
        px-4
        py-10
      "
        style={{ backgroundImage: "url('/images/bglogin.png')" }}
      >
        {/* FORM */}
        <SigninForm />

        {/* FOOTER TAGLINE */}
        <p className="mt-6 text-sm sm:text-base font-bold text-gray-700">
          #OneclickwithWonBills
        </p>
      </div>
    </>
  );
};

export default SignIn;
