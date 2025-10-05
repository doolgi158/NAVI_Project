import { RouterProvider } from "react-router-dom";
import root from "./router/root.jsx";
import { ModalProvider } from "./common/component/ModalProvider.jsx";

function App() {
  return (
    <RouterProvider router={root} />
  );
}

export default App;