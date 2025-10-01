import FooterLayout from "./FooterLayout";
import HeaderLayout from "./HeaderLayout";

const MainLayout = ({children}) => {
    return (
        <>
            <HeaderLayout />
                <main>{children}</main>
            <FooterLayout />
        </>
    );
}

export default MainLayout;