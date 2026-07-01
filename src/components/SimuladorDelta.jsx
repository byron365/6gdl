import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { crearEtiqueta } from '../lib/etiqueta3d.js';

/**
 * Simulador de un robot DELTA (paralelo de 3 GDL traslacionales).
 *
 * Geometría estándar (convención de Trossen / Olsson):
 *   f  = lado del triángulo de la base fija
 *   e  = lado del triángulo de la plataforma móvil
 *   rf = longitud del brazo superior (actuado por el motor)
 *   re = longitud del antebrazo (paralelogramo)
 *
 * Cinemática inversa: dado un punto (x, y, z) de la plataforma, calcula los
 * tres ángulos de los motores (theta1, theta2, theta3). Los tres brazos están
 * a 0°, 120° y 240°. Para cada uno se resuelve en su plano la intersección
 * de dos circunferencias (brazo y antebrazo proyectado).
 */

// parámetros geométricos (en unidades de escena)
const F = 3.4;   // lado base
const E = 1.6;   // lado plataforma
const RF = 2.0;  // brazo superior
const RE = 4.2;  // antebrazo

const SQRT3 = Math.sqrt(3);
const DEG = Math.PI / 180;

// puntos de una circunferencia de radio r en el plano YZ (X=0), para los círculos guía
function circlePoints(r, n = 64) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(0, Math.cos(a) * r, Math.sin(a) * r));
  }
  return pts;
}

// Cinemática inversa de UN brazo en el plano YZ (el brazo a 0°).
// Devuelve el ángulo theta del motor (en radianes) o null si no alcanza.
function anguloBrazo(x0, y0, z0) {
  const y1 = -0.5 * (F / SQRT3); // posición del motor en Y (base)
  const y = y0 - 0.5 * (E / SQRT3); // desplaza al plano del brazo
  // a*z^2 + b*z + c = 0 ... resolvemos para el ángulo
  const a = (x0 * x0 + y * y + z0 * z0 + RF * RF - RE * RE - y1 * y1) / (2 * z0);
  const b = (y1 - y) / z0;
  const d = -(a + b * y1) * (a + b * y1) + RF * (b * b * RF + RF);
  if (d < 0) return null; // no alcanzable
  const yj = (y1 - a * b - Math.sqrt(d)) / (b * b + 1);
  const zj = a + b * yj;
  return Math.atan2(-zj, y1 - yj);
}

// Cinemática inversa completa con desglose por brazo.
// Devuelve { angulos: [t1,t2,t3], pasos: [{punto, theta}, ...] } o null.
function cinematicaInversa(x, y, z) {
  const cos120 = -0.5, sin120 = SQRT3 / 2;
  // cada brazo "ve" el punto rotado a su propio plano
  const puntos = [
    { x, y, z },
    { x: x * cos120 + y * sin120, y: y * cos120 - x * sin120, z },
    { x: x * cos120 - y * sin120, y: y * cos120 + x * sin120, z },
  ];
  const thetas = puntos.map((p) => anguloBrazo(p.x, p.y, p.z));
  if (thetas.some((t) => t === null)) return null;
  return {
    angulos: thetas,
    pasos: puntos.map((p, i) => ({ punto: p, theta: thetas[i] })),
  };
}

export default function SimuladorDelta() {
  const mountRef = useRef(null);
  const refs = useRef({});
  const [pos, setPos] = useState({ x: 0, y: 0, z: -4.5 });
  const [brazoActivo, setBrazoActivo] = useState(0); // qué brazo se desglosa

  // cinemática inversa reactiva (con desglose por brazo)
  const ci = useMemo(() => cinematicaInversa(pos.x, pos.y, pos.z), [pos]);
  const alcanzable = ci !== null;
  const angulos = ci ? ci.angulos : null;

  // --- montaje de la escena 3D ---
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';
    const pal = () =>
      isLight()
        ? { base: 0x44556a, arm: 0xd97706, fore: 0x6b7a8f, plat: 0x0f9c8a, g1: 0x9fb3c4, g2: 0xc9d6e0 }
        : { base: 0x324259, arm: 0xff9e2c, fore: 0x8595a8, plat: 0x38d9c4, g1: 0x24364a, g2: 0x182433 };

    const scene = new THREE.Scene();
    const w = mount.clientWidth, h = mount.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(8, 4, 9);

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
    controls.minDistance = 6;
    controls.maxDistance = 26;
    controls.target.set(0, -2.2, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(6, 10, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    let c = pal();
    const matBase = new THREE.MeshStandardMaterial({ color: c.base, metalness: 0.3, roughness: 0.7 });
    const matArm = new THREE.MeshStandardMaterial({ color: c.arm, metalness: 0.4, roughness: 0.45 });
    const matFore = new THREE.MeshStandardMaterial({ color: c.fore, metalness: 0.3, roughness: 0.6 });
    const matPlat = new THREE.MeshStandardMaterial({ color: c.plat, metalness: 0.5, roughness: 0.35, emissive: c.plat, emissiveIntensity: 0.2 });

    // base fija (triángulo arriba)
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(F / SQRT3 + 0.3, F / SQRT3 + 0.3, 0.3, 3), matBase);
    baseMesh.position.y = 0;
    baseMesh.rotation.y = Math.PI / 6;
    baseMesh.castShadow = true;
    scene.add(baseMesh);

    // Convención: el robot trabaja en coordenadas (x, y, z) del Delta donde z es
    // la altura (negativa hacia abajo). En la escena Three.js, Y_three = z (altura)
    // y el plano del suelo es (x, y). El motor del brazo i está en el sistema del
    // brazo en (0, -F/(2√3)) rotado por phi = i*120°.
    const yBase = -0.5 * (F / SQRT3); // posición radial del motor (negativa)
    const brazos = [];
    for (let i = 0; i < 3; i++) {
      const phi = i * 120 * DEG;
      // rotamos el punto (0, yBase) por phi: (x',y') = (-yBase*sin, yBase*cos)
      const motorX = 0 * Math.cos(phi) - yBase * Math.sin(phi);
      const motorY = 0 * Math.sin(phi) + yBase * Math.cos(phi);

      // motor (cilindro) en el borde de la base
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 16), matBase);
      motor.position.set(motorX, 0, motorY);
      motor.rotation.z = Math.PI / 2;
      motor.rotation.y = -phi;
      scene.add(motor);

      // brazo superior (caja) — su posición se actualiza por código
      const brazo = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, RF), matArm);
      brazo.castShadow = true;
      scene.add(brazo);

      // antebrazo (cilindro) entre codo y plataforma
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, RE, 8), matFore);
      fore.castShadow = true;
      scene.add(fore);

      // etiqueta de ángulo del motor
      const etiq = crearEtiqueta({ escala: 0.85 });
      scene.add(etiq.sprite);

      // círculos guía de la cinemática inversa (visibles solo en el brazo activo):
      // - circunferencia del BRAZO (radio RF) centrada en el motor
      // - circunferencia del ANTEBRAZO (radio RE) centrada en el vértice de plataforma
      const circuloBrazo = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(circlePoints(RF)),
        new THREE.LineBasicMaterial({ color: c.arm, transparent: true, opacity: 0.9 })
      );
      const circuloFore = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(circlePoints(RE)),
        new THREE.LineDashedMaterial({ color: c.plat, transparent: true, opacity: 0.8, dashSize: 0.25, gapSize: 0.18 })
      );
      circuloFore.computeLineDistances();
      circuloBrazo.visible = false;
      circuloFore.visible = false;
      scene.add(circuloBrazo);
      scene.add(circuloFore);

      brazos.push({ phi, motorX, motorY, brazo, fore, etiq, circuloBrazo, circuloFore });
    }

    // plataforma móvil
    const plataforma = new THREE.Mesh(new THREE.CylinderGeometry(E / SQRT3 + 0.15, E / SQRT3 + 0.15, 0.18, 3), matPlat);
    plataforma.castShadow = true;
    scene.add(plataforma);
    const efector = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), matPlat);
    scene.add(efector);

    // rastro del efector (línea que se desvanece)
    const MAX_RASTRO = 60;
    const rastroPos = new Float32Array(MAX_RASTRO * 3);
    const rastroGeo = new THREE.BufferGeometry();
    rastroGeo.setAttribute('position', new THREE.BufferAttribute(rastroPos, 3));
    const rastroMat = new THREE.LineBasicMaterial({ color: c.plat, transparent: true, opacity: 0.5 });
    const rastroLinea = new THREE.Line(rastroGeo, rastroMat);
    rastroLinea.frustumCulled = false;
    scene.add(rastroLinea);
    const rastroPuntos = []; // historial de Vector3

    // suelo
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.18 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -8;
    floor.receiveShadow = true;
    scene.add(floor);
    let grid = new THREE.GridHelper(24, 24, c.g1, c.g2);
    grid.position.y = -8;
    scene.add(grid);

    refs.current = { scene, camera, renderer, controls, brazos, plataforma, efector, matBase, matArm, matFore, matPlat, pal, rastroLinea, rastroPuntos, brazoActivo: 0, getGrid: () => grid, setGrid: (x) => { grid = x; } };

    const applyTheme = () => {
      const c2 = pal();
      matBase.color.setHex(c2.base); matArm.color.setHex(c2.arm);
      matFore.color.setHex(c2.fore); matPlat.color.setHex(c2.plat); matPlat.emissive.setHex(c2.plat);
      scene.remove(grid);
      grid = new THREE.GridHelper(24, 24, c2.g1, c2.g2);
      grid.position.y = -8;
      scene.add(grid);
      brazos.forEach((br) => br.etiq && br.etiq.redibujar());
    };
    const themeObs = new MutationObserver(applyTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let raf;
    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const ro = new ResizeObserver(() => {
      const ww = mount.clientWidth, hh = mount.clientHeight || 420;
      camera.aspect = ww / hh; camera.updateProjectionMatrix(); renderer.setSize(ww, hh);
    });
    ro.observe(mount);

    refs.current.actualizar = (x, y, z, angs) => {
      const r = refs.current;
      if (!r.brazos) return;
      // plataforma y efector: Three usa (x, altura=z, y)
      r.plataforma.position.set(x, z, y);
      r.efector.position.set(x, z, y);

      // registrar rastro del efector
      r.rastroPuntos.push(new THREE.Vector3(x, z, y));
      if (r.rastroPuntos.length > MAX_RASTRO) r.rastroPuntos.shift();
      const arr = r.rastroLinea.geometry.attributes.position.array;
      for (let k = 0; k < MAX_RASTRO; k++) {
        const pt = r.rastroPuntos[k] || r.rastroPuntos[r.rastroPuntos.length - 1] || new THREE.Vector3(x, z, y);
        arr[k * 3] = pt.x; arr[k * 3 + 1] = pt.y; arr[k * 3 + 2] = pt.z;
      }
      r.rastroLinea.geometry.attributes.position.needsUpdate = true;
      r.rastroLinea.geometry.setDrawRange(0, r.rastroPuntos.length);

      const yBaseL = -0.5 * (F / SQRT3);
      const yPlatL = -0.5 * (E / SQRT3);
      const up = new THREE.Vector3(0, 1, 0);

      r.brazos.forEach((br, i) => {
        const phi = br.phi;
        const th = angs[i];
        // codo en el sistema del brazo (plano YZ): (0, yBase - RF cos, -RF sin)
        const yC = yBaseL - RF * Math.cos(th);
        const zC = -RF * Math.sin(th);
        // rotar (0, yC) por phi en el plano XY del Delta
        const codoX = -yC * Math.sin(phi);
        const codoY = yC * Math.cos(phi);
        // en Three: (codoX, altura=zC, codoY)
        const codo = new THREE.Vector3(codoX, zC, codoY);
        const motor = new THREE.Vector3(br.motorX, 0, br.motorY);

        // brazo superior: entre motor y codo
        const midB = motor.clone().add(codo).multiplyScalar(0.5);
        br.brazo.position.copy(midB);
        const dirB = codo.clone().sub(motor);
        br.brazo.scale.z = dirB.length() / RF;
        br.brazo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dirB.clone().normalize());

        // etiqueta del ángulo, junto al codo
        if (br.etiq) {
          br.etiq.set(`θ${i + 1}=${(th * 180 / Math.PI).toFixed(0)}°`);
          br.etiq.sprite.position.set(midB.x, midB.y + 0.5, midB.z);
        }

        // vértice de la plataforma para este brazo
        const pvx = -yPlatL * Math.sin(phi);
        const pvy = yPlatL * Math.cos(phi);
        const platPoint = new THREE.Vector3(x + pvx, z, y + pvy);

        // antebrazo: entre codo y platPoint
        const midF = codo.clone().add(platPoint).multiplyScalar(0.5);
        br.fore.position.copy(midF);
        const dirF = platPoint.clone().sub(codo);
        br.fore.scale.y = dirF.length() / RE;
        br.fore.quaternion.setFromUnitVectors(up, dirF.clone().normalize());

        // círculos guía de la CI: visibles solo en el brazo activo.
        // El círculo del brazo (RF) se centra en el motor; el del antebrazo (RE),
        // en el vértice de la plataforma. Ambos en el plano del brazo (rotado phi).
        const activo = i === r.brazoActivo;
        br.circuloBrazo.visible = activo;
        br.circuloFore.visible = activo;
        if (activo) {
          br.circuloBrazo.position.set(br.motorX, 0, br.motorY);
          br.circuloBrazo.rotation.y = -phi;
          br.circuloFore.position.copy(platPoint);
          br.circuloFore.rotation.y = -phi;
        }
      });
    };

    return () => {
      cancelAnimationFrame(raf);
      themeObs.disconnect(); ro.disconnect();
      renderer.dispose(); controls.dispose();
      brazos.forEach((br) => br.etiq && br.etiq.dispose());
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  // aplicar posición y ángulos al 3D cuando cambian
  useEffect(() => {
    refs.current.brazoActivo = brazoActivo;
    if (refs.current.actualizar && angulos) {
      refs.current.actualizar(pos.x, pos.y, pos.z, angulos);
    }
  }, [pos, angulos, brazoActivo]);

  const fmt = (n) => (n * 50).toFixed(0); // a "mm" aprox
  const fmtAng = (rad) => (rad / DEG).toFixed(1);

  return (
    <div className="sim-delta">
      <div className="sim-delta-canvas">
        <div ref={mountRef} className="sim-delta-3d" aria-label="Robot Delta en 3D" />
        <p className="sim-delta-hint">Arrastra para rotar · rueda para acercar</p>
      </div>

      <div className="sim-delta-panel">
        <div className="sim-slider">
          <label><span>X</span><span className="sim-val">{fmt(pos.x)} mm</span></label>
          <input type="range" min="-3" max="3" step="0.1" value={pos.x} onChange={(e) => setPos((p) => ({ ...p, x: +e.target.value }))} />
        </div>
        <div className="sim-slider">
          <label><span>Y</span><span className="sim-val">{fmt(pos.y)} mm</span></label>
          <input type="range" min="-3" max="3" step="0.1" value={pos.y} onChange={(e) => setPos((p) => ({ ...p, y: +e.target.value }))} />
        </div>
        <div className="sim-slider">
          <label><span>Z (altura)</span><span className="sim-val">{fmt(pos.z)} mm</span></label>
          <input type="range" min="-6.5" max="-3" step="0.1" value={pos.z} onChange={(e) => setPos((p) => ({ ...p, z: +e.target.value }))} />
        </div>

        <div className={`sim-lectura ${alcanzable ? '' : 'sim-lectura-error'}`}>
          <p className="sim-lectura-titulo">Cinemática inversa por brazo</p>
          {alcanzable ? (
            <>
              <div className="sim-delta-brazos">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    className={`sim-delta-brazo ${brazoActivo === i ? 'activo' : ''}`}
                    onClick={() => setBrazoActivo(i)}
                  >
                    θ{i + 1} = <b>{fmtAng(angulos[i])}°</b>
                  </button>
                ))}
              </div>

              <div className="sim-delta-desglose">
                <p className="sim-delta-desglose-tit">Brazo {brazoActivo + 1} · paso a paso</p>
                <div className="sim-ec sim-ec-faint">1. El punto se proyecta al plano del brazo:</div>
                <div className="sim-ec">P' = ({fmt(ci.pasos[brazoActivo].punto.x)}, {fmt(ci.pasos[brazoActivo].punto.y)}, {fmt(ci.pasos[brazoActivo].punto.z)})</div>
                <div className="sim-ec sim-ec-faint">2. Se cruzan dos circunferencias:</div>
                <div className="sim-ec">brazo R<sub>F</sub>={fmt(RF)} · antebrazo R<sub>E</sub>={fmt(RE)}</div>
                <div className="sim-ec sim-ec-faint">3. El codo está en la intersección, y de ahí:</div>
                <div className="sim-ec">θ{brazoActivo + 1} = <b>{fmtAng(angulos[brazoActivo])}°</b></div>
              </div>
              <p className="sim-ec sim-ec-faint" style={{ marginTop: '.4rem' }}>El brazo activo se resalta en la escena 3D.</p>
            </>
          ) : (
            <div className="sim-ec sim-ec-faint">Posición fuera del espacio de trabajo alcanzable</div>
          )}
        </div>

        <div className="sim-acciones">
          <button className="sim-btn" onClick={() => setPos({ x: 0, y: 0, z: -4.5 })}>Centro</button>
          <button className="sim-btn" onClick={() => setPos({ x: 1.5, y: 1.2, z: -4 })}>Esquina</button>
          <button className="sim-btn" onClick={() => setPos({ x: 0, y: 0, z: -6 })}>Abajo</button>
        </div>

        <p className="sim-ayuda">
          El robot Delta mueve su plataforma en X, Y, Z manteniéndola siempre horizontal. Cada punto se logra resolviendo la cinemática inversa de sus tres brazos.
        </p>
      </div>
    </div>
  );
}
