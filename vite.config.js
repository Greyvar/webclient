import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    basicSsl(),
    Components({
      dirs: ['resources/vue/'],
      extensions: ['vue'],
      deep: true,
      dts: false,
    }),
    vue(),
  ],
  server: {
    https: true,
    host: true,
    proxy: {
      'api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      '/res/*': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
