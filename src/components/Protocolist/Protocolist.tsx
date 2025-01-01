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
  Modal,
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
  const [modalForm] = Form.useForm();
  const [tableData, setTableData] = useState<ProtocolistData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProtocolist, setEditingProtocolist] = useState<ProtocolistData | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ProtocolistData[]>("http://localhost:5000/api/protocolist-rents");
      setTableData(response.data);
    } catch {
      notification.error({
        message: "Error al cargar datos",
        description: "No se pudo cargar la lista de protocolistas.",
      });
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
    } catch {
      notification.error({
        message: "Error",
        description: "No se pudo agregar el protocolista.",
      });
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

  const openEditModal = (record: ProtocolistData) => {
    setEditingProtocolist(record);
    modalForm.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingProtocolist(null);
    modalForm.resetFields();
  };

  const updateProtocolist = async (values: Partial<ProtocolistData>) => {
    try {
      if (!editingProtocolist) return;

      await axios.put(
        `http://localhost:5000/api/protocolist-rents/${editingProtocolist.id}`,
        values
      );
      notification.success({
        message: "Protocolista actualizado",
        description: "El protocolista ha sido actualizado exitosamente.",
      });
      fetchData();
      handleModalCancel();
    } catch {
      notification.error({
        message: "Error",
        description: "No se pudo actualizar el protocolista.",
      });
    }
  };

  const tableColumns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Nombre Completo", dataIndex: "complete_name", key: "complete_name" },
    { title: "Apellidos", dataIndex: "last_name", key: "last_name" },
    { title: "Correo Electrónico", dataIndex: "email", key: "email" },
    { title: "Observaciones", dataIndex: "observations", key: "observations", render: (text: string) => text || "Sin observaciones" },
    { title: "Casos Activos", dataIndex: "ongoing_case", key: "ongoing_case" },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: ProtocolistData) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            Editar
          </Button>
          <Button type="link" onClick={() => deleteProtocolist(record.id)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const handleModalFinish = (values: Partial<ProtocolistData>) => {
    updateProtocolist(values);
  };

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
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Nombre Completo"
                    name="complete_name"
                    rules={[{ required: true, message: "Ingrese el nombre completo del protocolista" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Apellidos"
                    name="last_name"
                    rules={[{ required: true, message: "Ingrese los apellidos del protocolista" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Correo Electrónico"
                    name="email"
                    rules={[{ required: true, type: "email", message: "Ingrese un correo electrónico válido" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Observaciones"
                    name="observations"
                  >
                    <Input.TextArea />
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
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </div>

          <Modal
            title="Editar Protocolista"
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form form={modalForm} layout="vertical" onFinish={handleModalFinish}>
              <Form.Item
                label="Nombre Completo"
                name="complete_name"
                rules={[{ required: true, message: "Ingrese el nombre completo del protocolista" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Apellidos"
                name="last_name"
                rules={[{ required: true, message: "Ingrese los apellidos del protocolista" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Correo Electrónico"
                name="email"
                rules={[{ required: true, message: "Ingrese el correo electrónico" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item label="Observaciones" name="observations">
                <Input.TextArea />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Guardar Cambios
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};
