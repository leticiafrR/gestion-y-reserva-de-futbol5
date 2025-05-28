import { createFormHook } from "@tanstack/react-form";

import { FormContainer } from "@/components/form-components/FormContainer/FormContainer";
import { PasswordField, TextField } from "@/components/form-components/InputFields/InputFields";
import { fieldContext, formContext } from "@/config/form-context";
import { GenericButton } from "@/components/form-components/GenericButton/GenericButton";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    PasswordField,
  },
  formComponents: {
    FormContainer,
    GenericButton
  },
});
