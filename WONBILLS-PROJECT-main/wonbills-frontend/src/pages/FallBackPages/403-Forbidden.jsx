import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div
      className="
        flex flex-col
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
      {/* IMAGE SECTION */}
      <div
        className="
          w-full md:w-1/2
          h-[220px] sm:h-[300px] md:h-[420px] lg:h-[520px]
          bg-contain bg-no-repeat bg-center
        "
        style={{ backgroundImage: "url('/images/403-wonbills.png')" }}
      />

      {/* TEXT SECTION */}
      <div className="flex flex-col items-center text-center md:items-start md:text-left max-w-xl">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-caveat">
          We are Sorry...
        </h1>

        <p className="mt-3 text-base sm:text-lg text-gray-400 font-sour-gummy">
          The page you're trying to access has restricted access.
        </p>

        <button
          onClick={() => navigate(-1)}
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
          Go Back
          <span className="text-xl transform transition-transform duration-300 group-hover:translate-x-2">
            <FaChevronRight />
          </span>
        </button>
      </div>
    </div>
  );
}
