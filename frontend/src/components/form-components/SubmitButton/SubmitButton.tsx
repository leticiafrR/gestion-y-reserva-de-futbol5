import { useFormContext } from "@/config/form-context";

import styles from "./SubmitButton.module.css";

export const SubmitButton = () => {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <button type="submit" className={styles.button} disabled={!canSubmit}>
          {isSubmitting ? "..." : "Submit"}
        </button>
      )}
    />
  );
};
