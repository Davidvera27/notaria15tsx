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
  Tag,
  RadioChangeEvent,
  Modal,
  Dropdown,
  Menu,
  Switch,
  InputNumber,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface TableData {
  key: number;
  no: number;
  creationDate: string;
  escritura: string;
  documentDate: string;
  radicado: string;
  protocolista: string;
  observaciones: string;
}

export const CaseRentsForm: React.FC = () => {
  const [componentSize, setComponentSize] = useState<"small" | "default" | "large">("default");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pageSize, setPageSize] = useState(10);

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
  };

  const tableColumns: Array<{
    title: string;
    dataIndex: string;
    key: string;
    fixed?: "left" | "right";
    width?: number;
    sorter?: (a: TableData, b: TableData) => number;
    filters?: { text: string; value: string }[];
    onFilter?: (value: string, record: TableData) => boolean;
    render?: (text: string) => JSX.Element;
  }> = [
    { title: "No.", dataIndex: "no", key: "no", fixed: "left", width: 50 },
    {
      title: "Fecha de creación",
      dataIndex: "creationDate",
      key: "creationDate",
      sorter: (a, b) => a.creationDate.localeCompare(b.creationDate),
    },
    {
      title: "Escritura",
      dataIndex: "escritura",
      key: "escritura",
      sorter: (a, b) => a.escritura.localeCompare(b.escritura),
    },
    { title: "Fecha del documento", dataIndex: "documentDate", key: "documentDate" },
    { title: "Radicado", dataIndex: "radicado", key: "radicado" },
    {
      title: "Protocolista",
      dataIndex: "protocolista",
      key: "protocolista",
      filters: [
        { text: "MERCEDITAS DIONNE PALACIO LOPEZ", value: "MERCEDITAS DIONNE PALACIO LOPEZ" },
        { text: "DAVID POSADA HINCAPIE", value: "DAVID POSADA HINCAPIE" },
        { text: "GLORIA MARY HINCAPIE MONTOYA", value: "GLORIA MARY HINCAPIE MONTOYA" },
      ],
      onFilter: (value: string, record: TableData) => record.protocolista === value,
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (text) =>
        text ? <Tag color="red">{text}</Tag> : <Text type="secondary">Sin observaciones</Text>,
    },
    {
      title: "Acciones",
      dataIndex: "acciones",
      key: "acciones",
      fixed: "right",
      width: 100,
      render: () => (
        <Space>
          <Button type="link">Editar</Button>
          <Button type="link">Eliminar</Button>
        </Space>
      ),
    },
  ];

  const generateRandomData = (count: number): TableData[] => {
    const data: TableData[] = [];
    for (let i = 1; i <= count; i++) {
      data.push({
        key: i,
        no: i,
        creationDate: `2024-08-30 08:54:${i % 60}`,
        escritura: Math.floor(8000 + Math.random() * 2000).toString(),
        documentDate: "02/09/2024",
        radicado: `202401039${i.toString().padStart(3, "0")}`,
        protocolista: [
          "MERCEDITAS DIONNE PALACIO LOPEZ",
          "DAVID POSADA HINCAPIE",
          "GLORIA MARY HINCAPIE MONTOYA",
        ][Math.floor(Math.random() * 3)],
        observaciones: i % 5 === 0 ? "FALTO 1 FIDEICOMISO POR LIQUIDAR" : "",
      });
    }
    return data;
  };

  const tableData = generateRandomData(100);

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
                size={componentSize}
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
              <Table
                columns={tableColumns}
                dataSource={tableData}
                pagination={{ pageSize, total: tableData.length }}
                scroll={{ x: 1300 }}
              />
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
