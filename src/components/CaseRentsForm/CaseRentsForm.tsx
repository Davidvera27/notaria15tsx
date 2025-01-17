import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  Spin,
  Input,
  Layout,
  Select,
  Table,
  Typography,
  DatePicker,
  Radio,
  Row,
  Col,
  Modal,
  Switch,
  InputNumber,
  Checkbox,
  message,
  RadioChangeEvent,
  Tooltip,
  Dropdown,
} from "antd";
import { EllipsisOutlined, LoadingOutlined } from "@ant-design/icons";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import dayjs from "dayjs";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

type TableData = {
  id: number;
  creation_date: string;
  document_date: string;
  escritura: string;
  radicado: string;
  protocolista: string;
  observaciones?: string;
  status: string; // Propiedad agregada
};

type Protocolist = {
  id: number;
  complete_name: string;
  last_name: string;
  email: string;
};

export const CaseRentsForm: React.FC = () => {
  const [componentSize, setComponentSize] = useState<"small" | "middle" | "large">("middle");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isColumnConfigVisible, setIsColumnConfigVisible] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<TableData[]>([]);
  const [protocolistOptions, setProtocolistOptions] = useState([]);
  const [editingCase, setEditingCase] = useState<TableData | null>(null);
  const [protocolistMap, setProtocolistMap] = useState<Record<number, { fullName: string; email: string }>>({});
  const [isSending, setIsSending] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(["id", "creation_date", "escritura", "document_date", "radicado", "protocolista_fullName", "protocolista_email", "observaciones"]);
  const [form] = Form.useForm();

  const handleFormLayoutChange = (e: RadioChangeEvent) => {
    setComponentSize(e.target.value);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const showColumnConfig = () => {
    setIsColumnConfigVisible(true);
  };

  const handleColumnConfigCancel = () => {
    setIsColumnConfigVisible(false);
  };

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({ creation_date: dayjs() });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingCase(null);
    form.resetFields();
  };

  
  const fetchData = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/case-rents");
        const filteredData = response.data.filter((caseItem: TableData) => caseItem.status === "in_progress");
        setData(filteredData);
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
      resetForm();
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
      protocolista: record.protocolista,
    });
  };

  const sendEmailAndMoveCase = async (record: TableData) => {
    const protocolistaId = Number(record.protocolista);
    const protocolista = protocolistMap[protocolistaId];
  
    if (!protocolista || !protocolista.email) {
      return message.error("El correo del protocolista no fue encontrado. Verifique los datos.");
    }
  
    setIsSending(true);
  
    try {
      // Paso 1: Enviar el correo electrónico
      const emailResponse = await axios.post("http://localhost:5000/api/send-email", {
        to: protocolista.email,
        subject: "Notificación de Caso",
        text: `Estimado(a) ${protocolista.fullName}, se le informa sobre un nuevo caso asignado:
               - Número de escritura: ${record.escritura}
               - Número de radicado: ${record.radicado}
               - Fecha del documento: ${record.document_date}`,
      });
  
      if (emailResponse.status === 200) {
        // Paso 2: Actualizar el estado del caso en la base de datos
        const updateResponse = await axios.post("http://localhost:5000/api/case-rents/move-to-finished", {
          caseId: record.id,
        });
  
        if (updateResponse.status === 200) {
          message.success(`Caso actualizado correctamente. Correo enviado a ${protocolista.email}`);
          fetchData(); // Actualizar la lista de casos
        } else {
          throw new Error("Error al actualizar el estado del caso.");
        }
      } else {
        throw new Error("Error al enviar el correo.");
      }
    } catch (error) {
      console.error("Error al enviar correo o actualizar el estado:", error);
      message.error("Error al intentar enviar el correo o actualizar el estado.");
    } finally {
      setIsSending(false);
    }
  };
  
  

  const tableColumns = [
    {
      title: "No.",
      dataIndex: "id",
      key: "id",
      fixed: "left" as const,
      width: 50,
      visible: visibleColumns.includes("id"),
    },
    {
      title: "Fecha de creación",
      dataIndex: "creation_date",
      key: "creation_date",
      visible: visibleColumns.includes("creation_date"),
    },
    {
      title: "Escritura",
      dataIndex: "escritura",
      key: "escritura",
      visible: visibleColumns.includes("escritura"),
    },
    {
      title: "Fecha del documento",
      dataIndex: "document_date",
      key: "document_date",
      visible: visibleColumns.includes("document_date"),
    },
    {
      title: "Radicado",
      dataIndex: "radicado",
      key: "radicado",
      visible: visibleColumns.includes("radicado"),
    },
    {
      title: "Nombre del Protocolista",
      key: "protocolista_fullName",
      visible: visibleColumns.includes("protocolista_fullName"),
      render: (_: unknown, record: TableData) =>
        protocolistMap[Number(record.protocolista)]?.fullName || "Desconocido",
    },
    {
      title: "Correo del Protocolista",
      key: "protocolista_email",
      visible: visibleColumns.includes("protocolista_email"),
      render: (_: unknown, record: TableData) =>
        protocolistMap[Number(record.protocolista)]?.email || "Desconocido",
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      ellipsis: true,
      visible: visibleColumns.includes("observaciones"),
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
      width: 100,
      visible: true,
      render: (_: unknown, record: TableData) => (
        <Dropdown
          menu={{
            items: [
              { label: "Editar", key: "edit", onClick: () => openEditModal(record) },
              { label: "Eliminar", key: "delete", onClick: () => deleteCaseRent(record.id) },
              {
                label: (
                  <>
                    {isSending ? (
                      <LoadingOutlined style={{ marginRight: 8 }} />
                    ) : null}
                    Enviar correo
                  </>
                ),
                key: "send-email",
                onClick: () => sendEmailAndMoveCase(record),
                disabled: isSending,
              },
            ],
          }}
        >
          <Button className="button-animate" type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ].filter((col) => col.visible);

  useEffect(() => {
    fetchData();
    const fetchProtocolists = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/protocolist-rents");
        const formattedOptions = response.data.map((protocolist: Protocolist) => ({
          value: protocolist.id,
          label: `${protocolist.complete_name} ${protocolist.last_name}`,
        }));
        const protocolistMap = response.data.reduce((map: Record<number, { fullName: string; email: string }>, protocolist: Protocolist) => {
          map[protocolist.id] = {
            fullName: `${protocolist.complete_name} ${protocolist.last_name}`,
            email: protocolist.email,
          };
          return map;
        }, {});
        setProtocolistOptions(formattedOptions);
        setProtocolistMap(protocolistMap);
      } catch (error) {
        console.error("Error fetching protocolists:", error);
        message.error("Error al cargar los protocolistas");
      }
    };

    fetchProtocolists();
  }, []);

  const updateCaseRent = async (values: Partial<TableData>) => {
    try {
      if (!editingCase) return;

      const response = await axios.put(
        `http://localhost:5000/api/case-rents/${editingCase.id}`,
        values
      );

      console.log("Respuesta del servidor:", response.data);

      message.success("Caso actualizado correctamente");
      fetchData();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar el caso:", error);
      message.error("Error al actualizar el caso");
    }
  };

  return (
    <Spin
      spinning={isSending}
      tip="Enviando correo..."
      indicator={<div className="spinner" />}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
      }}
    >
      <Layout>
        <Header />
        <Layout>
          <Sider collapsible style={{ backgroundColor: "#FFF" }}>
            <Sidebar />
          </Sider>
          <Content style={{ padding: "16px" }}>
            <Breadcrumb
              items={[
                { title: "Inicio" },
                { title: "Radicados de Rentas" },
              ]}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card className="card-glass" title={<Title level={5}>Crear Caso</Title>}>
                <Form
                  layout="vertical"
                  size={componentSize}
                  onFinish={(values) => {
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
                  }}
                  form={form}
                  initialValues={{ creation_date: dayjs() }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Fecha"
                        name="creation_date"
                        initialValue={dayjs()}
                        rules={[{ required: true, message: "Seleccione una fecha" }]}
                      >
                        <DatePicker style={{ width: "100%" }} disabled />
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
                        <Select placeholder="Seleccione un protocolista" options={protocolistOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Observaciones" name="observaciones">
                        <Input.TextArea placeholder="Observaciones adicionales (opcional)" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                  <Button className="button-animate" type="primary" htmlType="submit">
                      Agregar Caso
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <Card className="card-glass" title={<Title level={5}>Información de Radicados de Rentas</Title>}>
                <Table columns={tableColumns} dataSource={data} pagination={{ pageSize }} rowKey="id" />
              </Card>

              <Card className="card-glass" title={<Title level={5}>Configuración</Title>}>
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
                <Button className="button-animate" type="primary" onClick={showColumnConfig}>
                  Configurar Columnas
                </Button>
              </div>
            </Card>
          </div>
          <Modal
            title="Configurar Columnas"
            open={isColumnConfigVisible}
            onCancel={handleColumnConfigCancel}
            footer={null}
          >
            <Checkbox.Group
              options={[
                "id",
                "creation_date",
                "escritura",
                "document_date",
                "radicado",
                "protocolista_fullName",
                "protocolista_email",
                "observaciones",
              ]}
              value={visibleColumns}
              onChange={(selectedColumns) => setVisibleColumns(selectedColumns as string[])}
            />
          </Modal>

          <Modal
            title="Editar Caso"
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={(values: Partial<TableData>) => {
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
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Fecha"
                    name="creation_date"
                    initialValue={dayjs()}
                    rules={[{ required: true, message: "Seleccione una fecha" }]}
                  >
                    <DatePicker style={{ width: "100%" }} disabled />
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
                        message: "La escritura debe ser un número de hasta 5 dígitos.",
                      },
                    ]}
                  >
                    <Input maxLength={5} />
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
                      <Select
                        placeholder="Seleccione un protocolista"
                        options={protocolistOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Observaciones"
                      name="observaciones"
                    >
                      <Input.TextArea placeholder="Observaciones adicionales (opcional)" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button className="button-animate" type="primary" htmlType="submit">
                    Guardar Cambios
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </Layout>
      </Spin>
    );
  };
  
