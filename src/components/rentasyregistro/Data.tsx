import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Breadcrumb,
  Card,
  Layout,
  Table,
  Typography,
  notification,

} from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
// Asumiendo que la función de formato está en utils

const { Content, Sider } = Layout;
const { Title } = Typography;

interface FacturaTotales {
  escritura: number;
  total_valor_factura: number;
  total_facturas: number;
  total_valor_rentas: number;
  total_valor_registro: number;
  total_valor_factura_sin_cancelar: number;
  total_valor_factura_cancelado: number;
}

// formatiamos los valores a moneda local
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(value);
};

export const Data: React.FC = () => {
  const [tableData, setTableData] = useState<FacturaTotales[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<FacturaTotales[]>("http://localhost:5000/api/facturas_totales");
      setTableData(response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        notification.error({
          message: "Error al cargar datos",
          description: error.message || "No se pudo cargar los totales de facturas.",
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

  const tableColumns = [
    { title: "Escritura", dataIndex: "escritura", key: "escritura" },
    {
      title: "Total Valor Factura",
      dataIndex: "total_valor_factura",
      key: "total_valor_factura",
      render: (value: number) => formatCurrency(value), // Formatear valor
    },
    { title: "Total Facturas", dataIndex: "total_facturas", key: "total_facturas" },
    {
      title: "Total Valor Rentas",
      dataIndex: "total_valor_rentas",
      key: "total_valor_rentas",
      render: (value: number) => formatCurrency(value), // Formatear valor
    },
    {
      title: "Total Valor Registro",
      dataIndex: "total_valor_registro",
      key: "total_valor_registro",
      render: (value: number) => formatCurrency(value), // Formatear valor
    },
    {
      title: "Total Valor Factura Sin Cancelar",
      dataIndex: "total_valor_factura_sin_cancelar",
      key: "total_valor_factura_sin_cancelar",
      render: (value: number) => formatCurrency(value), // Formatear valor
    },
    {
      title: "Total Valor Factura Cancelado",
      dataIndex: "total_valor_factura_cancelado",
      key: "total_valor_factura_cancelado",
      render: (value: number) => formatCurrency(value), // Formatear valor
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
            <Breadcrumb.Item>Facturas</Breadcrumb.Item>
            <Breadcrumb.Item>Totales</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card className="card-glass" title={<Title level={5}>Totales de Facturas</Title>}>
              <Table
                columns={tableColumns}
                dataSource={tableData}
                loading={loading}
                rowKey="escritura"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
