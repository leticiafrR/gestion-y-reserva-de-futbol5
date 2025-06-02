import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { SignupRequestSchema } from "@/models/Signup";
import { useSignup } from "@/services/SignupServices";
import styles from "./SignupScreen.module.css";
import { useId, useRef, useEffect } from "react";
import inputStyles from "@/components/form-components/InputFields/InputFields.module.css";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { Upload, X } from "lucide-react";

type FieldComponentProps = {
  field: any;
};

const AgeField = ({ field }: FieldComponentProps) => {
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
          min="1"
          value={field.state.value}
          className={`${inputStyles.input} ${
            field.state.meta.errors.length > 0 ? inputStyles.error : ""
          }`}
          placeholder={
            field.state.meta.errors.length > 0
              ? field.state.meta.errors[0].message
              : ""
          }
          onBlur={field.handleBlur}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            if (value > 0) {
              field.handleChange(value);
            }
          }}
        />
      </div>
    </div>
  );
};

const GenderField = ({ field }: FieldComponentProps) => {
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
          onChange={(e) =>
            field.handleChange(e.target.value as "male" | "female" | "other")
          }
          className={inputStyles.input}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
};

const UserTypeField = ({ field }: FieldComponentProps) => {
  const id = useId();
  return (
    <div className={inputStyles.fieldContainer}>
      <label htmlFor={id} className={inputStyles.label}>
        User Type
      </label>
      <div className={inputStyles.dataContainer}>
        <select
          id={id}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value as "owner" | "user")}
          className={inputStyles.input}
        >
          <option value="user">Regular User</option>
          <option value="owner">Field Owner</option>
        </select>
      </div>
    </div>
  );
};

const PhotoField = ({ field }: FieldComponentProps) => {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would typically upload the file to your server/storage
      // and get back a URL. For now, we'll just use a placeholder
      field.handleChange(URL.createObjectURL(file));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.handleChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={inputStyles.fieldContainer}>
      <label htmlFor={id} className={inputStyles.label}>
        Photo
      </label>
      <div className={inputStyles.dataContainer}>
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div
          onClick={handleButtonClick}
          style={{
            border: "2px dashed #e2e8f0",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: field.state.value ? "transparent" : "#f8fafc",
            transition: "all 0.2s ease",
            position: "relative",
            minHeight: "150px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          {field.state.value ? (
            <>
              <img
                src={field.state.value}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "4px",
                  objectFit: "cover",
                }}
              />
              <button
                onClick={handleRemovePhoto}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                }}
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <Upload size={32} color="#64748b" />
              <div style={{ color: "#64748b" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "500" }}>
                  Click to upload photo
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                  PNG, JPG or JPEG (max. 2MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ZoneField = ({ field }: FieldComponentProps) => {
  const id = useId();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAV-7--jx2dP-MyDxVrhcSYlNnY8KNb8g8",
    libraries: ["places"],
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        field.handleChange(place.formatted_address);
      }
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={inputStyles.fieldContainer}>
      <label htmlFor={id} className={inputStyles.label}>
        Zone
      </label>
      <div className={inputStyles.dataContainer}>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          restrictions={{ country: "ar" }}
        >
          <input
            id={id}
            type="text"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            className={`${inputStyles.input} ${
              field.state.meta.errors.length > 0 ? inputStyles.error : ""
            }`}
            placeholder={
              field.state.meta.errors.length > 0
                ? field.state.meta.errors[0].message
                : "Enter your location"
            }
            onBlur={field.handleBlur}
          />
        </Autocomplete>
      </div>
    </div>
  );
};

export const SignupScreen = () => {
  console.log("SignupScreen mounted");
  const { mutate, error, isSuccess, data } = useSignup();

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
      userType: "user" as "owner" | "user",
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
        {isSuccess ? (
          <div style={{
            padding: "20px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #10b981",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#047857", marginBottom: "8px" }}>¡Registro exitoso!</h3>
            <p style={{ color: "#065f46", marginBottom: "16px" }}>
              {data?.message || "Te hemos enviado un email de verificación. Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta."}
            </p>
            <button
              onClick={() => window.location.href = "/login"}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Ir al Login
            </button>
          </div>
        ) : (
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
                    children={(field) => <PhotoField field={field} />}
                  />
                </div>
                <formData.AppField
                  name="age"
                  children={(field) => <AgeField field={field} />}
                />
                <formData.AppField
                  name="gender"
                  children={(field) => <GenderField field={field} />}
                />
                <div className={styles.fullWidth}>
                  <formData.AppField
                    name="zone"
                    children={(field) => <ZoneField field={field} />}
                  />
                </div>
                <div className={styles.fullWidth}>
                  <formData.AppField
                    name="userType"
                    children={(field) => <UserTypeField field={field} />}
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
        )}
        {!isSuccess && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button 
              type="button" 
              style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer" }} 
              onClick={() => window.location.href = "/login"}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        )}
      </div>
    </CommonLayout>
  );
};
