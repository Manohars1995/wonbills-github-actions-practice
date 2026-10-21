import { FaRedo } from "react-icons/fa";
import { RiHome6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const ErrorFallback = ({ resetErrorBoundary }) => {
    const navigate = useNavigate();

    return (
        <div translate="no" className="notranslate min-h-screen flex items-center justify-center bg-white px-6">
            <div className="max-w-xl text-center">
                <h1 className="text-5xl font-bold text-gray-900">
                    Something went wrong
                </h1>

                <p className="text-gray-600 mt-4">
                    An unexpected error occurred while loading this page.
                    Please try again, or return to the homepage.
                </p>

                <div className="flex items-center justify-center gap-4">
                    {/* TRY AGAIN */}
                    <button
                        onClick={() => {
                            if (resetErrorBoundary) {
                                resetErrorBoundary(); // preferred
                            } else {
                                window.location.reload(); // fallback
                            }
                        }}
                        className="mt-6 inline-flex items-center cursor-pointer gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-2xl shadow transition"
                    >
                        Try again
                        <FaRedo />
                    </button>

                    {/* GO HOME */}
                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 inline-flex items-center cursor-pointer gap-2 bg-gray-500 hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded-2xl shadow transition"
                    >
                        Go Home
                        <RiHome6Line size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback;
