import React, { useState } from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Select,
  Table,
  Typography,
  Radio,
  Space,
  Row,
  Col,
  InputNumber,
  RadioChangeEvent,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface ProtocolistData {
  key: number;
  id: number;
  name: string;
  email: string;
  activeCases: number;
  state: string;
  observations?: string;
}

export const Protocolist: React.FC = () => {
  const [componentSize, setComponentSize] = useState<"small" | "middle" | "large">("middle");
  const [pageSize, setPageSize] = useState<number>(10);
  const [tableData,] = useState<ProtocolistData[]>([]); // Inicialización vacía

  const handleFormLayoutChange = (e: RadioChangeEvent) => {
    setComponentSize(e.target.value as "small" | "middle" | "large");
  };

  const tableColumns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Nombre Completo", dataIndex: "name", key: "name" },
    { title: "Correo Electrónico", dataIndex: "email", key: "email" },
    { title: "Estado", dataIndex: "state", key: "state" },
    { title: "Casos Activos", dataIndex: "activeCases", key: "activeCases" },
    {
      title: "Observaciones",
      dataIndex: "observations",
      key: "observations",
      render: (text: string) => text || "Sin observaciones",
    },
    {
      title: "Acciones",
      key: "actions",
      render: () => (
        <Space>
          <Button type="link">Editar</Button>
          <Button type="link">Eliminar</Button>
        </Space>
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
          <Breadcrumb style={{ marginBottom: "16px" }}>
            <Breadcrumb.Item>Inicio</Breadcrumb.Item>
            <Breadcrumb.Item>Protocolistas</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Primera tarjeta */}
            <Card title={<Title level={5}>Crear nuevo protocolista</Title>}>
              <Form layout="vertical" size={componentSize}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Nombre"
                      name="nombre"
                      rules={[{ required: true, message: "Ingrese el nombre del protocolista" }]}
                    >
                      <Input placeholder="Nombre completo" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Correo Electrónico"
                      name="correo"
                      rules={[{ required: true, message: "Ingrese el correo electrónico" }]}
                    >
                      <Input placeholder="Correo electrónico" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Estado"
                      name="state"
                      rules={[{ required: true, message: "Seleccione el estado" }]}
                    >
                      <Select placeholder="Seleccione el estado">
                        <Option value="Activo">Activo</Option>
                        <Option value="Inactivo">Inactivo</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Observaciones" name="observations">
                      <Input.TextArea placeholder="Observaciones adicionales" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Agregar Protocolista
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Segunda tarjeta */}
            <Card title={<Title level={5}>Protocolistas</Title>}>
              <Table
                columns={tableColumns}
                dataSource={tableData} // Ahora espera datos dinámicos
                pagination={{ pageSize, total: tableData.length }}
                scroll={{ x: 1000 }}
              />
            </Card>

            {/* Tercera tarjeta */}
            <Card title={<Title level={5}>Configuración</Title>}>
              <Text>Número de protocolistas: {tableData.length}</Text>
              <div style={{ marginTop: "16px" }}>
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
              <div style={{ marginTop: "16px" }}>
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
