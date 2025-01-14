import { Avatar, Badge, Layout, Typography, Flex, Tooltip, Button } from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Header: AntHeader } = Layout;

export const Header = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verifica si el token ha expirado
  const verifyToken = (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false; // Si no hay token, consideramos que ha expirado
    }

    try {
      const currentTime = Date.now() / 1000; // Hora actual en segundos
      const decoded: any = jwtDecode(token); // Decodificar el token
      return decoded.exp < currentTime; // Compara la expiración con la hora actual
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return true; // Si ocurre un error al decodificar, tratamos el token como expirado
    }
  };

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserName(response.data.user.complete_name + " " + response.data.user.last_name);
    } catch (error) {
      console.error("Error al obtener el perfil del usuario", error);
      localStorage.removeItem("token"); // Eliminar el token si ocurre un error
      navigate("/login"); // Redirigir a login si no se puede obtener el perfil
    }
  };

  // Llamamos a la función al montar el componente
  useEffect(() => {
    if (verifyToken()) {
      localStorage.removeItem("token"); // Eliminar token expirado
      navigate("/login"); // Redirigir a login si el token ha expirado
    } else {
      fetchUserProfile(); // Si el token es válido, obtenemos el perfil
    }
  }, [navigate]);

  return (
    <AntHeader
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        padding: "13px 16px",
      }}
    >
      <Typography.Title
        style={{
          color: "#fff",
          fontSize: "16px",
          margin: 0,
        }}
      >
        Sistema de Gestión
      </Typography.Title>
      <Flex gap="middle">
        <Tooltip title="Buscar">
          <Button
            type="text"
            shape="circle"
            icon={<SearchOutlined style={{ color: "#fff" }} />}
          />
        </Tooltip>
        <Tooltip title="Ayuda">
          <Button
            type="text"
            shape="circle"
            icon={<QuestionCircleOutlined style={{ color: "#fff" }} />}
          />
        </Tooltip>
        <Tooltip title="Notificaciones">
          <Button
            type="text"
            shape="circle"
            icon={
              <Badge count={11}>
                <BellOutlined style={{ color: "#fff" }} />
              </Badge>
            }
          />
        </Tooltip>
        <Flex gap="small" style={{ alignItems: "center" }}>
          <Avatar icon={<UserOutlined />} />
          <Typography.Paragraph style={{ color: "#fff", margin: 0 }}>
            {userName || "Cargando..."} {/* Muestra el nombre del usuario o un texto por defecto */}
          </Typography.Paragraph>
        </Flex>
        <Tooltip title="Cerrar sesión">
          <Button
            type="text"
            shape="circle"
            icon={<LogoutOutlined style={{ color: "#fff" }} />}
            onClick={() => {
              // Eliminar el token y redirigir a login
              localStorage.removeItem("token");
              navigate("/login");
            }}
          />
        </Tooltip>
      </Flex>
    </AntHeader>
  );
};
