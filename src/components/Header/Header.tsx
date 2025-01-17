import { Avatar, Badge, Layout, Typography, Flex, Tooltip, Button } from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header: AntHeader } = Layout;

export const Header = () => {
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
              <Badge count={1}>
                <BellOutlined style={{ animation: "rotate 2s linear infinite" }} />
              </Badge>
            }
          />
        </Tooltip>

        <Flex gap="small" style={{ alignItems: "center" }}>
          <Avatar icon={<UserOutlined />} />
          <Typography.Paragraph style={{ color: "#fff", margin: 0 }}>
            David Restrepo Vera
          </Typography.Paragraph>
        </Flex>
        <Tooltip title="Cerrar sesión">
          <Button
            type="text"
            shape="circle"
            icon={<LogoutOutlined style={{ color: "#fff" }} />}
          />
        </Tooltip>
      </Flex>
    </AntHeader>
  );
};
