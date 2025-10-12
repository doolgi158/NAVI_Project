import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import axios from "axios";
import store from "./common/store/store";
import root from "./common/router/root.jsx";

function App() {
  const token = localStorage.getItem("accessToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return (
    <Provider store={store}>
      <RouterProvider router={root} />
    </Provider>
  );
}

export default App;
