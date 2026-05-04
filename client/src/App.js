import { useState } from "react";
import Auth from "./Auth";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));

  return user ? (
    <Dashboard user={user} setUser={setUser} />
  ) : (
    <Auth setUser={setUser} />
  );
}

export default App;