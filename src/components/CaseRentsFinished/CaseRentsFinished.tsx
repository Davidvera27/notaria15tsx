import React, { useState } from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Dropdown,
  Layout,
  Table,
  Typography,
  Radio,
  Tag,
  MenuProps,
  InputNumber,
  RadioChangeEvent,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import {
  MoreOutlined,
  RedoOutlined,
  DeleteOutlined,
  SendOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

type TableData = {
  key: number;
  no: number;
  creationDate: string;
  escritura: string;
  documentDate: string;
  radicado: string;
  protocolista: string;
  observaciones: string;
};

export const CaseRentsFinished: React.FC = () => {
  const [componentSize, setComponentSize] = useState<"small" | "middle" | "large">("middle");
  const [pageSize, setPageSize] = useState(10);

  const handleFormLayoutChange = (e: RadioChangeEvent) => {
    setComponentSize(e.target.value);
  };

  const menuItems: MenuProps["items"] = [
    {
      label: "Restablecer",
      key: "1",
      icon: <RedoOutlined />,
    },
    {
      label: "Borrar de forma permanente",
      key: "2",
      icon: <DeleteOutlined />,
    },
    {
      label: "Reenviar",
      key: "3",
      icon: <SendOutlined />,
    },
    {
      label: "Abrir en Mercurio",
      key: "4",
      icon: <FileSearchOutlined />,
    },
  ];

  const tableColumns = [
    { title: "No.", dataIndex: "no", key: "no", width: 50 },
    {
      title: "Fecha de creación",
      dataIndex: "creationDate",
      key: "creationDate",
      sorter: (a: TableData, b: TableData) => a.creationDate.localeCompare(b.creationDate),
    },
    {
      title: "Escritura",
      dataIndex: "escritura",
      key: "escritura",
    },
    { title: "Fecha del documento", dataIndex: "documentDate", key: "documentDate" },
    { title: "Radicado", dataIndex: "radicado", key: "radicado" },
    {
      title: "Protocolista",
      dataIndex: "protocolista",
      key: "protocolista",
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (text: string) =>
        text ? <Tag color="red">{text}</Tag> : <Text type="secondary">Sin observaciones</Text>,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: () => (
        <Dropdown menu={{ items: menuItems }}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Layout>
      <Header />
      <Layout>
        <Sider collapsible style={{ backgroundColor: "#FFF" }}>
          <Sidebar />
        </Sider>
        <Content style={{ padding: "16px" }}>
        <Breadcrumb
  items={[
    { title: 'Inicio' },
    { title: 'Radicados de Rentas' },
  ]}
/>


          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Primera Tarjeta */}
            <Card title={<Title level={5}>Información De Casos Enviados</Title>}>
              <Text>Total de casos: 0</Text>
            </Card>

            {/* Segunda Tarjeta */}
            <Card title={<Title level={5}>Información de Boletas de Rentas Enviadas</Title>}>
              <Table
                columns={tableColumns}
                dataSource={[]} // Sin datos por ahora, a la espera del backend
                pagination={{ pageSize }}
                scroll={{ x: 1000 }}
              />
            </Card>

            {/* Tercera Tarjeta */}
            <Card title={<Title level={5}>Configuración</Title>}>
              <div style={{ marginBottom: "16px" }}>
                <Text>Tamaño del formulario:</Text>
                <Radio.Group
                  onChange={handleFormLayoutChange}
                  value={componentSize}
                  style={{ marginLeft: "8px" }}
                >
                  <Radio value="small">Pequeño</Radio>
                  <Radio value="middle">Mediano</Radio>
                  <Radio value="large">Grande</Radio>
                </Radio.Group>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <Text>Paginación:</Text>
                <InputNumber
                  min={5}
                  max={50}
                  value={pageSize}
                  onChange={(value) => setPageSize(value || 10)}
                  style={{ marginLeft: "8px" }}
                />
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
