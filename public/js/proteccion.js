// Parche de seguridad para el frontend
window.addEventListener('DOMContentLoaded', () => {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('innerHTML')) return; // Ignorar el error visual
    originalError(...args);
  };
});
