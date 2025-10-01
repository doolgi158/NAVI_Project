import { RouterProvider } from 'react-router-dom';
import root from "./router/root.jsx";
import './App.css'

export default function App() {
  return (
    <RouterProvider router={root}/>
  );
};

