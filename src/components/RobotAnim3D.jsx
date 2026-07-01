import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Animación 3D de un tipo de robot, según la prop `tipo`:
 *   'cartesiano' | 'cilindrico' | 'polar' | 'scara' | 'articulado'
 *
 * El robot anima su movimiento característico. La cámara se controla con el
 * mouse (arrastrar para rotar, rueda para zoom) mediante OrbitControls.
 */
export default function RobotAnim3D({ tipo = 'cartesiano' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';
    const pal = () =>
      isLight()
        ? { a: 0xd97706, b: 0xea8a1a, s: 0x44556a, tool: 0x0f9c8a, g1: 0x9fb3c4, g2: 0xc9d6e0 }
        : { a: 0xff9e2c, b: 0xffb84d, s: 0x324259, tool: 0x38d9c4, g1: 0x24364a, g2: 0x182433 };

    const scene = new THREE.Scene();
    const w = mount.clientWidth, h = mount.clientHeight || 260;
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(6, 5, 7);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // controles de órbita con el mouse
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.target.set(0, 1.1, 0);
    // rotación automática suave hasta que el usuario interactúe
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 1.1;
    const detenerAuto = () => { controls.autoRotate = false; };
    renderer.domElement.addEventListener('pointerdown', detenerAuto);
    renderer.domElement.addEventListener('wheel', detenerAuto, { passive: true });

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(5, 9, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x38d9c4, 0.35);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    let c = pal();
    const matA = new THREE.MeshStandardMaterial({ color: c.a, metalness: 0.4, roughness: 0.45 });
    const matB = new THREE.MeshStandardMaterial({ color: c.b, metalness: 0.4, roughness: 0.45 });
    const matS = new THREE.MeshStandardMaterial({ color: c.s, metalness: 0.3, roughness: 0.7 });
    const matT = new THREE.MeshStandardMaterial({ color: c.tool, metalness: 0.5, roughness: 0.3, emissive: c.tool, emissiveIntensity: 0.25 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.2 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    let grid = new THREE.GridHelper(16, 16, c.g1, c.g2);
    scene.add(grid);

    // helpers para crear cuerpos
    const box = (x, y, z, m) => { const g = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), m); g.castShadow = true; return g; };
    const cyl = (r1, r2, hh, m) => { const g = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, hh, 24), m); g.castShadow = true; return g; };
    const sph = (r, m) => { const g = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 20), m); g.castShadow = true; return g; };

    // construir robot según tipo; devuelve función update(t)
    const partes = construir(tipo, scene, { box, cyl, sph, matA, matB, matS, matT });

    const applyTheme = () => {
      c = pal();
      matA.color.setHex(c.a); matB.color.setHex(c.b); matS.color.setHex(c.s);
      matT.color.setHex(c.tool); matT.emissive.setHex(c.tool);
      scene.remove(grid);
      grid = new THREE.GridHelper(16, 16, c.g1, c.g2);
      scene.add(grid);
    };
    const themeObs = new MutationObserver(applyTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let raf, t = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      const dt = clock.getDelta();
      if (!reduce) t += dt;
      partes.update(t);
      controls.update(); // aplica damping y autoRotate
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    // Sólo animar cuando la pieza está (al menos parcialmente) en pantalla.
    // Al salir, se cancela el bucle para no gastar GPU/CPU; al volver, se reanuda.
    let visible = false;
    const arrancar = () => {
      if (raf) return; // ya corriendo
      clock.getDelta(); // descartar el salto de tiempo acumulado
      loop();
    };
    const parar = () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) arrancar();
        else parar();
      },
      { rootMargin: '120px 0px', threshold: 0 }
    );
    io.observe(mount);
    // un primer render para que no se vea en negro mientras llega a pantalla
    partes.update(0);
    renderer.render(scene, camera);
    // pausar también si la pestaña pasa a segundo plano
    const onVis = () => {
      if (document.hidden) parar();
      else if (visible) arrancar();
    };
    document.addEventListener('visibilitychange', onVis);

    const ro = new ResizeObserver(() => {
      const ww = mount.clientWidth, hh = mount.clientHeight || 260;
      camera.aspect = ww / hh; camera.updateProjectionMatrix(); renderer.setSize(ww, hh);
    });
    ro.observe(mount);

    return () => {
      parar();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      themeObs.disconnect(); ro.disconnect();
      renderer.dispose();
      controls.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [tipo]);

  return (
    <figure className="robot-anim3d">
      <div ref={mountRef} className="robot-anim3d-canvas" aria-label={`Robot ${tipo} en 3D`} />
      <figcaption>{LEYENDAS[tipo]}</figcaption>
    </figure>
  );
}

const LEYENDAS = {
  cartesiano: 'Robot cartesiano (PPP): tres deslizamientos lineales sobre los ejes X, Y, Z.',
  cilindrico: 'Robot cilíndrico: rotación de base + desplazamiento vertical y radial.',
  polar: 'Robot polar (esférico): rotación de base, giro de hombro y extensión lineal.',
  scara: 'Robot SCARA (RRP): dos giros horizontales y un descenso vertical.',
  articulado: 'Robot articulado (RRR): tres articulaciones rotacionales, como un brazo humano.',
};

const osc = (t, period, phase = 0) => 0.5 + 0.5 * Math.sin((t / period) * Math.PI * 2 + phase);

function construir(tipo, scene, k) {
  const { box, cyl, sph, matA, matB, matS, matT } = k;

  if (tipo === 'cartesiano') {
    // pórtico: riel X arriba, carro que baja en Y, herramienta en Z
    const rielX = box(6, 0.3, 0.3, matS); rielX.position.set(0, 4, -1.5); scene.add(rielX);
    const postIzq = box(0.3, 4, 0.3, matS); postIzq.position.set(-3, 2, -1.5); scene.add(postIzq);
    const postDer = box(0.3, 4, 0.3, matS); postDer.position.set(3, 2, -1.5); scene.add(postDer);
    const carro = box(0.6, 0.5, 0.6, matA); scene.add(carro);
    const columnaY = box(0.3, 3, 0.3, matB); scene.add(columnaY);
    const brazoZ = box(0.3, 0.3, 2.5, matA); scene.add(brazoZ);
    const tool = sph(0.25, matT); scene.add(tool);
    return {
      update(t) {
        const x = -2.5 + osc(t, 4) * 5;
        const y = 3.4 - osc(t, 5, 1) * 2.2;
        const z = -1.5 + osc(t, 3.5, 2) * 2.5;
        carro.position.set(x, 4, -1.5);
        columnaY.position.set(x, y + 1.3, -1.5);
        brazoZ.position.set(x, y, (z - 1.5) / 2 - 0.75 + 0.75);
        brazoZ.position.z = (z + -1.5) / 2;
        tool.position.set(x, y, z);
      },
    };
  }

  if (tipo === 'cilindrico') {
    const base = cyl(1.1, 1.3, 0.4, matS); base.position.y = 0.2; scene.add(base);
    const columna = new THREE.Group(); scene.add(columna);
    const colMesh = cyl(0.35, 0.35, 4, matA); colMesh.position.y = 2; columna.add(colMesh);
    const carro = new THREE.Group(); columna.add(carro);
    const brazo = box(2.5, 0.35, 0.35, matB); brazo.position.x = 1.25; carro.add(brazo);
    const tool = sph(0.22, matT); tool.position.x = 2.5; carro.add(tool);
    return {
      update(t) {
        columna.rotation.y = (osc(t, 6) - 0.5) * 3;
        carro.position.y = 1 + osc(t, 5, 1) * 2.4;
        const ext = osc(t, 4, 2);
        brazo.scale.x = 0.6 + ext * 0.7;
        brazo.position.x = 1.25 * (0.6 + ext * 0.7);
        tool.position.x = 2.5 * (0.6 + ext * 0.7);
      },
    };
  }

  if (tipo === 'polar') {
    const base = cyl(1.1, 1.3, 0.4, matS); base.position.y = 0.2; scene.add(base);
    const baseRot = new THREE.Group(); baseRot.position.y = 0.4; scene.add(baseRot);
    const tronco = cyl(0.35, 0.35, 1.6, matS); tronco.position.y = 0.8; baseRot.add(tronco);
    const hombro = new THREE.Group(); hombro.position.y = 1.6; baseRot.add(hombro);
    const brazo = box(3, 0.35, 0.35, matA); brazo.position.x = 1.5; hombro.add(brazo);
    const tool = sph(0.22, matT); tool.position.x = 3; hombro.add(tool);
    return {
      update(t) {
        baseRot.rotation.y = (osc(t, 7) - 0.5) * 2.4;
        hombro.rotation.z = -0.3 - osc(t, 5, 1) * 0.7;
        const ext = 0.7 + osc(t, 4, 2) * 0.6;
        brazo.scale.x = ext; brazo.position.x = 1.5 * ext; tool.position.x = 3 * ext;
      },
    };
  }

  if (tipo === 'scara') {
    const base = cyl(0.7, 0.9, 3, matS); base.position.y = 1.5; scene.add(base);
    const hombro = new THREE.Group(); hombro.position.y = 3; scene.add(hombro);
    const j1 = cyl(0.4, 0.4, 0.5, matS); j1.rotation.x = Math.PI / 2; hombro.add(j1);
    const brazo1 = box(2.2, 0.32, 0.32, matA); brazo1.position.x = 1.1; hombro.add(brazo1);
    const codo = new THREE.Group(); codo.position.x = 2.2; hombro.add(codo);
    const brazo2 = box(1.8, 0.3, 0.3, matB); brazo2.position.x = 0.9; codo.add(brazo2);
    const husillo = new THREE.Group(); husillo.position.x = 1.8; codo.add(husillo);
    const husMesh = cyl(0.1, 0.1, 1.5, matS); husMesh.position.y = -0.2; husillo.add(husMesh);
    const tool = new THREE.Group(); husillo.add(tool);
    const toolMesh = cyl(0.16, 0.1, 0.5, matT); tool.add(toolMesh);
    return {
      update(t) {
        hombro.rotation.y = (osc(t, 6) - 0.5) * 2.2;
        codo.rotation.y = (osc(t, 4, 1) - 0.5) * 2.8;
        tool.position.y = -osc(t, 3, 2) * 1.3;
      },
    };
  }

  // articulado (RRR)
  const base = cyl(1, 1.2, 0.4, matS); base.position.y = 0.2; scene.add(base);
  const baseRot = new THREE.Group(); baseRot.position.y = 0.4; scene.add(baseRot);
  const hombro = new THREE.Group(); hombro.position.y = 0.4; baseRot.add(hombro);
  const brazo1 = box(0.35, 2.4, 0.35, matA); brazo1.position.y = 1.2; hombro.add(brazo1);
  const codo = new THREE.Group(); codo.position.y = 2.4; hombro.add(codo);
  const brazo2 = box(0.3, 2, 0.3, matB); brazo2.position.y = 1; codo.add(brazo2);
  const muneca = new THREE.Group(); muneca.position.y = 2; codo.add(muneca);
  const brazo3 = box(0.25, 1, 0.25, matA); brazo3.position.y = 0.5; muneca.add(brazo3);
  const tool = sph(0.2, matT); tool.position.y = 1; muneca.add(tool);
  return {
    update(t) {
      baseRot.rotation.y = (osc(t, 8) - 0.5) * 1.6;
      hombro.rotation.z = 0.2 + (osc(t, 6, 1) - 0.5) * 0.9;
      codo.rotation.z = -0.6 - osc(t, 5, 2) * 0.8;
      muneca.rotation.z = (osc(t, 4, 3) - 0.5) * 1.2;
    },
  };
}
