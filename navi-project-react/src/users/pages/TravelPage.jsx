<<<<<<< HEAD:navi-project-react/src/pages/TravelPage.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from "../layout/MainLayout";
=======
import MainLayout from "./MainLayout";
>>>>>>> c71dfe39f7535704140b80f769b7452f25a7e17f:navi-project-react/src/users/pages/TravelPage.jsx

const TravelPage = () => {
    return (
        <MainLayout>
            {/*  자식 라우트(list, detail)가 렌더링될 위치 */}
            <Outlet />
        </MainLayout>
    );
};

export default TravelPage;