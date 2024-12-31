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
  Modal,
  Switch,
  InputNumber,
  message,
  RadioChangeEvent,
  Tooltip,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import dayjs from "dayjs";

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
  const [editingCase, setEditingCase] = useState<TableData | null>(null);
  const [form] = Form.useForm();

  const handleFormLayoutChange = (e: RadioChangeEvent) => {
    setComponentSize(e.target.value);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const showColumnConfig = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingCase(null);
    form.resetFields();
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
    try {
      const currentDate = dayjs().format("YYYY-MM-DD");

      if (values.creation_date > currentDate) {
        return message.error("La fecha de creación no es válida.");
      }
      if (values.document_date > currentDate) {
        return message.error("La fecha del documento no es válida.");
      }

      await axios.post("http://localhost:5000/api/case-rents", values);
      fetchData();
      message.success("Caso agregado correctamente");
      form.resetFields(); // Formatear el formulario
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error("Error al agregar el caso.");
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

  const openEditModal = (record: TableData) => {
    setEditingCase(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      creation_date: dayjs(record.creation_date),
      document_date: dayjs(record.document_date),
    });
  };

  interface AxiosError {
    response?: {
      data?: {
        error?: string;
      };
    };
  }

  const updateCaseRent = async (values: Partial<TableData>) => {
    try {
      if (!editingCase) return;

      const changedFields = Object.entries(values).reduce((acc, [key, value]) => {
        const currentValue = editingCase[key as keyof TableData];
        if (currentValue !== undefined && currentValue !== value) {
          acc[key as keyof TableData] = value as never;
        }
        return acc;
      }, {} as Partial<TableData>);

      const observationChanges = Object.entries(changedFields)
        .map(([key, newValue]) => {
          const oldValue = editingCase[key as keyof TableData];
          return `${key}: "${oldValue}" -> "${newValue}"`;
        })
        .join(", ");

      const updatedObservations = editingCase.observaciones
        ? `${editingCase.observaciones} | Cambios: ${observationChanges}`
        : `Cambios: ${observationChanges}`;

      changedFields.observaciones = updatedObservations;

      if (Object.keys(changedFields).length === 0) {
        message.info("No se detectaron cambios para actualizar.");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/case-rents/${editingCase.id}`,
        changedFields
      );
      fetchData();
      message.success("Caso actualizado correctamente");
      handleModalCancel();
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as AxiosError).response === "object" &&
        (error as AxiosError).response?.data?.error
      ) {
        message.error((error as AxiosError).response?.data?.error);
      } else {
        message.error("Error al actualizar el caso.");
      }
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
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: "right" as const,
      width: 150,
      render: (_: unknown, record: TableData) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            Editar
          </Button>
          <Button type="link" onClick={() => deleteCaseRent(record.id)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const onModalFinish = (values: Partial<TableData>) => {
    const formattedValues = {
      ...values,
      creation_date: values.creation_date
        ? dayjs(values.creation_date).format("YYYY-MM-DD")
        : editingCase?.creation_date,
      document_date: values.document_date
        ? dayjs(values.document_date).format("YYYY-MM-DD")
        : editingCase?.document_date,
    };

    updateCaseRent(formattedValues);
  };

  const onFinish = (values: Record<string, unknown>) => {
    const formattedValues: Partial<TableData> = {
      ...values,
      creation_date: values.creation_date
        ? dayjs(values.creation_date as string).format("YYYY-MM-DD")
        : "",
      document_date: values.document_date
        ? dayjs(values.document_date as string).format("YYYY-MM-DD")
        : "",
    };

    addCaseRent(formattedValues as TableData);
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
            <Card title={<Title level={5}>Crear Caso</Title>}>
              <Form
                layout="vertical"
                size={componentSize}
                onFinish={onFinish}
                form={form} // Vincular el formulario
                initialValues={{}}
              >
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
                    Agregar Caso
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
            title="Editar Caso"
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onModalFinish}
            >
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
                  rules={[
                    { required: true, message: "Ingrese el número de escritura" },
                    {
                      pattern: /^[0-9]{1,5}$/,
                      message: "La escritura debe ser un número de hasta 5 dígitos sin caracteres especiales o letras.",
                    },
                  ]}
                >
                  <Input
                    placeholder="Ej: 12345"
                    maxLength={5}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      const sanitizedValue = value.replace(/[^0-9]/g, "");
                      e.target.value = sanitizedValue;
                    }}
                  />
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
