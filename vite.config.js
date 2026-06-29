import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:      resolve(__dirname, 'index.html'),
        servicos:  resolve(__dirname, 'servicos.html'),
        sobre:     resolve(__dirname, 'sobre.html'),
        contato:   resolve(__dirname, 'contato.html'),
        obrigado:  resolve(__dirname, 'obrigado.html'),
      }
    }
  }
})
