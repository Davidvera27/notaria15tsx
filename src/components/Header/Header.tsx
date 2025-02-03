import { Avatar, Layout, Typography, Flex, Tooltip, Button } from "antd";
import {

  LogoutOutlined,

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
