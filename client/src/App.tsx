import { useEffect } from "react";
import { Provider } from "react-redux";
import { AppRouter } from "./router";
import { store } from "./store";
import { fetchUserProfile } from "./store";

function AppInitializer() {
  useEffect(() => {
    // Check if user is already authenticated on mount
    // This will read HttpOnly cookies and fetch user profile
    console.log("[App] Initializing app, checking auth status...");
    store.dispatch(fetchUserProfile());
  }, []);

  return <AppRouter />;
}

function App() {
  return (
    <Provider store={store}>
      <AppInitializer />
    </Provider>
  );
}

export default App;
