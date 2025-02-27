import { useToken } from "@/services/TokenContext";
import { signup } from "@/services/UserServices";

const fields = [
  { label: "Username", name: "username", type: "text" },
  { label: "Password", name: "password", type: "password" },
];

export const SignupScreen = () => {
  const [, setToken] = useToken();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tokenData = await signup(formData);
    setToken({ state: "LOGGED_IN", ...tokenData });
  }

  return (
    <>
      <h1>Sign Up</h1>
      <form style={{ display: "flex", flexDirection: "column" }} onSubmit={onSubmit}>
        {fields.map((field) => (
          <label>
            {field.label}
            <input type={field.type} name={field.name} />
          </label>
        ))}
        <button>Sign Up</button>
      </form>
    </>
  );
};
