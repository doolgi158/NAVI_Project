import FooterLayout from "./FooterLayout";
import HeaderLayout from "./HeaderLayout";

const MainLayout = ({children}) => {
    return (
       // 최상위 div에 화면 최소 높이, flex, 세로 정렬 클래스 적용
        <div className="min-h-screen flex flex-col">
            <HeaderLayout />

            {/* main 태그에 flex-grow와 좌우 패딩(px-24) dir 96px 여백 적용 */}
            {/*Header의 높이(mt-12 = 48px)만큼 공간 확보*/}
            <main className="flex-grow px-24 mt-12">{children}</main>
            <FooterLayout />
        </div>
    );
}

export default MainLayout;