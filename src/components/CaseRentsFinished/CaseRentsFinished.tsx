import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Breadcrumb,
  Button,
  Card,
  Layout,
  Table,
  Typography,
  Radio,
  InputNumber,
  RadioChangeEvent,
  message,
  Dropdown,
  Tooltip,
  Checkbox,
  Modal,
  Form,
  DatePicker,
  Input,
  Select,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import { MoreOutlined, DeleteOutlined, EditOutlined, MailOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

type TableData = {
  id: number;
  creation_date: string;
  document_date: string;
  escritura: string;
  radicado: string;
  protocolista: {
    id: number;
    complete_name: string;
    last_name: string;
    email: string;
  };
  observaciones?: string;
  status?: string;
};

type Protocolist = {
  id: number;
  complete_name: string;
  last_name: string;
  email: string;
  fullName?: string;
};

export const CaseRentsFinished: React.FC = () => {
  const [componentSize, setComponentSize] = useState<"small" | "middle" | "large">("middle");
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<TableData[]>([]);
  const [protocolistMap, setProtocolistMap] = useState<Record<number, Protocolist>>({});
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "id",
    "creation_date",
    "document_date",
    "escritura",
    "radicado",
    "protocolista_name",
    "protocolista_email",
    "observaciones",
  ]);
  const [isColumnConfigVisible, setIsColumnConfigVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCase, setEditingCase] = useState<TableData | null>(null);
  const [form] = Form.useForm();

  const handleFormLayoutChange = (e: RadioChangeEvent) => {
    setComponentSize(e.target.value);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/case-rents-finished");
      if (Array.isArray(response.data)) {
        setData(response.data);
      } else {
        console.error("Unexpected API Response Format:", response);
        message.error("Error: Datos no tienen el formato esperado.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProtocolists = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/protocolist-rents");
      const formattedMap = response.data.reduce((map: Record<number, Protocolist>, protocolist: Protocolist) => {
        map[protocolist.id] = {
          ...protocolist,
          fullName: `${protocolist.complete_name} ${protocolist.last_name}`,
        };
        return map;
      }, {});
      setProtocolistMap(formattedMap);
    } catch (error) {
      console.error("Error fetching protocolists:", error);
      message.error("Error al cargar los datos de protocolistas.");
    }
  };

  const deleteCase = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/case-rents-finished/${id}`);
      message.success("Caso eliminado correctamente.");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el caso:", error);
      message.error("Error al eliminar el caso.");
    }
  };

  const openEditModal = (record: TableData) => {
    setEditingCase(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      creation_date: dayjs(record.creation_date),
      document_date: dayjs(record.document_date),
      protocolista: record.protocolista.id,
    });
  };

  const updateCase = async (values: Partial<TableData>) => {
    if (!editingCase) return;
    try {
      await axios.put(`http://localhost:5000/api/case-rents-finished/${editingCase.id}`, values);
      message.success("Caso actualizado correctamente.");
      fetchData();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar el caso:", error);
      message.error("Error al actualizar el caso.");
    }
  };

  const sendEmail = async (record: TableData) => {
    const protocolista = protocolistMap[record.protocolista.id];
    if (!protocolista || !protocolista.email) {
      return message.error("El correo del protocolista no fue encontrado.");
    }
    try {
      await axios.post("http://localhost:5000/api/case-rents-finished/send-email", {
        id: record.id,
      });
      message.success(`Correo enviado a ${protocolista.email}`);
    } catch (error) {
      console.error("Error al enviar correo:", error);
      message.error("No se pudo enviar el correo.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchProtocolists();
  }, []);

  const tableColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      visible: visibleColumns.includes("id"),
    },
    {
      title: "Fecha de creación",
      dataIndex: "creation_date",
      key: "creation_date",
      sorter: (a: TableData, b: TableData) => a.creation_date.localeCompare(b.creation_date),
      visible: visibleColumns.includes("creation_date"),
    },
    {
      title: "Fecha del documento",
      dataIndex: "document_date",
      key: "document_date",
      visible: visibleColumns.includes("document_date"),
    },
    {
      title: "Escritura",
      dataIndex: "escritura",
      key: "escritura",
      visible: visibleColumns.includes("escritura"),
    },
    {
      title: "Radicado",
      dataIndex: "radicado",
      key: "radicado",
      visible: visibleColumns.includes("radicado"),
    },
    {
      title: "Nombre del Protocolista",
      key: "protocolista_name",
      render: (_: unknown, record: TableData) =>
        protocolistMap[record.protocolista.id]?.fullName || "Desconocido",
      visible: visibleColumns.includes("protocolista_name"),
    },
    {
      title: "Correo del Protocolista",
      key: "protocolista_email",
      render: (_: unknown, record: TableData) =>
        protocolistMap[record.protocolista.id]?.email || "Desconocido",
      visible: visibleColumns.includes("protocolista_email"),
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (text: string) => <Tooltip title={text}>{text || "Sin observaciones"}</Tooltip>,
      visible: visibleColumns.includes("observaciones"),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, record: TableData) => (
        <Dropdown
          menu={{
            items: [
              {
                label: "Editar",
                key: "edit",
                icon: <EditOutlined />,
                onClick: () => openEditModal(record),
              },
              {
                label: "Eliminar",
                key: "delete",
                icon: <DeleteOutlined />,
                onClick: () => deleteCase(record.id),
              },
              {
                label: "Enviar correo",
                key: "send-email",
                icon: <MailOutlined />,
                onClick: () => sendEmail(record),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ].filter((col) => col.visible);

  return (
    <Layout>
      <Header />
      <Layout>
        <Sider collapsible style={{ backgroundColor: "#FFF" }}>
          <Sidebar />
        </Sider>
        <Content style={{ padding: "16px" }}>
          <Breadcrumb
            items={[{ title: "Inicio" }, { title: "Radicados de Rentas Finalizados" }]}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card title={<Title level={5}>Información de Casos Finalizados</Title>}>
              <Text>Total de casos: {data.length}</Text>
            </Card>

            <Card title={<Title level={5}>Información de Boletas de Rentas Enviadas</Title>}>
              <Table
                loading={loading}
                columns={tableColumns}
                dataSource={data}
                pagination={{ pageSize }}
                scroll={{ x: 1000 }}
                rowKey="id"
              />
            </Card>

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
              <div style={{ marginBottom: "16px" }}>
                <Button type="primary" onClick={() => setIsColumnConfigVisible(true)}>
                  Configurar Columnas
                </Button>
              </div>
            </Card>
          </div>

          <Modal
            title="Configurar Columnas"
            open={isColumnConfigVisible}
            onCancel={() => setIsColumnConfigVisible(false)}
            footer={null}
          >
            <Checkbox.Group
              options={[
                "id",
                "creation_date",
                "document_date",
                "escritura",
                "radicado",
                "protocolista_name",
                "protocolista_email",
                "observaciones",
              ]}
              value={visibleColumns}
              onChange={(selected) => setVisibleColumns(selected as string[])}
            />
          </Modal>

          <Modal
            title="Editar Caso"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => {
                const formattedValues = {
                  ...values,
                  creation_date: values.creation_date
                    ? dayjs(values.creation_date).format("YYYY-MM-DD")
                    : editingCase?.creation_date,
                  document_date: values.document_date
                    ? dayjs(values.document_date).format("YYYY-MM-DD")
                    : editingCase?.document_date,
                };
                updateCase(formattedValues);
              }}
            >
              <Form.Item
                label="Fecha de creación"
                name="creation_date"
                rules={[{ required: true, message: "Seleccione la fecha de creación" }]}
              >
                <DatePicker style={{ width: "100%" }} disabled />
              </Form.Item>

              <Form.Item
                label="Fecha del documento"
                name="document_date"
                rules={[{ required: true, message: "Seleccione la fecha del documento" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Escritura"
                name="escritura"
                rules={[{ required: true, message: "Ingrese el número de escritura" }]}
              >
                <Input placeholder="Ej: 12345" />
              </Form.Item>

              <Form.Item
                label="Radicado"
                name="radicado"
                rules={[{ required: true, message: "Ingrese el número de radicado" }]}
              >
                <Input placeholder="Ej: 20240101234432" />
              </Form.Item>

              <Form.Item
                label="Protocolista"
                name="protocolista"
                rules={[{ required: true, message: "Seleccione un protocolista" }]}
              >
                <Select
                  options={Object.values(protocolistMap).map((protocolist) => ({
                    value: protocolist.id,
                    label: protocolist.fullName,
                  }))}
                />
              </Form.Item>

              <Form.Item label="Observaciones" name="observaciones">
                <Input.TextArea placeholder="Observaciones adicionales (opcional)" />
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
