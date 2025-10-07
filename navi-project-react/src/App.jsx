import { RouterProvider } from "react-router-dom";
import root from "./common/router/root.jsx";

function App() {
  return (
    <RouterProvider router={root} />
  );
}

export default App;