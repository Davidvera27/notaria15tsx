import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Tag,
  Modal,
  Switch,
  InputNumber,
  message,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

type TableData = {
  id: number;
  creation_date: string;
  document_date: string;
  escritura: string;
  radicado: string;
  protocolista: string;
  observaciones?: string;
};

export const CaseRentsForm: React.FC = () => {
  const [componentSize, setComponentSize] = useState<"small" | "middle" | "large">("middle");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<TableData[]>([]);

  const handleFormLayoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComponentSize(e.target.value as "small" | "middle" | "large");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const showColumnConfig = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/case-rents");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Error al cargar los datos");
    }
  };

  const addCaseRent = async (values: TableData) => {
    // Validations before sending data to the server
    if (!/^[0-9]+$/.test(values.escritura)) {
      return message.error("El número de escritura solo debe contener caracteres numéricos.");
    }

    if (values.radicado.length < 8 || values.radicado.length > 20) {
      return message.error("El radicado debe tener entre 8 y 20 caracteres.");
    }

    if (new Date(values.document_date) > new Date(values.creation_date)) {
      return message.error("La fecha del documento no puede ser posterior a la fecha de creación.");
    }

    const currentYear = new Date().getFullYear();
    const creationYear = new Date(values.creation_date).getFullYear();
    if (creationYear > currentYear || creationYear < currentYear - 10) {
      return message.error("La fecha de creación debe estar dentro del rango permitido de 10 años.");
    }

    try {
      await axios.post("http://localhost:5000/api/case-rents", values);
      fetchData();
      message.success("Caso agregado correctamente");
    } catch (error: any) {
      if (error.response && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        console.error("Error adding case:", error);
        message.error("Error al agregar el caso");
      }
    }
  };

  const deleteCaseRent = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/case-rents/${id}`);
      fetchData();
      message.success("Caso eliminado correctamente");
    } catch (error) {
      console.error("Error deleting case:", error);
      message.error("Error al eliminar el caso");
    }
  };

  const editCaseRent = async (record: TableData) => {
    try {
      const updatedRecord = { ...record, observaciones: "Actualizado" }; // Ejemplo de actualización
      await axios.put(`http://localhost:5000/api/case-rents/${record.id}`, updatedRecord);
      fetchData();
      message.success("Caso actualizado correctamente");
    } catch (error) {
      console.error("Error updating case:", error);
      message.error("Error al actualizar el caso");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tableColumns = [
    {
      title: "No.",
      dataIndex: "id",
      key: "id",
      fixed: "left" as const,
      width: 50,
    },
    {
      title: "Fecha de creación",
      dataIndex: "creation_date",
      key: "creation_date",
    },
    {
      title: "Escritura",
      dataIndex: "escritura",
      key: "escritura",
    },
    {
      title: "Fecha del documento",
      dataIndex: "document_date",
      key: "document_date",
    },
    {
      title: "Radicado",
      dataIndex: "radicado",
      key: "radicado",
    },
    {
      title: "Protocolista",
      dataIndex: "protocolista",
      key: "protocolista",
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (text: string | undefined) =>
        text ? <Tag color="red">{text}</Tag> : <Text type="secondary">Sin observaciones</Text>,
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right" as const,
      width: 150,
      render: (_: any, record: TableData) => (
        <Space>
          <Button type="link" onClick={() => editCaseRent(record)}>
            Editar
          </Button>
          <Button type="link" onClick={() => deleteCaseRent(record.id)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const onFinish = (values: any) => {
    const formattedValues: TableData = {
      ...values,
      creation_date: values.creation_date.format("YYYY-MM-DD"),
      document_date: values.document_date.format("YYYY-MM-DD"),
    };
    addCaseRent(formattedValues);
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
            <Breadcrumb.Item>Radicados de Rentas</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card title={<Title level={5}>Crear nuevo caso</Title>}>
              <Form layout="vertical" size={componentSize} onFinish={onFinish}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Fecha"
                      name="creation_date"
                      rules={[{ required: true, message: "Seleccione una fecha" }]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Fecha del Documento"
                      name="document_date"
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

            <Card title={<Title level={5}>Información de Radicados de Rentas</Title>}>
              <Table columns={tableColumns} dataSource={data} pagination={{ pageSize }} rowKey="id" />
            </Card>

            <Card title={<Title level={5}>Configuración</Title>}>
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
              <div style={{ marginTop: "16px" }}>
                <Switch
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  checkedChildren="Modo Oscuro"
                  unCheckedChildren="Modo Claro"
                />
              </div>
              <div style={{ marginTop: "16px" }}>
                <Button type="primary" onClick={showColumnConfig}>
                  Configurar Columnas
                </Button>
              </div>
            </Card>
          </div>
          <Modal
            title="Configuración de Columnas"
            visible={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Text>Opciones de columnas próximamente...</Text>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};
