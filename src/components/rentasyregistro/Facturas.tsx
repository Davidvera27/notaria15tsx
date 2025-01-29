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
  Select,
} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";

const { Content, Sider } = Layout;
const { Title } = Typography;

// formatiamos los valores a moneda local
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(value);
  };
  
// Opciones de metodo de pago y estado
const metodoPagoOptions = [
  { label: "PSE", value: "pse" },
  { label: "Efectivo", value: "efectivo" },
];

const estadoOptions = [
  { label: "Cancelado", value: "cancelado" },
  { label: "Sin Cancelar", value: "sin cancelar" },
];

interface FacturasData {
  id: number;
  factura: number;  // Ajustamos aquí para usar 'factura'
  valor_rentas: number;
  valor_registro: number;
  metodo_pago: "pse" | "efectivo";
  estado: "cancelado" | "sin cancelar";
  fecha: string;
  escritura: number;
}

  
export const Facturas: React.FC = () => {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [tableData, setTableData] = useState<FacturasData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFactura, setEditingFactura] = useState<FacturasData | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<FacturasData[]>("http://localhost:5000/api/facturas");
      console.log(response.data); // Verifica que los datos están llegando correctamente
      setTableData(response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        notification.error({
          message: "Error al cargar datos",
          description: error.message || "No se pudo cargar la lista de facturas.",
        });
      } else {
        notification.error({
          message: "Error al cargar datos",
          description: "Ocurrió un error desconocido.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values: FacturasData) => {
    // Convertir valores numéricos antes de enviarlos
    const formattedValues = {
      ...values,
      factura_numero: Number(values.factura), // Asegúrate de que 'factura' esté correctamente formateado
      valor_rentas: Number(values.valor_rentas),
      valor_registro: Number(values.valor_registro),
      escritura: Number(values.escritura),
      fecha: values.fecha, // La fecha puede ser un string en el formato adecuado
    };

    console.log(formattedValues); // Verifica los valores que se están enviando
    try {
      await axios.post("http://localhost:5000/api/facturas", formattedValues);
      notification.success({
        message: "Factura agregada",
        description: "La nueva factura ha sido agregada exitosamente.",
      });
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error(error); // Verifica si hay errores
      notification.error({
        message: "Error",
        description: "No se pudo agregar la factura.",
      });
    }
  };

  const deleteFactura = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/facturas/${id}`);
      notification.success({
        message: "Factura eliminada",
        description: "La factura ha sido eliminada exitosamente.",
      });
      fetchData();
    } catch {
      notification.error({
        message: "Error",
        description: "No se pudo eliminar la factura.",
      });
    }
  };

  const openEditModal = (record: FacturasData) => {
    setEditingFactura(record);
    modalForm.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFactura(null);
    modalForm.resetFields();
  };

  const updateFactura = async (values: Partial<FacturasData>) => {
    // Convertir valores numéricos antes de enviarlos
    const formattedValues = {
      ...values,
      factura_numero: Number(values.factura),
      valor_rentas: Number(values.valor_rentas),
      valor_registro: Number(values.valor_registro),
      escritura: Number(values.escritura),
      fecha: values.fecha,
    };

    try {
      if (!editingFactura) return;

      await axios.put(
        `http://localhost:5000/api/facturas/${editingFactura.id}`,
        formattedValues
      );
      notification.success({
        message: "Factura actualizada",
        description: "La factura ha sido actualizada exitosamente.",
      });
      fetchData();
      handleModalCancel();
    } catch {
      notification.error({
        message: "Error",
        description: "No se pudo actualizar la factura.",
      });
    }
  };

  const tableColumns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Número de Factura", dataIndex: "factura", key: "factura" },
    { 
      title: "Valor de Rentas", 
      dataIndex: "valor_rentas", 
      key: "valor_rentas", 
      render: (value: number) => formatCurrency(value),  // Formatear valor
    },
    { 
      title: "Valor de Registro", 
      dataIndex: "valor_registro", 
      key: "valor_registro", 
      render: (value: number) => formatCurrency(value),  // Formatear valor
    },
    { title: "Método de Pago", dataIndex: "metodo_pago", key: "metodo_pago" },
    { title: "Estado", dataIndex: "estado", key: "estado" },
    { title: "Fecha", dataIndex: "fecha", key: "fecha" },
    { title: "Escritura", dataIndex: "escritura", key: "escritura" },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: FacturasData) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>
            Editar
          </Button>
          <Button type="link" onClick={() => deleteFactura(record.id)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];
  

  const handleModalFinish = (values: Partial<FacturasData>) => {
    updateFactura(values);
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
            <Breadcrumb.Item>Facturas</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card className="card-glass" title={<Title level={5}>Crear nueva factura</Title>}>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Número de Factura"
                      name="factura"
                      rules={[{ required: true, message: "Ingrese el número de factura" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Valor de Rentas"
                      name="valor_rentas"
                      rules={[{ required: true, message: "Ingrese el valor de rentas" }]}
                    >
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Valor de Registro"
                      name="valor_registro"
                      rules={[{ required: true, message: "Ingrese el valor de registro" }]}
                    >
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Método de Pago"
                      name="metodo_pago"
                      rules={[{ required: true, message: "Seleccione el método de pago" }]}
                    >
                      <Select options={metodoPagoOptions} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Estado"
                      name="estado"
                      rules={[{ required: true, message: "Seleccione el estado de la factura" }]}
                    >
                      <Select options={estadoOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Fecha"
                      name="fecha"
                      rules={[{ required: true, message: "Ingrese la fecha de la factura" }]}
                    >
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  label="Escritura"
                  name="escritura"
                  rules={[{ required: true, message: "Ingrese el número de escritura" }]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Crear Factura
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <Card className="card-glass" title={<Title level={5}>Facturas</Title>}>
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
            title="Editar Factura"
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <Form form={modalForm} layout="vertical" onFinish={handleModalFinish}>
              <Form.Item
                label="Número de Factura"
                name="factura"
                rules={[{ required: true, message: "Ingrese el número de factura" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Valor de Rentas"
                name="valor_rentas"
                rules={[{ required: true, message: "Ingrese el valor de rentas" }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                label="Valor de Registro"
                name="valor_registro"
                rules={[{ required: true, message: "Ingrese el valor de registro" }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                label="Método de Pago"
                name="metodo_pago"
                rules={[{ required: true, message: "Seleccione el método de pago" }]}
              >
                <Select options={metodoPagoOptions} />
              </Form.Item>
              <Form.Item
                label="Estado"
                name="estado"
                rules={[{ required: true, message: "Seleccione el estado de la factura" }]}
              >
                <Select options={estadoOptions} />
              </Form.Item>
              <Form.Item
                label="Fecha"
                name="fecha"
                rules={[{ required: true, message: "Ingrese la fecha de la factura" }]}
              >
                <Input type="date" />
              </Form.Item>
              <Form.Item
                label="Escritura"
                name="escritura"
                rules={[{ required: true, message: "Ingrese el número de escritura" }]}
              >
                <Input type="number" />
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
