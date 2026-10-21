import React from 'react'

const InputSkeleton = ({id=''}) => {
    return (
        <div className="h-20 animate-pulse">
            {/* Label skeleton */}
            <div className="h-5 w-28 bg-gray-200 rounded-md ml-2 mb-2" />

            {/* Input skeleton */}
            <div className="w-full h-[2.4rem] rounded-xl bg-gray-200" />
        </div>
    );
};


export default React.memo(InputSkeleton);
