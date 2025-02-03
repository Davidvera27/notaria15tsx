import React, { useState, useEffect } from "react";
import {
    Layout,
    Table,
    Card,
    Typography,
    Divider,
    Breadcrumb,
    notification,
} from "antd";
import axios from "axios";
import { Sidebar } from "../Sidebar/Sidebar";
import { Header } from "../Header/Header";

const { Content, Sider } = Layout;
const { Title } = Typography;

interface Record {
    id: number;
    book: string;
    creation_date: string;
    month: string;
    initial_deed: string;
    final_deed: string;
    borrowed_book: boolean;
}

export const Reports: React.FC = () => {
    const [allBooks, setAllBooks] = useState<Record[]>([]);
    const [borrowedBooks, setBorrowedBooks] = useState<Record[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all books
                const allBooksResponse = await axios.get("http://localhost:5000/api/records");
                setAllBooks(allBooksResponse.data);

                // Fetch borrowed books
                const borrowedBooksResponse = await axios.get("http://localhost:5000/api/records/borrowed");
                setBorrowedBooks(borrowedBooksResponse.data);
            } catch (error) {
                notification.error({
                    message: "Error",
                    description: "Error fetching data from the database.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const allBooksColumns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Libro", dataIndex: "book", key: "book" },
        { title: "Año", dataIndex: "creation_date", key: "creation_date" },
        { title: "Mes", dataIndex: "month", key: "month" },
        { title: "Escritura Inicial", dataIndex: "initial_deed", key: "initial_deed" },
        { title: "Escritura Final", dataIndex: "final_deed", key: "final_deed" },
        {
            title: "Prestado",
            dataIndex: "borrowed_book",
            key: "borrowed_book",
            render: (borrowed: boolean) => (borrowed ? "Sí" : "No"),
        },
    ];

    const borrowedBooksColumns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Libro", dataIndex: "book", key: "book" },
        { title: "Prestado", dataIndex: "borrowed_book", key: "borrowed_book", render: () => "Sí" },
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
                        items={[{ title: "Inicio" }, { title: "Informes" }]}
                    />
                    <Card title="Informe" bordered={false}>
                        <Title level={4}>Libros Prestados</Title>
                        <Divider />
                        <Table
                            dataSource={borrowedBooks}
                            columns={borrowedBooksColumns}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />

                        <Divider style={{ marginTop: "2rem" }} />

                        <Title level={4}>Todos los Libros</Title>
                        <Divider />
                        <Table
                            dataSource={allBooks}
                            columns={allBooksColumns}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 20 }}
                        />
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};