import { createFormHook } from "@tanstack/react-form";

import { PasswordField, TextField } from "@/components/form-components/InputFields";
import { SubmitButton } from "@/components/form-components/SubmitButton";
import { fieldContext, formContext } from "@/config/form-context";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
  },
  formComponents: {
    SubmitButton,
  },
});
