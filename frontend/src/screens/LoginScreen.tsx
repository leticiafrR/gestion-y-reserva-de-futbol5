import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { LoginRequestSchema } from "@/models/Login";
import { useLogin } from "@/services/UserServices";
import "./LoginScreen.css";

export const LoginScreen = () => {
  const { mutate, error } = useLogin();

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
      <div className="login-container">
        <h1 className="login-title">Log In</h1>
        <formData.AppForm>
          <formData.FormContainer extraError={error}>
            <div className="form-grid">
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
      </div>
    </CommonLayout>
  );
};
