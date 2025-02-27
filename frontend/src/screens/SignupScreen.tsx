import { useMutation } from "@tanstack/react-query";

import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { LoginRequest, LoginRequestSchema } from "@/models/Login";
import { useToken } from "@/services/TokenContext";
import { signup } from "@/services/UserServices";

export const SignupScreen = () => {
  const [, setToken] = useToken();

  const { mutate, error } = useMutation({
    mutationFn: async (req: LoginRequest) => {
      const tokenData = await signup(req);
      setToken({ state: "LOGGED_IN", ...tokenData });
    },
  });

  const formData = useAppForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onChange: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => mutate(value),
  });

  return (
    <CommonLayout>
      <h1>Sign Up</h1>
      <formData.AppForm>
        <formData.AppField name="username" children={(field) => <field.TextField label="Username" />} />
        <formData.AppField name="password" children={(field) => <field.PasswordField label="Password" />} />
        <formData.SubmitButton />
      </formData.AppForm>
      {JSON.stringify(error?.message, null, 4)}
    </CommonLayout>
  );
};
