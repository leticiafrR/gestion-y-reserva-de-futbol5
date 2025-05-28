import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { SignupRequestSchema} from "@/models/Signup";
import { useSignup } from "@/services/SignupServices";
import "./SignupScreen.css";

export const SignupScreen = () => {
  const { mutate, error} = useSignup();

  const formData = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      photo: undefined,
      age: 18,
      gender: "male" as "male" | "female" | "other",
      zone: "",
      password: "",
    },
    validators: {
      onSubmit: SignupRequestSchema as any,
    },
    onSubmit: async ({ value }) => mutate(value),
  });

  return (
    <CommonLayout>
      <div className="signup-container">
        <h1 className="signup-title">Sign Up</h1>
        <formData.AppForm>
          <formData.FormContainer extraError={error}>
            <div className="form-grid">
              <formData.AppField 
                name="firstName" 
                children={(field) => <field.TextField label="First Name" />} 
              />
              <formData.AppField 
                name="lastName" 
                children={(field) => <field.TextField label="Last Name" />} 
              />
              <div className="full-width">
                <formData.AppField 
                  name="email" 
                  children={(field) => <field.TextField label="Email" />} 
                />
              </div>
              <div className="full-width">
                <formData.AppField 
                  name="photo" 
                  children={(field) => <field.TextField label="Photo URL (optional)" />} 
                />
              </div>
              <formData.AppField 
                name="age" 
                children={(field) => <field.TextField label="Age" />} 
              />
              <formData.AppField 
                name="gender" 
                children={(field) => (
                  <div>
                    <label>Gender</label>
                    <select 
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as "male" | "female" | "other")}
                      className="form-select"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )} 
              />
              <div className="full-width">
                <formData.AppField 
                  name="zone" 
                  children={(field) => <field.TextField label="Zone" />} 
                />
              </div>
              <div className="full-width">
                <formData.AppField 
                  name="password" 
                  children={(field) => <field.PasswordField label="Password" />} 
                />
              </div>
            </div>
          </formData.FormContainer>
        </formData.AppForm>
      </div>
    </CommonLayout>
  );
};
