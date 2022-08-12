import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = ({ children }) => {
  return (
    <>
      <ToastContainer
        position="top-right"
        transition={Zoom}
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
