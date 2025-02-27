import { useFormContext } from "@/config/form-context";

export const SubmitButton = () => {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <button type="submit" disabled={!canSubmit} onClick={() => form.handleSubmit()}>
          {isSubmitting ? "..." : "Submit"}
        </button>
      )}
    />
  );
};
