import { useId } from "react";

import { useFieldContext } from "@/config/form-context";

import styles from "./InputFields.module.css";

export const TextField = ({ label }: { label: string }) => {
  return <FieldWithType type="text" label={label} />;
};

export const PasswordField = ({ label }: { label: string }) => {
  return <FieldWithType type="password" label={label} />;
};

const FieldWithType = ({ label, type }: { label: string; type: string }) => {
  const id = useId();
  const field = useFieldContext<string>();
  const hasError = field.state.meta.errors.length > 0;
  const errorMessage = hasError ? field.state.meta.errors[0].message : "";

  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.dataContainer}>
        <input
          id={id}
          name={field.name}
          value={field.state.value}
          className={`${styles.input} ${hasError ? styles.error : ""}`}
          type={type}
          placeholder={hasError ? errorMessage : ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </div>
    </div>
  );
};
