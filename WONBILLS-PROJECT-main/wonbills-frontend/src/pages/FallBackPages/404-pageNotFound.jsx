import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="
      flex flex-col-reverse
      md:flex-row
      items-center
      justify-center
      min-h-screen
      bg-white
      px-6
      py-10
      gap-10
    ">
      {/* TEXT SECTION */}
      <div className="w-full md:w-1/2 max-w-xl text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 font-caveat">
          UH OH! You're lost!
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-500 mt-3 font-sour-gummy">
          Something Went Wrong!
        </p>

        <p className="text-sm sm:text-base text-black mt-4 font-sour-gummy">
          The page you are looking for does not exist. How you got here is a
          mystery. But you can click the button below to go back to the
          homepage.
        </p>

        <div className="flex justify-center md:justify-start">
          <button
            onClick={() => navigate("/")}
            className="
              group flex items-center gap-2
              mt-6
              bg-blue-400 hover:bg-blue-600
              text-white font-semibold
              py-2.5 px-6
              rounded-2xl
              shadow
              transition
            "
          >
            Go Home
            <span className="text-xl transform transition-transform duration-300 group-hover:translate-x-2">
              <FaChevronRight />
            </span>
          </button>
        </div>
      </div>

      {/* LOTTIE SECTION */}
      <div className="
        w-full md:w-1/2
        h-[260px] sm:h-[320px] md:h-[420px] lg:h-[520px]
        flex items-center justify-center
      ">
        <DotLottieReact
          src="https://lottie.host/c07054ba-b515-4f86-9201-3cdf537e81de/nE9wFgawWP.lottie"
          loop
          autoplay
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
