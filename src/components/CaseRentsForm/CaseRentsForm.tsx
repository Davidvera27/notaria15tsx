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
  DatePicker,
  Radio,
  Space,
  Row,
  Col,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export const CaseRentsForm: React.FC = () => {
  const [componentSize, setComponentSize] = useState("default");

  const handleFormLayoutChange = (e: any) => {
    setComponentSize(e.target.value);
  };

  const tableColumns = [
    { title: "No.", dataIndex: "no", key: "no" },
    { title: "Fecha de creación", dataIndex: "creationDate", key: "creationDate" },
    { title: "Escritura", dataIndex: "escritura", key: "escritura" },
    { title: "Fecha del documento", dataIndex: "documentDate", key: "documentDate" },
    { title: "Radicado", dataIndex: "radicado", key: "radicado" },
    { title: "Protocolista", dataIndex: "protocolista", key: "protocolista" },
    { title: "Observaciones", dataIndex: "observaciones", key: "observaciones" },
    {
      title: "Acciones",
      key: "acciones",
      render: () => (
        <Space>
          <Button type="link">Editar</Button>
          <Button type="link">Eliminar</Button>
        </Space>
      ),
    },
  ];

  const tableData: any[] = []; // Datos vacíos para la tabla

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
            <Breadcrumb.Item>Radicados de Rentas</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Primera tarjeta */}
            <Card title={<Title level={5}>Crear nuevo caso</Title>}>
              <Form
                layout="vertical"
                size={componentSize as any}
                style={{ maxWidth: "100%" }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Fecha"
                      name="fecha"
                      rules={[{ required: true, message: "Seleccione una fecha" }]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Fecha del Documento"
                      name="fechaDocumento"
                      rules={[{ required: true, message: "Seleccione la fecha del documento" }]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Escritura"
                      name="escritura"
                      rules={[{ required: true, message: "Ingrese el número de escritura" }]}
                    >
                      <Input placeholder="Ej: 12345" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Radicado"
                      name="radicado"
                      rules={[{ required: true, message: "Ingrese el radicado" }]}
                    >
                      <Input placeholder="Ej: 20240101234432" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Protocolista"
                      name="protocolista"
                      rules={[{ required: true, message: "Seleccione un protocolista" }]}
                    >
                      <Select placeholder="Seleccione un protocolista">
                        <Option value="Protocolista 1">Protocolista 1</Option>
                        <Option value="Protocolista 2">Protocolista 2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Observaciones" name="observaciones">
                      <Input.TextArea placeholder="Observaciones adicionales (opcional)" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Agregar
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Segunda tarjeta */}
            <Card title={<Title level={5}>Información de Radicados de Rentas</Title>}>
              <Table columns={tableColumns} dataSource={tableData} pagination={{ pageSize: 5 }} />
            </Card>

            {/* Tercera tarjeta */}
            <Card title={<Title level={5}>Configuración</Title>}>
              <Text>Número de casos: {tableData.length}</Text>
              <div style={{ marginTop: "16px" }}>
                <Text>Tamaño del formulario:</Text>
                <Radio.Group
                  onChange={handleFormLayoutChange}
                  value={componentSize}
                  style={{ marginLeft: "8px" }}
                >
                  <Radio value="small">Pequeño</Radio>
                  <Radio value="default">Mediano</Radio>
                  <Radio value="large">Grande</Radio>
                </Radio.Group>
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};