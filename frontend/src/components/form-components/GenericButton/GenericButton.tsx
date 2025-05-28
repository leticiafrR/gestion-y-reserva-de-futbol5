import { useFormContext } from "@/config/form-context";
import styles from "./GenericButton.module.css";

interface GenericButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}

export const GenericButton = ({
  label,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  isLoading = false,
  loadingText = "...",
  className,
}: GenericButtonProps) => {
  const form = useFormContext();
  const isFormButton = type === "submit" && form;

  // If it's a form submit button, use the form context
  if (isFormButton) {
    return (
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <button
            type={type}
            className={`${styles.button} ${styles[variant]} ${className || ""}`}
            disabled={!canSubmit || disabled}
            onClick={onClick}
          >
            {isSubmitting || isLoading ? loadingText : label}
          </button>
        )}
      />
    );
  }

  // Regular button
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className || ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {isLoading ? loadingText : label}
    </button>
  );
};
