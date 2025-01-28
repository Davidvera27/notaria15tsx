
import { Row, Col, Typography, Card } from 'antd';

const { Title, Text } = Typography;

const NotariaDetails = () => {
  const dataLibro = {
    libro: '1234',
    folios: '56-78',
    escInicial: '001',
    escFinal: '100',
    primer_acto: {
      fecha: '2025-01-01',
      acto: 'Compra-venta',
      otorgado_por: 'Juan Pérez',
      a_favor_de: 'Ana López',
    },
    segundo_acto: {
      fecha: '2025-01-10',
      acto: 'Donación',
      otorgado_por: 'Carlos Gómez',
      a_favor_de: 'María Martínez',
    },
    tomo: '12',
  };

  return (
    <Card style={{ padding: 16 }}>
      <Row gutter={16} style={{ border: '1px solid black' }}>
        {/* Header */}
        <Col span={24} style={{ borderBottom: '1px solid black', textAlign: 'center', padding: 8 }}>
          <Title level={4}>NOTARÍA 15</Title>
          <Text type="secondary">Fabio Alberto Ortega Márquez</Text>
        </Col>

        {/* LIBRO NRO, CONSTA DE, FOLIOS */}
        <Col xs={8} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>LIBRO NRO</Text>
          <Text>{dataLibro.libro}</Text>
        </Col>
        <Col xs={8} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>CONSTA DE</Text>
        </Col>
        <Col xs={8} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>FOLIOS</Text>
          <Text>{dataLibro.folios}</Text>
        </Col>

        {/* COMPRENDE DE LA ESCRITURA */}
        <Col xs={16} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>COMPRENDE DE LA ESCRITURA NRO</Text>
        </Col>
        <Col xs={8} style={{ border: '1px solid black', padding: 8 }}>
          <Text>{dataLibro.escInicial}</Text>
        </Col>

        {/* DE FECHA, ACTO, OTORGADO POR, A FAVOR DE */}
        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>DE FECHA</Text>
          <Text>{dataLibro?.primer_acto?.fecha}</Text>
        </Col>
        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>ACTO</Text>
          <Text>{dataLibro?.primer_acto?.acto}</Text>
        </Col>

        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>OTORGADO POR</Text>
          <Text>{dataLibro?.primer_acto?.otorgado_por}</Text>
        </Col>
        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>A FAVOR DE</Text>
          <Text>{dataLibro?.primer_acto?.a_favor_de}</Text>
        </Col>

        <Col xs={24} style={{ border: '1px solid black', padding: 16 }} />

        {/* Segunda escritura */}
        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>A LA ESCRITURA NRO</Text>
          <Text>{dataLibro?.escFinal}</Text>
        </Col>
        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>DE FECHA</Text>
          <Text>{dataLibro?.segundo_acto?.fecha}</Text>
        </Col>

        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>ACTO</Text>
          <Text>{dataLibro?.segundo_acto?.acto}</Text>
        </Col>
        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>OTORGADO POR</Text>
          <Text>{dataLibro?.segundo_acto?.otorgado_por}</Text>
        </Col>
        <Col xs={12} style={{ border: '1px solid black', padding: 8 }}>
          <Text strong>A FAVOR DE</Text>
          <Text>{dataLibro?.segundo_acto?.a_favor_de}</Text>
        </Col>

        {/* TOMO */}
        <Col xs={24} style={{ border: '1px solid black', padding: 8, textAlign: 'center' }}>
          <Text strong>TOMO</Text>
          <Text>{dataLibro?.tomo}</Text>
        </Col>
      </Row>
    </Card>
  );
};

export default NotariaDetails;
