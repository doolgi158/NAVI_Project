import { RouterProvider } from 'react-router-dom';
import root from "./router/root.jsx";
import React from 'react';


export default function App() {
  return (
    <RouterProvider router={root}/>
  );
};

