import { lazy, Suspense } from "react";

const Loading = <div></div>
const Signup = lazy(() => import("../../users/pages/user/UserSignupPage"));
const Redirect = lazy(() => import("../../users/pages/user/RedirectPage"));
const FindID = lazy(() => import("../../users/pages/user/FindUserIdPage"));
const FindPw = lazy(() => import("../../users/pages/user/FindUserPwPage"));
const Mypage = lazy(() => import("../../users/pages/user/UserMyPage"));

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
    },
    {
        path: "mypage",
        element: (
            <Suspense fallback={Loading}>
                <Mypage />
            </Suspense>
        )
    }
    ]
}

export default UserRouter;