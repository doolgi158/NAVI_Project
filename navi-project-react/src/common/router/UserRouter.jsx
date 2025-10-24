import { lazy, Suspense } from "react";

const Loading = <div></div>
const Signup = lazy(() => import("../../users/pages/user/UserSignupPage"));
const Redirect = lazy(() => import("../../users/pages/user/SocialRedirectPage"));
const FindID = lazy(() => import("../../users/pages/user/FindUserIdPage"));
const FindPw = lazy(() => import("../../users/pages/user/FindUserPwPage"));
const Mypage = lazy(() => import("../../users/pages/user/UserMyPage"));
const Detail = lazy(() => import("../../users/pages/user/UserDetailPage"));
const EditProfile = lazy(() => import("../../users/pages/user/UserProfileEditPage"));
const LikedTravelsPage = lazy(() => import("../../users/pages/user/UserLikedTravelsPage"));
const BookmarkedTravelsPage = lazy(() => import("../../users/pages/user/UserBookmarkedTravelsPage"));
const UserMyFlight = lazy(() => import("../../users/pages/user/UserMyFlightsPage"));
const UserMyDelivery = lazy(() => import("../../users/pages/user/UserMyDeliveriesPage"))

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
        },
        {
            path: "detail",
            element: (
                <Suspense fallback={Loading}>
                    <Detail />
                </Suspense>
            )
        },
        {
            path: "profile/edit",
            element: (
                <Suspense fallback={Loading}>
                    <EditProfile />
                </Suspense>
            )
        },
        {
            path: "/users/likes",
            element: (
                <Suspense fallback={Loading}>
                    <LikedTravelsPage />
                </Suspense>
            )
        },
        {
            path: "/users/bookmarks",
            element: (
                <Suspense fallback={Loading}>
                    <BookmarkedTravelsPage />
                </Suspense>
            )
        },
        {
            path: "/users/my-flights",
            element: <UserMyFlight />,
        },
        {
            path: "/users/my-deliveries",
            element: <UserMyDelivery />,
        },
    ]
}

export default UserRouter;