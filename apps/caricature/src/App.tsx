import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";

import "./index.css";
import View from "./lib/view-manager/View";
import useViewStore from "./lib/view-manager/view-manager-store";
import { HomeView } from "./views/HomeView";
import { PreviewView } from "./views/PreviewView";
import { CameraView } from "./views/CameraView";
import { GeneratingView } from "./views/GeneratingView";
import { SelectView } from "./views/SelectView";
import { DownloadView } from "./views/DownloadView";

const CustomView: typeof View = ({ viewId, children }) => (
  <View
    viewId={viewId}
    style={{
      background: "white",
      boxShadow:
        "rgba(0, 0, 0, 0.25) 0px 50px 80px -40px, rgba(0, 0, 0, 0.1) 0px 0px 0px 1px",
    }}
  >
    <div className="absolute top-0 left-0 w-full h-full shadow-2xl" />
    <div className="absolute top-0 left-0 w-full h-full" />
    <div
      className="w-full h-full bg-repeat opacity-20 absolute top-0 left-0"
      style={{ background: "url(background.png)", backgroundSize: "400px" }}
    />
    <div className="absolute top-0 left-0 w-full h-full">{children}</div>
  </View>
);

const App = () => {
  const setView = useViewStore((store) => store.setView);

  useEffect(() => {
    setView("home");
  }, []);

  return (
    <div className="fixed w-full h-full bg-[#e8e8e8]">
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
      <CustomView viewId="download">
        <DownloadView />
      </CustomView>
      <div className="absolute top-0 right-0 w-30 h-30 bg-transparent" onClick={() => {
        const currentView = useViewStore.getState().currentView

        if (currentView !== "home" && currentView !== "generating")
        setView("home")
      }}></div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);

root.render(<App />);
