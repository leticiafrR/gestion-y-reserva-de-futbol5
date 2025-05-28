import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useAppForm } from "@/config/use-app-form";
import { CreateFieldRequestSchema } from "@/models/CreateField";
import { useCreateField } from "@/services/CreateFieldServices";
import "./CreateFieldScreen.css";

export const CreateFieldScreen = () => {
  const { mutate, error } = useCreateField();

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
    onSubmit: async ({ value }) => mutate(value),
  });

  return (
    <CommonLayout>
      <div className="create-field-container">
        <h1 className="create-field-title">Crear Nueva Cancha</h1>
        <formData.AppForm>
          <formData.FormContainer extraError={error}>
            <div className="form-grid">
              <div className="full-width">
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
                      className="form-select"
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
                  <div className="checkbox-group">
                    <label className="checkbox-label">
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

              <div className="full-width">
                <formData.AppField 
                  name="location.area" 
                  children={(field) => <field.TextField label="Área" />} 
                />
              </div>

              <div className="full-width">
                <formData.AppField 
                  name="location.address" 
                  children={(field) => <field.TextField label="Dirección" />} 
                />
              </div>

              <div className="full-width">
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
                        className="form-textarea"
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
