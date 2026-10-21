import React from "react";

const AvatarSkeleton = () => {
    return (
        <div className="relative h-32 w-32 rounded-full self-center overflow-hidden shadow-lg animate-pulse">
            <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-black/20 border-dashed" />
        </div>
    );
};


export default React.memo(AvatarSkeleton)