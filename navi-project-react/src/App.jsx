import { RouterProvider } from "react-router-dom";
import axios from "axios";
import root from "./common/router/root";
import useAutoRefresh from "./common/hooks/useAutoRefresh";


function App() {
  const token = localStorage.getItem("accessToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  useAutoRefresh();

  return (
    <>
      <RouterProvider router={root} />
    </>
  );
}

export default App;