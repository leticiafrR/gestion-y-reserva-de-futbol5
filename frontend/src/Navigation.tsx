import { Redirect, Route, Switch } from "wouter";
import React, { useEffect, useState } from "react";

import { MainScreen as AdminMainScreen } from "@/screens/field-admin/MainScreen";
import { PlayerMainScreen } from "@/screens/player/MainScreen";
import { useToken } from "@/services/TokenContext";
import { FieldManagementScreen } from "@/screens/field-admin/FieldManagementScreen";
import { LoginScreen } from "./screens/auth/LoginScreen";
import { SignupScreen } from "./screens/auth/SignupScreen";
import { VerifyEmailScreen } from "./screens/auth/VerifyEmailScreen";
import { AvailableFieldsScreen } from "@/screens/player/AvailableFieldsScreen";
import { TeamsScreen } from "@/screens/player/TeamsScreen";
import { ProfileScreen } from "@/screens/player/ProfileScreen";
import { ScheduleManagementScreen } from "./screens/field-admin/ScheduleManagementScreen";
import { MatchesScreen } from "@/screens/player/match/MatchesScreen";
import { MyTournamentsScreen } from "@/screens/player/MyTournamentsScreen";

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/main">
        <AdminMainScreen />
      </Route>
      <Route path="/canchas">
        <FieldManagementScreen />
      </Route>
      <Route path="/horarios">
        <ScheduleManagementScreen />
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
      <Route path="/matches">
        <MatchesScreen />
      </Route>
      <Route path="/teams">
        <TeamsScreen />
      </Route>
      <Route path="/profile">
        <ProfileScreen />
      </Route>
      <Route path="/my-tournaments">
        <MyTournamentsScreen />
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
  // Estado local para el userType
  const [userType, setUserType] = useState(
    typeof window !== "undefined" ? localStorage.getItem("loginUserType") || "user" : "user"
  );

  useEffect(() => {
    // Handler para cambios en localStorage o evento custom
    const handleStorage = () => {
      setUserType(localStorage.getItem("loginUserType") || "user");
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("userTypeChanged", handleStorage);
    handleStorage();
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("userTypeChanged", handleStorage);
    };
  }, []);

  switch (tokenState.state) {
    case "LOGGED_IN":
      if (userType === "owner") {
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
          <Route path="/verify-email">
            <VerifyEmailScreen />
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