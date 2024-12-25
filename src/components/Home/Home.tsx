import {
  Breadcrumb,
  Button,
  Card,
  Layout,
  Typography,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";

const { Content, Sider } = Layout;
const { Title } = Typography;

export const Home = () => {
  return (
    <Layout>
      <Header />
      <Layout>
        <Sider collapsible style={{ backgroundColor: "#FFF" }}>
          <Sidebar />
        </Sider>
        <Content style={{ padding: "0 16px 30px 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Inicio</Breadcrumb.Item>
            <Breadcrumb.Item>Tablero de Inicio</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card
              title={<Title level={5}>Título 1</Title>}
              extra={<Button type="primary">Abrir</Button>}
            >
              {/* Contenido vacío */}
            </Card>
            <div style={{ display: "flex", gap: "16px" }}>
              <Card
                title={<Title level={5}>Título 2</Title>}
                style={{
                  flex: 1,
                }}
              >
                {/* Contenido vacío */}
              </Card>
              <Card
                title={<Title level={5}>Título 3</Title>}
                style={{
                  flex: 1,
                }}
              >
                {/* Contenido vacío */}
              </Card>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
