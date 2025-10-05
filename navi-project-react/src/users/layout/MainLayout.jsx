import FooterLayout from "./FooterLayout";
import HeaderLayout from "./HeaderLayout";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderLayout />
      <main className="flex-grow px-24 mt-1 bg-yellow-50">{children}</main>
      <FooterLayout />
    </div>
  );
};

export default MainLayout;