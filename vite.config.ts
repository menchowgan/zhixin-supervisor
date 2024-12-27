import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import viteConsoleDropPlugin from "./vite-plugin/viteConsoleDrop";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteConsoleDropPlugin(),
    uni()
  ],
  base: "/supervisor-h5",
  envPrefix: "JIANLI_",
});
