import { RouterProvider } from "react-router-dom";
import root from "./router/root.jsx";
import { ModalProvider } from "./common/ModalProvider.jsx";

function App() {
  return (
    <ModalProvider>
      <RouterProvider router={root} />
    </ModalProvider>
  );
}

export default App;