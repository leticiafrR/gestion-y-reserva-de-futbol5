import { Redirect, Route, Switch } from "wouter";

import { MainScreen as AdminMainScreen } from "@/screens/field-admin/MainScreen";
import { PlayerMainScreen } from "@/screens/player/MainScreen";
import { useToken } from "@/services/TokenContext";
import { FieldManagementScreen } from "@/screens/field-admin/FieldManagementScreen";
import { LoginScreen } from "./screens/auth/LoginScreen";
import { SignupScreen } from "./screens/auth/SignupScreen";
import { AvailableFieldsScreen } from "@/screens/player/AvailableFieldsScreen";

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/main">
        <AdminMainScreen />
      </Route>
      <Route path="/canchas">
        <FieldManagementScreen />
      </Route>
      <Route path="/">
        <Redirect href="/main" />
      </Route>
      <Route>
        <Redirect href="/main" />
      </Route>
    </Switch>
  );
}

function PlayerRoutes() {
  return (
    <Switch>
      <Route path="/main">
        <PlayerMainScreen />
      </Route>
      <Route path="/available-fields">
        <AvailableFieldsScreen />
      </Route>
      <Route path="/">
        <Redirect href="/main" />
      </Route>
      <Route>
        <Redirect href="/main" />
      </Route>
    </Switch>
  );
}

export const Navigation = () => {
  const [tokenState] = useToken();
  // Leer el tipo de usuario desde localStorage
  const userType = typeof window !== "undefined" ? localStorage.getItem("loginUserType") || "user" : "user";

  switch (tokenState.state) {
    case "LOGGED_IN":
      if (userType === "admin") {
        return <AdminRoutes />;
      } else {
        return <PlayerRoutes />;
      }
    case "LOGGED_OUT":
      return (
        <Switch>
          <Route path="/login">
            <LoginScreen />
          </Route>
          <Route path="/signup">
            <SignupScreen />
          </Route>
          <Route>
            <Redirect href="/login" />
          </Route>
        </Switch>
      );
    default:
      // Make the compiler check this is unreachable
      return tokenState satisfies never;
  }
};