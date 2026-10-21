import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div
      className="
        flex flex-col-reverse
        md:flex-row
        items-center
        justify-center
        min-h-screen
        bg-white
        px-6
        py-10
        gap-10
      "
    >
      {/* TEXT SECTION */}
      <div className="w-full md:w-1/2 max-w-xl text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">
          401! Hold up!
        </h1>

        <p className="mt-4 text-base sm:text-lg">
          Sorry, but you are not authorized to view this page.
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
            Go Sign In
            <span className="text-xl transform transition-transform duration-300 group-hover:translate-x-2">
              <FaChevronRight />
            </span>
          </button>
        </div>
      </div>

      {/* IMAGE SECTION */}
      <div
        className="
          w-full md:w-1/2
          h-[220px] sm:h-[300px] md:h-[420px] lg:h-[520px]
          bg-cover bg-center
          rounded-xl
        "
        style={{ backgroundImage: "url('/images/401-Unauthorized-2.png')" }}
      />
    </div>
  );
}
