// Cliente API CIID
const CIID_KEY = 'dev-key-cambiar-en-produccion';

const api = {
  async get(ruta) {
    const r = await fetch(ruta, { headers: { 'x-api-key': CIID_KEY } });
    if (!r.ok) throw new Error(`Error ${r.status}: ${await r.text()}`);
    return r.json();
  },
  async post(ruta, body) {
    const r = await fetch(ruta, {
      method: 'POST',
      headers: { 'x-api-key': CIID_KEY, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(err.error ?? `Error ${r.status}`);
    }
    return r.json();
  },
  async patch(ruta, body) {
    const r = await fetch(ruta, {
      method: 'PATCH',
      headers: { 'x-api-key': CIID_KEY, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(err.error ?? `Error ${r.status}`);
    }
    return r.json();
  },
};

function mostrarAlerta(contenedor, tipo, mensaje) {
  const el = document.createElement('div');
  el.className = `ciid-alerta ciid-alerta--${tipo}`;
  el.textContent = mensaje;
  contenedor.innerHTML = '';
  contenedor.appendChild(el);
  if (tipo === 'exito') {
    setTimeout(() => el.remove(), 3000);
  }
}

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}
