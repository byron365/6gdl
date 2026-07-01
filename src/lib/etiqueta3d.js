import * as THREE from 'three';

/**
 * Crea una etiqueta de texto como sprite que siempre mira a la cámara.
 * Devuelve { sprite, set(texto) } para actualizar el texto en vivo.
 *
 * Se dibuja sobre un canvas 2D y se usa como textura. El color se adapta
 * al tema (claro/oscuro) leyendo data-theme.
 */
export function crearEtiqueta(opciones = {}) {
  const { escala = 1 } = opciones;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.7 * escala, 0.48 * escala, 1);
  sprite.renderOrder = 999;

  let textoActual = '';
  const dibujar = (texto) => {
    textoActual = texto;
    const claro = document.documentElement.getAttribute('data-theme') === 'light';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // fondo redondeado
    ctx.fillStyle = claro ? 'rgba(247,249,251,0.94)' : 'rgba(24,36,51,0.94)';
    ctx.strokeStyle = claro ? 'rgba(180,195,210,1)' : 'rgba(70,90,115,1)';
    ctx.lineWidth = 3;
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(r, 4);
    ctx.arcTo(canvas.width - 4, 4, canvas.width - 4, canvas.height - 4, r);
    ctx.arcTo(canvas.width - 4, canvas.height - 4, 4, canvas.height - 4, r);
    ctx.arcTo(4, canvas.height - 4, 4, 4, r);
    ctx.arcTo(4, 4, canvas.width - 4, 4, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // texto
    ctx.fillStyle = claro ? '#1a2433' : '#e8eef5';
    ctx.font = 'bold 34px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2 + 2);
    texture.needsUpdate = true;
  };
  dibujar('');

  return {
    sprite,
    set: (texto) => { if (texto !== textoActual) dibujar(texto); },
    redibujar: () => dibujar(textoActual),
    dispose: () => { texture.dispose(); material.dispose(); },
  };
}
