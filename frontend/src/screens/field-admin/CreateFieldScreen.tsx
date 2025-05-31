import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { CreateFieldRequestSchema } from "@/models/CreateField";
import { useCreateField } from "@/services/CreateFieldServices";
import styles from "./CreateFieldScreen.module.css";

export const CreateFieldScreen = () => {
  const { mutate, error, isSuccess } = useCreateField();

  const formData = useAppForm({
    defaultValues: {
      name: "",
      grassType: "sintetico" as "natural" | "sintetico",
      hasLighting: false,
      location: {
        area: "",
        address: "",
      },
      photos: [] as string[],
    },
    validators: {
      onSubmit: CreateFieldRequestSchema as any,
    },
    onSubmit: async ({ value }) => {
      await mutate(value);
      if (!error) {
        // Reset form after successful submission
        formData.reset();
      }
    },
  });

  return (
    <CommonLayout>
      <div className={styles.createFieldContainer}>
        <h1 className={styles.createFieldTitle}>Crear Nueva Cancha</h1>
        <formData.AppForm>
          {error && (
            <div className={styles.errorBanner}>
              <p>{error.message}</p>
            </div>
          )}
          {isSuccess && (
            <div className={styles.successBanner}>
              <p>¡La cancha se creó exitosamente!</p>
            </div>
          )}
          <formData.FormContainer extraError={null}>
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <formData.AppField 
                  name="name" 
                  children={(field) => <field.TextField label="Nombre de la cancha" />} 
                />
              </div>

              <formData.AppField 
                name="grassType" 
                children={(field) => (
                  <div>
                    <label>Tipo de Césped</label>
                    <select 
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as "natural" | "sintetico")}
                      className={styles.formSelect}
                    >
                      <option value="sintetico">Sintético</option>
                      <option value="natural">Natural</option>
                    </select>
                  </div>
                )} 
              />

              <formData.AppField 
                name="hasLighting" 
                children={(field) => (
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                      Iluminación
                    </label>
                  </div>
                )} 
              />

              <div className={styles.fullWidth}>
                <formData.AppField 
                  name="location.area" 
                  children={(field) => <field.TextField label="Área" />} 
                />
              </div>

              <div className={styles.fullWidth}>
                <formData.AppField 
                  name="location.address" 
                  children={(field) => <field.TextField label="Dirección" />} 
                />
              </div>

              <div className={styles.fullWidth}>
                <formData.AppField 
                  name="photos" 
                  children={(field) => (
                    <div>
                      <label>URLs de Fotos (opcional, una por línea)</label>
                      <textarea
                        value={field.state.value.join("\n")}
                        onChange={(e) => field.handleChange(e.target.value.split("\n").filter(Boolean))}
                        placeholder="Ingrese URLs de fotos, una por línea"
                        rows={3}
                        className={styles.formTextarea}
                      />
                    </div>
                  )} 
                />
              </div>
            </div>
          </formData.FormContainer>
        </formData.AppForm>
      </div>
    </CommonLayout>
  );
};
