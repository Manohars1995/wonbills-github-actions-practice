import React from 'react'

const BtnSkeleton = ({id=''}) => {
    return (
        <div className="h-10 w-80 animate-pulse">
            {/* button skeleton */}
            <div className="w-full h-10 rounded-xl bg-gray-300" />
        </div>
    );
};


export default React.memo(BtnSkeleton);
