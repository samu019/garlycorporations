import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Servir archivos estáticos del build
app.use(express.static(path.join(__dirname, 'dist')));

// Manejar todas las rutas para SPA - redirigir a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Frontend SPA servido en puerto ${PORT}`);
  console.log(`🌐 Todas las rutas redirigen a index.html (SPA)`);
});
