import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { crearEtiqueta } from '../lib/etiqueta3d.js';

/**
 * Simulador de robot SCARA (configuración RRP).
 *   - θ1: primera articulación rotacional (hombro), gira en plano horizontal.
 *   - θ2: segunda articulación rotacional (codo), gira en plano horizontal.
 *   - d3: articulación prismática, desplaza la herramienta verticalmente.
 *
 * Cinemática directa (plano horizontal + altura):
 *   x = L1·cos(θ1) + L2·cos(θ1+θ2)
 *   y = L1·sin(θ1) + L2·sin(θ1+θ2)
 *   z = altura_base − d3   (la herramienta baja al aumentar d3)
 *
 * Render 3D con Three.js. Los sliders controlan los tres grados de libertad
 * y se ve el movimiento característico del SCARA.
 */

const L1 = 2.2; // longitud eslabón 1 (unidades de escena)
const L2 = 1.8;
const ALTURA_BASE = 3.0; // altura de la columna donde nace el brazo

export default function SimuladorSCARA() {
  const mountRef = useRef(null);
  const [theta1, setTheta1] = useState(30);
  const [theta2, setTheta2] = useState(45);
  const [d3, setD3] = useState(0.8); // descenso de la herramienta

  // refs a los objetos animables
  const refs = useRef({});

  // --- montaje de la escena (una sola vez) --------------------------------
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';
    const pal = () =>
      isLight()
        ? { link1: 0xd97706, link2: 0xea8a1a, col: 0x44556a, tool: 0x0f9c8a, grid1: 0x9fb3c4, grid2: 0xc9d6e0 }
        : { link1: 0xff9e2c, link2: 0xffb84d, col: 0x324259, tool: 0x38d9c4, grid1: 0x24364a, grid2: 0x182433 };

    const scene = new THREE.Scene();
    const w = mount.clientWidth;
    const h = mount.clientHeight || 380;
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(7, 6, 8);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 24;
    controls.target.set(0, 1.5, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    const detenerAuto = () => { controls.autoRotate = false; };
    renderer.domElement.addEventListener('pointerdown', detenerAuto);
    renderer.domElement.addEventListener('wheel', detenerAuto, { passive: true });

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 10, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x38d9c4, 0.35);
    rim.position.set(-6, 4, -5);
    scene.add(rim);

    let c = pal();
    const matCol = new THREE.MeshStandardMaterial({ color: c.col, metalness: 0.3, roughness: 0.7 });
    const matLink1 = new THREE.MeshStandardMaterial({ color: c.link1, metalness: 0.4, roughness: 0.45 });
    const matLink2 = new THREE.MeshStandardMaterial({ color: c.link2, metalness: 0.4, roughness: 0.45 });
    const matJoint = new THREE.MeshStandardMaterial({ color: c.col, metalness: 0.2, roughness: 0.6 });
    const matTool = new THREE.MeshStandardMaterial({ color: c.tool, metalness: 0.5, roughness: 0.3, emissive: c.tool, emissiveIntensity: 0.25 });

    // suelo + rejilla
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.22 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    let grid = new THREE.GridHelper(20, 20, c.grid1, c.grid2);
    scene.add(grid);

    // columna vertical (base fija del SCARA)
    const columna = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, ALTURA_BASE, 24), matCol);
    columna.position.y = ALTURA_BASE / 2;
    columna.castShadow = true;
    scene.add(columna);

    // grupo hombro (rota en Y) — en la cima de la columna
    const hombro = new THREE.Group();
    hombro.position.y = ALTURA_BASE;
    scene.add(hombro);

    const joint1 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.4, 24), matJoint);
    joint1.castShadow = true;
    hombro.add(joint1);

    // eslabón 1 horizontal (a lo largo de X local)
    const link1 = new THREE.Mesh(new THREE.BoxGeometry(L1, 0.32, 0.32), matLink1);
    link1.position.x = L1 / 2;
    link1.castShadow = true;
    hombro.add(link1);

    // grupo codo al final del eslabón 1
    const codo = new THREE.Group();
    codo.position.x = L1;
    hombro.add(codo);

    const joint2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.38, 24), matJoint);
    joint2.castShadow = true;
    codo.add(joint2);

    const link2 = new THREE.Mesh(new THREE.BoxGeometry(L2, 0.28, 0.28), matLink2);
    link2.position.x = L2 / 2;
    link2.castShadow = true;
    codo.add(link2);

    // etiquetas de ángulo sobre cada eslabón (siguen al robot)
    const etiq1 = crearEtiqueta();
    etiq1.sprite.position.set(L1 / 2, 0.55, 0);
    hombro.add(etiq1.sprite);
    const etiq2 = crearEtiqueta();
    etiq2.sprite.position.set(L2 / 2, 0.5, 0);
    codo.add(etiq2.sprite);
    const etiqD = crearEtiqueta();
    // se posiciona junto a la herramienta; la añadimos a la escena y la movemos en update
    scene.add(etiqD.sprite);

    // eje prismático: husillo vertical al final del eslabón 2
    const husilloGrupo = new THREE.Group();
    husilloGrupo.position.x = L2;
    codo.add(husilloGrupo);

    const husillo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, ALTURA_BASE, 16), matJoint);
    husillo.position.y = -ALTURA_BASE / 2 + 0.5;
    husilloGrupo.add(husillo);

    // herramienta (se desliza a lo largo del husillo)
    const herramienta = new THREE.Group();
    husilloGrupo.add(herramienta);
    const toolBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.5, 16), matTool);
    toolBody.castShadow = true;
    herramienta.add(toolBody);
    const toolTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 16), matTool);
    toolTip.position.y = -0.4;
    herramienta.add(toolTip);

    refs.current = {
      scene, camera, renderer, mount, hombro, codo, herramienta,
      matLink1, matLink2, matCol, matJoint, matTool, pal,
      etiq1, etiq2, etiqD,
      getGrid: () => grid, setGrid: (g) => { grid = g; },
    };

    // tema dinámico
    const applyTheme = () => {
      const c2 = pal();
      matLink1.color.setHex(c2.link1);
      matLink2.color.setHex(c2.link2);
      matCol.color.setHex(c2.col);
      matJoint.color.setHex(c2.col);
      matTool.color.setHex(c2.tool);
      matTool.emissive.setHex(c2.tool);
      scene.remove(grid);
      grid = new THREE.GridHelper(20, 20, c2.grid1, c2.grid2);
      scene.add(grid);
      etiq1.redibujar(); etiq2.redibujar(); etiqD.redibujar();
    };
    const themeObs = new MutationObserver(applyTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // bucle de render (cámara orbita suave)
    let raf;
    let t = 0;
    const clock = new THREE.Clock();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = () => {
      const dt = clock.getDelta();
      if (!reduce) t += dt;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const ro = new ResizeObserver(() => {
      const ww = mount.clientWidth, hh = mount.clientHeight || 380;
      camera.aspect = ww / hh;
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      themeObs.disconnect();
      ro.disconnect();
      renderer.dispose();
      controls.dispose();
      etiq1.dispose(); etiq2.dispose(); etiqD.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  // --- aplicar ángulos/prismática cuando cambian --------------------------
  useEffect(() => {
    const r = refs.current;
    if (!r.hombro) return;
    r.hombro.rotation.y = -(theta1 * Math.PI) / 180;
    r.codo.rotation.y = -(theta2 * Math.PI) / 180;
    // la herramienta baja al aumentar d3 (desde la cima del husillo)
    r.herramienta.position.y = 0.2 - d3;
    // etiquetas en vivo
    if (r.etiq1) {
      r.etiq1.set(`θ₁=${Math.round(theta1)}°`);
      r.etiq2.set(`θ₂=${Math.round(theta2)}°`);
      r.etiqD.set(`d₃=${d3.toFixed(2)}`);
      // colocar la etiqueta d3 junto a la herramienta (en mundo)
      r.herramienta.updateWorldMatrix(true, false);
      const wp = new THREE.Vector3();
      r.herramienta.getWorldPosition(wp);
      r.etiqD.sprite.position.set(wp.x + 0.9, wp.y, wp.z);
    }
  }, [theta1, theta2, d3]);

  // cinemática directa para la lectura
  const t1 = (theta1 * Math.PI) / 180;
  const t2 = (theta2 * Math.PI) / 180;
  const x = L1 * Math.cos(t1) + L2 * Math.cos(t1 + t2);
  const y = L1 * Math.sin(t1) + L2 * Math.sin(t1 + t2);
  // escala a mm para que sea comparable (L1=2.2u -> 220mm aprox)
  const esc = 100;
  const xmm = Math.round(x * esc);
  const ymm = Math.round(y * esc);
  const zmm = Math.round((ALTURA_BASE - 0.5 - d3) * esc);

  return (
    <div className="sim-scara">
      <div className="sim-scara-canvas">
        <div ref={mountRef} className="sim-scara-3d" aria-label="Robot SCARA en 3D" />
      </div>

      <div className="sim-scara-panel">
        <div className="sim-slider">
          <label><span>θ₁ (hombro)</span><span className="sim-val">{theta1}°</span></label>
          <input type="range" min="-180" max="180" value={theta1} onChange={(e) => setTheta1(+e.target.value)} />
        </div>
        <div className="sim-slider">
          <label><span>θ₂ (codo)</span><span className="sim-val">{theta2}°</span></label>
          <input type="range" min="-180" max="180" value={theta2} onChange={(e) => setTheta2(+e.target.value)} />
        </div>
        <div className="sim-slider">
          <label><span>d₃ (prismática)</span><span className="sim-val">{d3.toFixed(2)}</span></label>
          <input type="range" min="0" max="2.2" step="0.05" value={d3} onChange={(e) => setD3(+e.target.value)} />
        </div>

        <div className="sim-lectura">
          <p className="sim-lectura-titulo">Configuración RRP</p>
          <div className="sim-ec">x = L₁cos θ₁ + L₂cos(θ₁+θ₂) = <b>{xmm} mm</b></div>
          <div className="sim-ec">y = L₁sin θ₁ + L₂sin(θ₁+θ₂) = <b>{ymm} mm</b></div>
          <div className="sim-ec">z = altura − d₃ = <b>{zmm} mm</b></div>
          <div className="sim-ec sim-ec-faint">2 articulaciones revolutas + 1 prismática</div>
        </div>

        <div className="sim-acciones">
          <button className="sim-btn" onClick={() => { setTheta1(0); setTheta2(0); setD3(0); }}>Extendido arriba</button>
          <button className="sim-btn" onClick={() => { setTheta1(45); setTheta2(60); setD3(2.0); }}>Recoger pieza</button>
          <button className="sim-btn" onClick={() => { setTheta1(30); setTheta2(45); setD3(0.8); }}>Reiniciar</button>
        </div>

        <p className="sim-ayuda">
          El SCARA mueve el brazo en un plano horizontal (θ₁, θ₂) y baja la herramienta con la prismática (d₃): ideal para ensamblaje vertical.
        </p>
      </div>
    </div>
  );
}
