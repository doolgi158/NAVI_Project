import FooterLayout from "./FooterLayout";
import HeaderLayout from "./HeaderLayout";

const MainLayout = ({children}) => {
    return (
       // 최상위 div에 화면 최소 높이, flex, 세로 정렬 클래스 적용
        <div className="min-h-screen flex flex-col">
            <HeaderLayout />

            {/* main 태그에 flex-grow를 적용하여 남은 공간을 모두 채움 */}
            <main className="flex-grow">{children}</main>
            <FooterLayout />
        </div>
    );
}

export default MainLayout;