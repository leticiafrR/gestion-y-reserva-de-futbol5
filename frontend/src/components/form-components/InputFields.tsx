import { useFieldContext } from "@/config/form-context";

export const TextField = ({ label }: { label: string }) => {
  const field = useFieldContext<string>();
  return (
    <label>
      {label}
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </label>
  );
};

export const PasswordField = ({ label }: { label: string }) => {
  const field = useFieldContext<string>();
  return (
    <label>
      {label}
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        type="password"
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </label>
  );
};
