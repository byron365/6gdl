import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Brazo robótico RR de 2 grados de libertad en 3D.
 * - Dos eslabones articulados con base, juntas y efector final.
 * - Animación suave de los dos ángulos articulares (cinemática directa).
 * - Rejilla de suelo estilo blueprint y leve auto-rotación de cámara.
 * - Respeta prefers-reduced-motion y se adapta al tema claro/oscuro.
 */
export default function RoboArm3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // --- colores segun tema -------------------------------------------------
    const isLight = () =>
      document.documentElement.getAttribute('data-theme') === 'light';

    const palette = () =>
      isLight()
        ? {
            link1: 0xd97706,
            link2: 0xea8a1a,
            joint: 0x16202f,
            effector: 0x0f9c8a,
            grid1: 0x9fb3c4,
            grid2: 0xc9d6e0,
            base: 0x44556a,
          }
        : {
            link1: 0xff9e2c,
            link2: 0xffb84d,
            joint: 0x0d1421,
            effector: 0x38d9c4,
            grid1: 0x24364a,
            grid2: 0x182433,
            base: 0x324259,
          };

    // --- escena -------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = null; // transparente

    const width = mount.clientWidth;
    const height = mount.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.5, 6.5);
    camera.lookAt(0, 1.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // --- luces --------------------------------------------------------------
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 30;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x38d9c4, 0.4);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    // --- materiales (se actualizan al cambiar de tema) ----------------------
    let c = palette();
    const matLink1 = new THREE.MeshStandardMaterial({ color: c.link1, metalness: 0.4, roughness: 0.45 });
    const matLink2 = new THREE.MeshStandardMaterial({ color: c.link2, metalness: 0.4, roughness: 0.45 });
    const matJoint = new THREE.MeshStandardMaterial({ color: c.joint, metalness: 0.2, roughness: 0.6 });
    const matEffector = new THREE.MeshStandardMaterial({ color: c.effector, metalness: 0.5, roughness: 0.3, emissive: c.effector, emissiveIntensity: 0.25 });
    const matBase = new THREE.MeshStandardMaterial({ color: c.base, metalness: 0.3, roughness: 0.7 });

    // --- suelo (sombra) y rejilla ------------------------------------------
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    let grid = new THREE.GridHelper(20, 20, c.grid1, c.grid2);
    scene.add(grid);

    // --- construccion del brazo --------------------------------------------
    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.4, 32), matBase);
    base.position.y = 0.2;
    base.castShadow = true;
    scene.add(base);

    // Junta 1 (hombro) — pivota alrededor de Z, sube en Y
    const shoulder = new THREE.Group();
    shoulder.position.y = 0.4;
    scene.add(shoulder);

    const joint1 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 32), matJoint);
    joint1.rotation.x = Math.PI / 2;
    joint1.castShadow = true;
    shoulder.add(joint1);

    // Eslabon 1 (longitud L1 = 2.4) a lo largo de Y local
    const L1 = 2.4;
    const link1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, L1, 0.42), matLink1);
    link1.position.y = L1 / 2;
    link1.castShadow = true;
    shoulder.add(link1);

    // Junta 2 (codo) al final del eslabon 1
    const elbow = new THREE.Group();
    elbow.position.y = L1;
    shoulder.add(elbow);

    const joint2 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.6, 32), matJoint);
    joint2.rotation.x = Math.PI / 2;
    joint2.castShadow = true;
    elbow.add(joint2);

    // Eslabon 2 (longitud L2 = 1.9)
    const L2 = 1.9;
    const link2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, L2, 0.34), matLink2);
    link2.position.y = L2 / 2;
    link2.castShadow = true;
    elbow.add(link2);

    // Efector final (pinza simplificada)
    const effector = new THREE.Group();
    effector.position.y = L2;
    elbow.add(effector);

    const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), matEffector);
    wrist.castShadow = true;
    effector.add(wrist);

    const finger1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.1), matEffector);
    finger1.position.set(0.18, 0.32, 0);
    effector.add(finger1);
    const finger2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.1), matEffector);
    finger2.position.set(-0.18, 0.32, 0);
    effector.add(finger2);

    // --- animacion ----------------------------------------------------------
    let raf;
    let t = 0;
    const clock = new THREE.Clock();

    function applyTheme() {
      c = palette();
      matLink1.color.setHex(c.link1);
      matLink2.color.setHex(c.link2);
      matJoint.color.setHex(c.joint);
      matEffector.color.setHex(c.effector);
      matEffector.emissive.setHex(c.effector);
      matBase.color.setHex(c.base);
      scene.remove(grid);
      grid = new THREE.GridHelper(20, 20, c.grid1, c.grid2);
      scene.add(grid);
    }

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    function animate() {
      const dt = clock.getDelta();
      t += dt;

      // Cinematica directa: dos angulos articulares oscilando
      const theta1 = 0.5 + Math.sin(t * 0.45) * 0.55;
      const theta2 = -0.4 + Math.sin(t * 0.7 + 1) * 0.9;

      shoulder.rotation.z = theta1;
      elbow.rotation.z = theta2;
      effector.rotation.z = Math.sin(t * 0.7) * 0.3;

      // Orbita lenta de camara
      const camAngle = t * 0.12;
      const r = 8.6;
      camera.position.x = Math.cos(camAngle) * r;
      camera.position.z = Math.sin(camAngle) * r;
      camera.position.y = 4.5;
      camera.lookAt(0, 1.6, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    if (reduceMotion) {
      // Pose estatica representativa
      shoulder.rotation.z = 0.6;
      elbow.rotation.z = -0.7;
      camera.position.set(6, 4.5, 7);
      camera.lookAt(0, 1.6, 0);
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // --- responsive ---------------------------------------------------------
    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    // --- limpieza -----------------------------------------------------------
    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', minHeight: '340px' }}
      aria-hidden="true"
    />
  );
}
