const FormSkeleton = ({ profile = false, count = 8, notesCount = 1 }) => {
    return (
        <div className="w-full px-6 py-4 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="h-6 w-6 rounded-full bg-gray-300" />
                <div className="h-5 w-52 rounded bg-gray-300" />
            </div>

            {/* Avatar (optional) */}
            {profile && (
                <div className="flex justify-center mb-10">
                    <div className="relative">
                        <div className="h-32 w-32 rounded-full bg-gray-300" />
                        <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-gray-400" />
                    </div>
                </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: count }).map((_, i) => (
                    <SkeletonInput key={i} />
                ))}
            </div>

            {/* Notes */}
            <div className="mt-8 flex flex-col gap-3">
                {Array.from({ length: notesCount }).map((_, i) => (
                    <div>
                        <div className="h-4 w-24 rounded bg-gray-300 mb-2" />
                        <div className="h-24 w-full rounded-xl bg-gray-300" />
                    </div>
                ))}

            </div>
        </div>
    );
};

const SkeletonInput = () => {
    return (
        <div>
            <div className="h-4 w-32 rounded bg-gray-300 mb-2" />
            <div className="h-11 w-full rounded-xl bg-gray-300" />
        </div>
    );
};

export default FormSkeleton;
