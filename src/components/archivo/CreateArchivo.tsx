import React, { useState, useRef } from "react";
import {
  Breadcrumb,
  Button,
  Card,
  Layout,
  Form,
  Input,
  DatePicker,
  message,
  Select,
  Typography,
} from "antd";
import axios from "axios";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

const { Content, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

export const CreateArchivo: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      setQrCodeData(values.book);

      const response = await axios.post("http://localhost:5000/api/create-record", values);
      message.success("Archivo creado exitosamente con ID: " + response.data.id);

      form.resetFields();
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error("Ocurrió un error al crear el archivo. Inténtalo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (qrCodeRef.current) {
      try {
        const dataUrl = await toPng(qrCodeRef.current);
        const link = document.createElement("a");
        link.download = "qr-code.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error generating QR code image:", error);
        message.error("No se pudo descargar el código QR. Por favor inténtalo nuevamente.");
      }
    }
  };

  return (
    <Layout>
      <Header />
      <Layout>
        <Sider collapsible style={{ backgroundColor: "#FFF" }}>
          <Sidebar />
        </Sider>
        <Content style={{ padding: "16px" }}>
          <Breadcrumb
            items={[{ title: "Inicio" }, { title: "Crear Archivo" }]}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "space-between",
                }}
            >
                <Card title={<Title level={5}>Crear Registro</Title>} style={{ flex: 1 }} >
                  <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Card title="Registrar inventario">
                      <Form.Item
                        label="Tomo *"
                        name="volume"
                        rules={[{ required: true, message: "Ingrese el tomo del libro" }]}
                      >
                        <Input placeholder="Tomo" />
                      </Form.Item>
                      <Form.Item
                        label="Libro *"
                        name="book"
                        rules={[{ required: true, message: "Ingrese el libro" }]}
                      >
                        <Input placeholder="Libro" />
                      </Form.Item>
                      <Form.Item
                        label="Escritura Inicial"
                        name="initial_deed"
                        rules={[{ required: true, message: "Ingresar escritura inicial" }]}
                      >
                        <Input placeholder="Ingresar escritura inicial *" />
                      </Form.Item>
                      <Form.Item
                        label="Escritura Final"
                        name="final_deed"
                        rules={[{ required: true, message: "Ingresar escritura final" }]}
                      >
                        <Input placeholder="Ingresar escritura final *" />
                      </Form.Item>
                      <Form.Item
                        label="Folios"
                        name="fol"
                        rules={[{ required: true, message: "Ingresar folios" }]}
                      >
                        <Input placeholder="Ingresar folios *" />
                      </Form.Item>
                      <Form.Item
                        label="Mes:"
                        name="month"
                        rules={[{ required: true, message: "Ingresar mes de otorgación" }]}
                      >
                        <Select placeholder="Seleccionar">
                          <Option value="enero">Enero</Option>
                          <Option value="febrero">Febrero</Option>
                          <Option value="marzo">Marzo</Option>
                          <Option value="abril">Abril</Option>
                          <Option value="mayo">Mayo</Option>
                          <Option value="junio">Junio</Option>
                          <Option value="julio">Julio</Option>
                          <Option value="agosto">Agosto</Option>
                          <Option value="septiembre">Septiembre</Option>
                          <Option value="octubre">Octubre</Option>
                          <Option value="noviembre">Noviembre</Option>
                          <Option value="diciembre">Diciembre</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label="Año de creación"
                        name="creation_date"
                        rules={[{ required: true, message: "Seleccione la fecha de creación" }]}
                      >
                        <Input placeholder="Año *" />
                      </Form.Item>
                    </Card>

                    <Card title="Primer Acto">
                      <Form.Item
                        label="Acto"
                        name="first_acto"
                        rules={[{ required: true, message: "Acto *" }]}
                      >
                        <Input placeholder="Ingresa el primer acto *" />
                      </Form.Item>

                      <Form.Item
                        label="Otorgado por:"
                        name="first_grantor"
                        rules={[{ required: true, message: "Persona que otorga" }]}
                      >
                        <Input placeholder="Persona que otorga *" />
                      </Form.Item>

                      <Form.Item
                        label="A favor de:"
                        name="first_receiver"
                        rules={[{ required: true, message: "Persona a quien se otorga" }]}
                      >
                        <Input placeholder="Persona a quien se otorga *" />
                      </Form.Item>

                      <Form.Item
                        label="Fecha"
                        name="first_acto_date"
                        rules={[{ required: true, message: "Seleccione la fecha del Acto" }]}
                      >
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Card>

                    <Card title="Segundo Acto">
                      <Form.Item
                        label="Acto"
                        name="second_acto"
                        rules={[{ required: true, message: "Acto *" }]}
                      >
                        <Input placeholder="Ingresa el segundo acto *" />
                      </Form.Item>

                      <Form.Item
                        label="Otorgado por:"
                        name="second_grantor"
                        rules={[{ required: true, message: "Persona que otorga" }]}
                      >
                        <Input placeholder="Persona que otorga *" />
                      </Form.Item>

                      <Form.Item
                        label="A favor de:"
                        name="second_receiver"
                        rules={[{ required: true, message: "Persona a quien se otorga" }]}
                      >
                        <Input placeholder="Persona a quien se otorga *" />
                      </Form.Item>

                      <Form.Item
                        label="Fecha"
                        name="second_acto_date"
                        rules={[{ required: true, message: "Seleccione la fecha del Acto" }]}
                      >
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Card>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        Crear Archivo
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>

                <Card
                  title={<Title level={5}>Código QR</Title>}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "16px",
                  }}
                >
                  {qrCodeData ? (
                    <>
                      {/* QR Code container */}
                      <div ref={qrCodeRef} style={{ textAlign: "center" }}>
                        <QRCode value={qrCodeData} size={150} />
                      </div>
                  
                      {/* Download button */}
                      <Button
                        type="primary"
                        style={{ marginTop: "16px" }}
                        onClick={handleDownload}
                      >
                        Descargar QR
                      </Button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", color: "#AAA" }}>
                      <p>Aquí se mostrará el QR generado.</p>
                    </div>
                  )}
                </Card>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};