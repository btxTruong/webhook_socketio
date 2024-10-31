import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import globalConfig from "../global_config.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: globalConfig.appPort
  }
})
