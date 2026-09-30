import express from 'express';
import applicationsRoutes from './routes/applications.routes.js';

const app = express();

// Middlewares globales
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// Rutas de dominio
app.use('/applications', applicationsRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Manejador global de errores
app.use((err, _req, res, _next) => {
  console.error('[GlobalErrorHandler]', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Error interno del servidor.',
  });
});

export default app;