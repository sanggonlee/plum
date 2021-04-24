import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "react-toast-notifications";
import { RecoilRoot } from "recoil";
import Router from "./components/Router";
import Sidebar from "./components/Sidebar";

import "./App.css";

function App() {
  return (
    <RecoilRoot>
      <ToastProvider placement="bottom-right">
        <div className="app flex flex-col h-screen">
          <div className="flex-initial w-full px-16 py-6 text-left text-5xl text-white italic font-extrabold bg-blue-800">
            plum
          </div>
          <div className="flex flex-row flex-1">
            <BrowserRouter>
              <Sidebar />
              <Router />
            </BrowserRouter>
          </div>
        </div>
      </ToastProvider>
    </RecoilRoot>
  );
}

export default App;
