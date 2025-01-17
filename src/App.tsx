import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import { Home } from "./components/Home/Home";
import { Login } from "./components/Login/Login";
import { CaseRentsForm } from "./components/CaseRentsForm/CaseRentsForm";
import { Protocolist } from "./components/Protocolist/Protocolist";
import { CaseRentsFinished } from "./components/CaseRentsFinished/CaseRentsFinished";

export const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#16A34A", // Verde muy claro como color base
          colorPrimaryHover: "#16A34A", // Verde claro al hacer hover
        },
        components: {
          Layout: {
            headerBg: "#14532D",
            triggerBg: "#D1FAE5",
            triggerColor: "#065F46",
          },
          Tabs: {
            inkBarColor: "#34D399",
            itemActiveColor: "#34D399",
            itemSelectedColor: "#10B981",
            itemHoverColor: "#059669",
          },
          Input: {
            borderRadius: 4,
            colorBgContainer: "#FFFFFF",
            colorBgTextHover: "#D1FAE5", // Propiedad válida para el hover
          },
          Button: {
            borderRadius: 4, // Define el radio del botón
            colorPrimaryBg: "#16A34A", // Color de fondo del botón
            colorPrimaryHover: "#34D399", // Color de fondo al hacer hover
          },
          Dropdown: {
            colorBgContainer: "#F0FFF4", // Fondo del dropdown
            colorBgTextHover: "#D1FAE5", // Fondo al hacer hover
          },
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/CaseRentsForm" element={<CaseRentsForm />} />
          <Route path="/Protocolist" element={<Protocolist />} />
          <Route path="/CaseRentsFinished" element={<CaseRentsFinished />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};
