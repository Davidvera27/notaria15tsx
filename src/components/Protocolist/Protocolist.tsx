import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Table,
  Typography,
  Space,
  Row,
  Col,
  notification,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";

const { Content, Sider } = Layout;
const { Title } = Typography;

interface ProtocolistData {
  id: number;
  complete_name: string;
  last_name: string;
  email: string;
  observations?: string;
  ongoing_case: number;
}


export const Protocolist: React.FC = () => {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<ProtocolistData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data from /api/protocolist-rents...");
      const response = await axios.get<ProtocolistData[]>("http://localhost:5000/api/protocolist-rents");
      console.log("Data fetched successfully:", response.data);
      setTableData(response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching data:", error.message);
        notification.error({
          message: "Error al cargar datos",
          description: error.message || "No se pudo cargar la lista de protocolistas.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values: ProtocolistData) => {
    try {
      await axios.post("http://localhost:5000/api/protocolist-rents", values);
      notification.success({
        message: "Protocolista agregado",
        description: "El nuevo protocolista ha sido agregado exitosamente.",
      });
      form.resetFields();
      fetchData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        notification.error({
          message: "Error",
          description: error.response.data.error,
        });
      } else {
        notification.error({
          message: "Error",
          description: "No se pudo agregar el protocolista.",
        });
      }
    }
  };
  

  const deleteProtocolist = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/protocolist-rents/${id}`);
      notification.success({
        message: "Protocolista eliminado",
        description: "El protocolista ha sido eliminado exitosamente.",
      });
      fetchData();
    } catch {
      notification.error({
        message: "Error",
        description: "No se pudo eliminar el protocolista.",
      });
    }
  };

  const tableColumns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Nombre Completo", dataIndex: "complete_name", key: "complete_name" },
    { title: "Apellidos", dataIndex: "last_name", key: "last_name" },
    { title: "Correo Electrónico", dataIndex: "email", key: "email" },
    { title: "Observaciones", dataIndex: "observations", key: "observations", render: (text: string) => text || "Sin observaciones" },
    { title: "Casos Activos", dataIndex: "ongoing_case", key: "ongoing_case" }, // Proyección de casos activos
    {
      title: "Observaciones",
      dataIndex: "observations",
      key: "observations",
      render: (text: string) => text || "Sin observaciones",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: ProtocolistData) => (
        <Space>
          <Button type="link" onClick={() => deleteProtocolist(record.id)}>
            Eliminar
          </Button>
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
            <Card title={<Title level={5}>Crear nuevo protocolista</Title>}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Nombre Completo"
                      name="complete_name"
                      rules={[
                        { required: true, message: "Ingrese el nombre completo del protocolista" },
                        { min: 3, message: "El nombre debe tener al menos 3 caracteres" },
                        { max: 50, message: "El nombre no puede exceder los 50 caracteres" },
                        {
                          pattern: /^[a-zA-Z\s]+$/,
                          message: "El nombre solo puede contener letras y espacios",
                        },
                      ]}
                    >
                      <Input placeholder="Nombre completo" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Apellidos"
                      name="last_name"
                      rules={[
                        { required: true, message: "Ingrese los apellidos del protocolista" },
                        { min: 3, message: "Los apellidos deben tener al menos 3 caracteres" },
                        { max: 50, message: "Los apellidos no pueden exceder los 50 caracteres" },
                        {
                          pattern: /^[a-zA-Z\s]+$/,
                          message: "Los apellidos solo pueden contener letras y espacios",
                        },
                      ]}
                    >
                      <Input placeholder="Apellidos" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Correo Electrónico"
                      name="email"
                      rules={[
                        { required: true, message: "Ingrese el correo electrónico" },
                        {
                          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Ingrese un correo electrónico válido",
                        },
                        {
                          validator: async (_, value) => {
                            if (value) {
                              const response = await axios.get(
                                `http://localhost:5000/api/protocolist-rents/check-email/${value}`
                              );
                              if (response.data.exists) {
                                throw new Error("Este correo ya está registrado");
                              }
                            }
                          },
                        },
                      ]}
                    >
                      <Input placeholder="Correo electrónico" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Observaciones" name="observations">
                      <Input.TextArea placeholder="Observaciones adicionales (opcional)" />
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

            <Card title={<Title level={5}>Protocolistas</Title>}>
              <Table
                columns={tableColumns}
                dataSource={tableData}
                loading={loading}
                pagination={{ pageSize: 10, total: tableData.length }}
                rowKey="id"
              />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
