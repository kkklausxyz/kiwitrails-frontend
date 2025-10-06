import { createBrowserRouter } from "react-router-dom";
import Chat from "../pages/Chat";
import NotFound from "../pages/NotFound";

const router = createBrowserRouter([
  { path: "/", element: <Chat /> }, // 👈 打开网站直接进入 Chat
  { path: "/chat", element: <Chat /> }, // 可选：保留 /chat 路径
  { path: "*", element: <NotFound /> }, // 404 页面
]);

export default router;
