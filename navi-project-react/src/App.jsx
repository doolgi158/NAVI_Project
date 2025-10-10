import { RouterProvider } from "react-router-dom";
import root from "./common/router/root.jsx";
import axios from "axios";

function App() {
  const token = localStorage.getItem("accessToken");
  
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return (
    <RouterProvider router={root} />
  );
}

export default App;