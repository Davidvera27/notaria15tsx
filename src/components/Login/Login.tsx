import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Tabs, Form, Input, Button, Typography, Flex, notification } from "antd";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const registerSchema = loginSchema.extend({
  firstName: z.string().nonempty("El primer nombre es obligatorio"),
  middleName: z.string().optional(),
  lastName: z.string().nonempty("El apellido es obligatorio"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export const Login = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginValues | RegisterValues>({
    resolver: zodResolver(activeTab === "login" ? loginSchema : registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      middleName: "",
    },
  });

  const handleTabSwitch = (key: string) => {
    setActiveTab(key as "login" | "register");
    reset();
  };

  const onSubmit = async (data: unknown) => {
    if (activeTab === "login") {
      try {
        const response = await axios.post("http://localhost:4000/api/login", data);
        const { token, user } = response.data;

        // Guardar el token y la fecha de expiración en localStorage
        localStorage.setItem("token", token);
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 8); // Establece la expiración del token en 8 horas
        localStorage.setItem("tokenExpiration", expirationDate.toISOString());

        notification.success({
          message: "Inicio de sesión exitoso",
          description: `Bienvenido, ${user.complete_name}`,
        });

        // Redirige al usuario a la página deseada
        navigate("/home");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error || "Ocurrió un error inesperado.";

        notification.error({
          message: "Error de inicio de sesión",
          description: errorMessage,
        });
      }
    } else {
      console.log("Registro de usuario:", data);
      // Aquí puedes agregar el endpoint para registrar usuarios
    }
  };

  // Verificación del token antes de renderizar el componente
  const verifyToken = () => {
    const token = localStorage.getItem("token");
    const tokenExpiration = localStorage.getItem("tokenExpiration");

    if (!token || !tokenExpiration) {
      return false;
    }

    const expirationDate = new Date(tokenExpiration);
    const currentDate = new Date();

    if (currentDate > expirationDate) {
      // Token expirado, eliminarlo
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      return false;
    }

    return true;
  };

  if (!verifyToken()) {
    navigate("/login"); // Redirige al login si el token está expirado o no existe
  }

  return (
    <Flex
      vertical
      style={{
        minHeight: "100vh",
        justifyContent: "center",
        margin: "0 auto",
        maxWidth: 400,
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleTabSwitch}
        items={[
          { key: "login", label: "Iniciar sesión" },
          { key: "register", label: "Registrar" },
        ]}
      />
      <Form
        onFinish={handleSubmit(onSubmit)}
        layout="vertical"
        style={{ marginTop: "1rem" }}
      >
        {activeTab === "register" && (
          <>
            <Form.Item
              label="Primer Nombre"
              validateStatus={
                (errors as FieldErrors<RegisterValues>).firstName ? "error" : ""
              }
              help={
                (errors as FieldErrors<RegisterValues>).firstName?.message && (
                  <Text type="danger">
                    {(errors as FieldErrors<RegisterValues>).firstName?.message}
                  </Text>
                )
              }
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="input"
                    prefix={<UserOutlined />}
                    placeholder="Primer Nombre"
                  />
                )}
              />
            </Form.Item>
            <Form.Item label="Segundo Nombre (opcional)">
              <Controller
                name="middleName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="input"
                    prefix={<UserOutlined />}
                    placeholder="Segundo Nombre"
                  />
                )}
              />
            </Form.Item>
            <Form.Item
              label="Apellidos"
              validateStatus={
                (errors as FieldErrors<RegisterValues>).lastName ? "error" : ""
              }
              help={
                (errors as FieldErrors<RegisterValues>).lastName?.message && (
                  <Text type="danger">
                    {(errors as FieldErrors<RegisterValues>).lastName?.message}
                  </Text>
                )
              }
            >
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="input"
                    prefix={<UserOutlined />}
                    placeholder="Apellidos"
                  />
                )}
              />
            </Form.Item>
          </>
        )}
        <Form.Item
          label="Correo Electrónico"
          validateStatus={errors.email ? "error" : ""}
          help={
            errors.email?.message && (
              <Text type="danger">{errors.email.message}</Text>
            )
          }
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                className="input"
                prefix={<UserOutlined />}
                placeholder="Correo Electrónico"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Contraseña"
          validateStatus={errors.password ? "error" : ""}
          help={
            errors.password?.message && (
              <Text type="danger">{errors.password.message}</Text>
            )
          }
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                className="input"
                prefix={<LockOutlined />}
                placeholder="Contraseña"
              />
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            className="main-button"
            style={{ marginTop: "1rem" }}
          >
            {activeTab === "login" ? "Iniciar sesión" : "Registrar"}
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
};
