import React, { useState, useEffect } from "react";
import {
  Layout,
  Breadcrumb,
  Card,
  Form,
  Select,
  InputNumber,
  Table,
  Button,
  Checkbox,
  Typography,
  message,
} from "antd";
import { Sidebar } from "../../Sidebar/Sidebar";
import { Header } from "../../Header/Header";
import axios from "axios";
import { MoreOutlined } from "@ant-design/icons";

const { Content, Sider } = Layout;
const { Title } = Typography;

interface ProtocolistOption {
  value: number;
  label: string;
}

interface TableData {
  escritura: string;
  document_date: string;
  client: string;
  facturas: number;
  facturas_canceladas: string;
  facturas_sin_cancelar: string;
}

export const Registration: React.FC = () => {
  const [protocolistOptions, setProtocolistOptions] = useState<ProtocolistOption[]>([]);
  const [dataSource, setDataSource] = useState<TableData[]>([]);
  const [selectedCase, setSelectedCase] = useState<TableData | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProtocolists = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/protocolist-rents");
        setProtocolistOptions(
          response.data.map((item: { id: number; complete_name: string; last_name: string }) => ({
            value: item.id,
            label: `${item.complete_name} ${item.last_name}`,
          }))
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          message.error("Error al cargar los protocolistas: " + error.message);
        } else {
          message.error("Error desconocido al cargar los protocolistas");
        }
      }
    };
    fetchProtocolists();
  }, []);

  const fetchTableData = async (filters: { protocolista: number; escritura: string; document_year?: number }) => {
    try {
      const response = await axios.post("http://localhost:5000/api/case-rents/filter", filters);
      setDataSource(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        message.error("Error al cargar los datos de la tabla: " + error.message);
      } else {
        message.error("Error desconocido al cargar los datos de la tabla");
      }
    }
  };

  const columns = [
    { title: "Escritura", dataIndex: "escritura", key: "escritura" },
    { title: "Fecha del Documento", dataIndex: "document_date", key: "document_date" },
    { title: "Cliente", dataIndex: "client", key: "client" },
    { title: "Facturas", dataIndex: "facturas", key: "facturas" },
    { title: "Facturas Canceladas", dataIndex: "facturas_canceladas", key: "facturas_canceladas" },
    { title: "Facturas Sin Cancelar", dataIndex: "facturas_sin_cancelar", key: "facturas_sin_cancelar" },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: TableData) => (
        <Button type="link" icon={<MoreOutlined />} onClick={() => setSelectedCase(record)}>
          Acciones
        </Button>
      ),
    },
  ];

  const handleSearch = (values: { protocolista: number; escritura: string; document_year?: number }) => {
    fetchTableData(values);
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
            <Breadcrumb.Item>Gestión Contable</Breadcrumb.Item>
            <Breadcrumb.Item>Registro</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card title={<Title level={5}>Buscar Información</Title>}>
              <Form layout="vertical" form={form} onFinish={handleSearch}>
                <Form.Item
                  label="Protocolista"
                  name="protocolista"
                  rules={[{ required: true, message: "Seleccione un protocolista" }]}
                >
                  <Select options={protocolistOptions.map(option => ({ value: option.value, label: option.label }))} placeholder="Seleccione un protocolista" />
                </Form.Item>
                <Form.Item
                  label="Escritura"
                  name="escritura"
                  rules={[
                    { required: true, message: "Ingrese el número de escritura" },
                    { pattern: /^[0-9]{1,5}$/, message: "Máximo 5 dígitos" },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} maxLength={5} />
                </Form.Item>
                <Form.Item label="Año del Documento" name="document_year">
                <Select placeholder="Seleccione un año">
                    {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                        <Select.Option key={year} value={year}>
                            {year}
                        </Select.Option>
                        );
                    })}
                    </Select>
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Buscar
                </Button>
              </Form>
            </Card>

            <Card title={<Title level={5}>Información de Facturas</Title>}>
              <Table dataSource={dataSource} columns={columns} rowKey="escritura" />
            </Card>

            <Card title={<Title level={5}>Añadir Facturas</Title>}>
              {selectedCase ? (
                <Form layout="vertical">
                  <Form.Item label="Cantidad de Facturas" name="cantidad_facturas">
                    <InputNumber min={1} max={10} />
                  </Form.Item>
                  <Form.Item label="Estado de las Facturas" name="estado_facturas">
                    <Checkbox.Group
                      options={[
                        { label: "Cancelada", value: "cancelada" },
                        { label: "Sin cancelar", value: "sin_cancelar" },
                      ]}
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Añadir Facturas
                  </Button>
                </Form>
              ) : (
                <Typography.Text>Seleccione un caso para añadir facturas.</Typography.Text>
              )}
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
