import { ModalProvider } from "../../common/components/Login/ModalProvider";
import FooterLayout from "./FooterLayout";
import HeaderLayout from "./HeaderLayout";

const MainLayout = ({children}) => {
    return (
       // 최상위 div에 화면 최소 높이, flex, 세로 정렬 클래스 적용
       <ModalProvider >
        <div className="min-h-screen flex flex-col">
            <HeaderLayout />
            <main className="flex-grow  px-24 bg-yellow-50 ">{children}</main>
            <FooterLayout />
        </div>
        </ModalProvider>
    );
}

export default MainLayout;