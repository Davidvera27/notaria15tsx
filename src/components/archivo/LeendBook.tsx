import React, { useState } from "react";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";
import {
    Layout,
    Input,
    Button,
    Table,
    Card,
    Space,
    Breadcrumb,
    notification,
} from "antd";
import axios from "axios";

const { Content, Sider } = Layout;

interface Record {
    id: number;
    book: string;
    creation_date: string;
    month: string;
    initial_deed: string;
    final_deed: string;
    borrowed_book: boolean;
}

export const LendBook: React.FC = () => {
    const [searchValue, setSearchValue] = useState<string>("");
    const [filteredData, setFilteredData] = useState<any[]>([]);

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/records/${searchValue}`);
            console.log('Fetched Data:', response.data); 
            setFilteredData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            notification.error({
                message: "Error",
                description: "No se encontraron registros o ocurrió un error.",
            });
        }
    };

    const handleLendBook = async (id: number) => {
        try {
            await axios.patch(`http://localhost:5000/api/records/lend/${id}`); 
            notification.success({
                message: "Éxito",
                description: "El libro ha sido prestado exitosamente.",
            });
            handleSearch(); // Refresh the table data after lending a book
        } catch (error) {
            notification.error({
                message: "Error",
                description: "Ocurrió un error al prestar el libro.",
            });
        }
    };    

    const columns = [
        {
            title: "Prestar Libro",
            dataIndex: "id",
            key: "lend",
            render: (id: number, record: Record) =>
                !record.borrowed_book ? (
                    <Button type="primary" onClick={() => handleLendBook(id)}>
                        Prestar
                    </Button>
                ) : (
                    "Prestado"
                ),
        },
        {
            title: "ID Libro",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Año",
            dataIndex: "creation_date",
            key: "creation_date",
        },
        {
            title: "Mes",
            dataIndex: "month",
            key: "month",
        },
        {
            title: "Escritura Inicial",
            dataIndex: "initial_deed",
            key: "initial_deed",
        },
        {
            title: "Escritura Final",
            dataIndex: "final_deed",
            key: "final_deed",
        },
        {
            title: "Libro prestado",
            dataIndex: "borrowed_book",
            key: "borrowed_book",
            render: (borrowed: boolean) => (borrowed ? "Sí" : "No"),
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
                    <Breadcrumb
                        items={[{ title: "Inicio" }, { title: "Préstamos" }]}
                    />
                    <Card title="Prestar Libro" bordered={false}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Input
                                placeholder="Buscar Escritura"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                style={{ marginBottom: "16px" }}
                            />
                            <Button
                                type="primary"
                                onClick={handleSearch}
                                style={{ marginBottom: "16px" }}
                            >
                                Buscar
                            </Button>
                        </Space>
                        <Table
                            dataSource={filteredData}
                            columns={columns}
                            rowKey="id"
                        />
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};