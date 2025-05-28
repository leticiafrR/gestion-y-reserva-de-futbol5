import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { SignupRequestSchema} from "@/models/Signup";
import { useSignup } from "@/services/SignupServices";
import styles from "./SignupScreen.module.css";
import { useId } from "react";
import inputStyles from "@/components/form-components/InputFields/InputFields.module.css";

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
      <div className={styles.signupContainer}>
        <h1 className={styles.signupTitle}>Sign Up</h1>
        <formData.AppForm>
          <formData.FormContainer extraError={error}>
            <div className={styles.formGrid}>
              <formData.AppField 
                name="firstName" 
                children={(field) => <field.TextField label="First Name" />} 
              />
              <formData.AppField 
                name="lastName" 
                children={(field) => <field.TextField label="Last Name" />} 
              />
              <div className={styles.fullWidth}>
                <formData.AppField 
                  name="email" 
                  children={(field) => <field.TextField label="Email" />} 
                />
              </div>
              <div className={styles.fullWidth}>
                <formData.AppField 
                  name="photo" 
                  children={(field) => <field.TextField label="Photo URL (optional)" />} 
                />
              </div>
              <formData.AppField 
                name="age" 
                children={(field) => {
                  const id = useId();
                  return (
                    <div className={inputStyles.fieldContainer}>
                      <label htmlFor={id} className={inputStyles.label}>
                        Age
                      </label>
                      <div className={inputStyles.dataContainer}>
                        <input
                          id={id}
                          name={field.name}
                          type="number"
                          value={field.state.value}
                          className={`${inputStyles.input} ${field.state.meta.errors.length > 0 ? inputStyles.error : ""}`}
                          placeholder={field.state.meta.errors.length > 0 ? field.state.meta.errors[0].message : ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  );
                }}
              />
              <formData.AppField 
                name="gender" 
                children={(field) => {
                  const id = useId();
                  return (
                    <div className={inputStyles.fieldContainer}>
                      <label htmlFor={id} className={inputStyles.label}>
                        Gender
                      </label>
                      <div className={inputStyles.dataContainer}>
                        <select 
                          id={id}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value as "male" | "female" | "other")}
                          className={inputStyles.input}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  );
                }} 
              />
              <div className={styles.fullWidth}>
                <formData.AppField 
                  name="zone" 
                  children={(field) => <field.TextField label="Zone" />} 
                />
              </div>
              <div className={styles.fullWidth}>
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
