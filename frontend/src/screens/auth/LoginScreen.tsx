import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { LoginRequestSchema } from "@/models/Login";
import { useLogin } from "@/services/UserServices";
import styles from "./LoginScreen.module.css";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToken } from "@/services/TokenContext";

export const LoginScreen = () => {
  const { mutate, error } = useLogin();
  const [, setLocation] = useLocation();
  const [token] = useToken();

  const formData = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => mutate(value),
  });

  return (
    <CommonLayout>
      <div className={styles.loginContainer}>
        <h1 className={styles.loginTitle}>Log In</h1>
        <formData.AppForm>
          {error && (
            <div className={styles.errorBanner}>
              <p>Usuario o contraseña incorrectos</p>
            </div>
          )}
          <formData.FormContainer extraError={null}>
            <div className={styles.formGrid}>
              <formData.AppField 
                name="email" 
                children={(field) => <field.TextField label="Email" />} 
              />
              <formData.AppField 
                name="password" 
                children={(field) => <field.PasswordField label="Password" />} 
              />
            </div>
          </formData.FormContainer>
        </formData.AppForm>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button type="button" style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer" }} onClick={() => window.location.href = "/signup"}>
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </div>
    </CommonLayout>
  );
};
