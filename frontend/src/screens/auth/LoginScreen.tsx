import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { LoginRequestSchema } from "@/models/Login";
import { useLogin } from "@/services/UserServices";
import styles from "./LoginScreen.module.css";
import { useState } from "react";

export const LoginScreen = () => {
  const { mutate, error } = useLogin();

  // Switch state for user type
  const [userType, setUserType] = useState(() => {
    return localStorage.getItem("loginUserType") || "user";
  });

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked ? "admin" : "user";
    setUserType(value);
    localStorage.setItem("loginUserType", value);
  };

  const formData = useAppForm({
    defaultValues: {
      username: "",
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, gap: 12 }}>
          <span style={{ fontSize: 14, color: userType === "user" ? "#2563eb" : "#64748b" }}>Usuario normal</span>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={userType === "admin"}
              onChange={handleSwitchChange}
              style={{ display: "none" }}
            />
            <span
              style={{
                width: 40,
                height: 22,
                background: userType === "admin" ? "#2563eb" : "#cbd5e1",
                borderRadius: 22,
                position: "relative",
                display: "inline-block",
                transition: "background 0.2s",
                margin: "0 8px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: userType === "admin" ? 20 : 2,
                  top: 2,
                  width: 18,
                  height: 18,
                  background: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  transition: "left 0.2s",
                }}
              />
            </span>
            <span style={{ fontSize: 14, color: userType === "admin" ? "#2563eb" : "#64748b" }}>Admin de canchas</span>
          </label>
        </div>
        <formData.AppForm>
          {error && (
            <div className={styles.errorBanner}>
              <p>Usuario o contraseña incorrectos</p>
            </div>
          )}
          <formData.FormContainer extraError={null}>
            <div className={styles.formGrid}>
              <formData.AppField 
                name="username" 
                children={(field) => <field.TextField label="Username" />} 
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
