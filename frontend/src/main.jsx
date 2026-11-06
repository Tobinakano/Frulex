import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SucursalProvider } from "./context/SucursalContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SucursalProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </SucursalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
