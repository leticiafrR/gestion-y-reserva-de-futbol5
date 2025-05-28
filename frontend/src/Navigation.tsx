import { Redirect, Route, Switch } from "wouter";

import { LoginScreen } from "@/screens/LoginScreen";
import { MainScreen } from "@/screens/MainScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { useToken } from "@/services/TokenContext";

export const Navigation = () => {
  const [tokenState] = useToken();
  switch (tokenState.state) {
    case "LOGGED_IN":
      return (
        <Switch>
          <Route path="/main">
            <MainScreen />
          </Route>
          <Route path="/create-field">
            <MainScreen /> {/* Temporarily using MainScreen, we'll create proper screens later */}
          </Route>
          <Route path="/search-field">
            <MainScreen /> {/* Temporarily using MainScreen, we'll create proper screens later */}
          </Route>
          <Route path="/">
            <Redirect href="/main" />
          </Route>
          <Route>
            <Redirect href="/main" />
          </Route>
        </Switch>
      );
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
