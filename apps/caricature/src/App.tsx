import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import View from "./lib/view-manager/View";
import useViewStore from "./lib/view-manager/view-manager-store";
import { HomeView } from "./views/HomeView";
import { PreviewView } from "./views/PreviewView";
import { CameraView } from "./views/CameraView";
import { GeneratingView } from "./views/GeneratingView";
import { SelectView } from "./views/SelectView";
import { DownloadView } from "./views/DownloadView";
import { FormView } from "./views/FormView";
import { APPS } from "./lib/apps";
import { AdminView } from "./views/AdminView";

const CustomView: typeof View = ({ viewId, children }) => (
  <View
    viewId={viewId}
    style={{
      background: "white",
      boxShadow:
        "rgba(0, 0, 0, 0.25) 0px 50px 80px -40px, rgba(0, 0, 0, 0.1) 0px 0px 0px 1px",
    }}
  >
    <div className="view-shadow" />
    <div
      className="view-texture"
      style={{ backgroundImage: "url(background.png)" }}
    />
    <div className="view-content">{children}</div>
  </View>
);

const App = () => {
  const setView = useViewStore((store) => store.setView);
  const activeApp = useViewStore((store) => store.activeApp);

  useEffect(() => {
    setView("home");
  }, []);

  return (
    <main className="app-viewport">
      <div className="app-stage">
        <CustomView viewId="home">
          <HomeView />
        </CustomView>
        <CustomView viewId="preview">
          <PreviewView />
        </CustomView>
        <CustomView viewId="camera">
          <CameraView />
        </CustomView>
        <CustomView viewId="generating">
          <GeneratingView />
        </CustomView>
        <CustomView viewId="select">
          <SelectView />
        </CustomView>
        <CustomView viewId="form">
          <FormView />
        </CustomView>
        <CustomView viewId="download">
          <DownloadView />
        </CustomView>
        <button
          type="button"
          aria-label="Cambiar aplicación"
          className="app-switch-hotspot"
          onClick={() => {
            const store = useViewStore.getState();
            const currentView = store.currentView;

            if (currentView === "generating") return;

            const currentIndex = APPS.findIndex((app) => app.id === activeApp);
            const nextApp = APPS[(currentIndex + 1) % APPS.length];
            store.setActiveApp(nextApp.id);
            store.clearExperience();
            setView("home");
          }}
        />
        <button
          type="button"
          aria-label="Volver al inicio"
          className="home-hotspot"
          onClick={() => {
            const currentView = useViewStore.getState().currentView;

            if (currentView !== "home" && currentView !== "generating")
              setView("home");
          }}
        />
      </div>
    </main>
  );
};

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
const isAdminRoute = window.location.pathname.replace(/\/+$/, "") === "/admin";

root.render(isAdminRoute ? <AdminView /> : <App />);
