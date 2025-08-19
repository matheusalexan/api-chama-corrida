import app from './app.js';

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚗 API de Transporte rodando na porta ${PORT}`);
  console.log(`📚 Documentação disponível em: http://localhost:${PORT}/docs`);
  console.log(`🔧 JSON do Swagger em: http://localhost:${PORT}/docs-json`);
  console.log(`💚 Health check em: http://localhost:${PORT}/health`);
  console.log(`⚠️  ATENÇÃO: Dados armazenados em memória - serão perdidos ao reiniciar!`);
});
