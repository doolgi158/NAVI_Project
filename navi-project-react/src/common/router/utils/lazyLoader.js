import React, { lazy, Suspense } from "react";
export const lazyLoad = (path) => (
    <Suspense fallback={<div />}>
        {React.createElement(lazy(() => import(path)))}
    </Suspense>
);
