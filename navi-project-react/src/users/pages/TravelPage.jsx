import { Outlet } from 'react-router-dom';
import MainLayout from "../layout/MainLayout";

const TravelPage = () => {
    return (
        <MainLayout>
            {/*  자식 라우트(list, detail)가 렌더링될 위치 */}
            <Outlet />
        </MainLayout>
    );
};

export default TravelPage;