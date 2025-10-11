import { Outlet } from "react-router-dom";
import { ModalProvider } from "./common/components/Login/ModalProvider";

export default function AppShell() {
  // RouterProvider 안에서 렌더되므로 useNavigate 사용 OK
  return (
    <ModalProvider>
      <Outlet />
    </ModalProvider>
  );
}