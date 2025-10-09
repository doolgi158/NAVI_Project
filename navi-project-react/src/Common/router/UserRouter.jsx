import { lazy, Suspense } from "react";

const Loading = <div></div>
const Signup = lazy(() => import("../../users/pages/User/UserSignupPage"));
const Redirect = lazy(() => import("../../users/pages/User/RedirectPage"));
const FindID = lazy(() => import("../../users/pages/User/FindUserIdPage"));
const FindPw = lazy(() => import("../../users/pages/User/FindUserPwPage"))

const UserRouter = () => {
  return [
    {
        path: "signup",
        element: (
            <Suspense fallback={Loading}>
                <Signup />
            </Suspense>
        )
    },
    {
        path: "login/oauth2/redirect",
        element: (
            <Suspense fallback={Loading}>
                <Redirect />
            </Suspense>
        )
    },
    {
        path: "find-id",
        element: (
            <Suspense fallback={Loading}>
                <FindID />
            </Suspense>
        )
    },
    {
        path: "find-password",
        element: (
            <Suspense fallback={Loading}>
                <FindPw />
            </Suspense>
        )
    }
    ]
}

export default UserRouter;