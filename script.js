const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    nav.classList.toggle("open", !isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      nav.classList.remove("open");
    });
  });
}

const revealItems = document.querySelectorAll(
  ".section-heading, .project-card, .manifesto-left, .manifesto-right, .capability-row, .toolbelt, .contact-content"
);

function setupRevealFallback() {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item, index) => {
    item.classList.add("reveal");
    if (item.classList.contains("capability-row")) item.style.transitionDelay = `${(index % 4) * 45}ms`;
    observer.observe(item);
  });
}

function setupGsapReveals() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) {
    setupRevealFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({
    reduceMotion: "(prefers-reduced-motion: reduce)",
    mobile: "(max-width: 640px)",
  }, ({ conditions }) => {
    if (conditions.reduceMotion) {
      gsap.set(revealItems, { autoAlpha: 1, y: 0 });
      return;
    }

    revealItems.forEach((item, index) => {
      const isCapability = item.classList.contains("capability-row");
      gsap.fromTo(item,
        { autoAlpha: 0, y: conditions.mobile ? 14 : 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: conditions.mobile ? 0.5 : 0.7,
          delay: isCapability ? (index % 4) * 0.045 : 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: conditions.mobile ? "top 94%" : "top 88%",
            once: true,
          },
        }
      );
    });
  });
}

setupGsapReveals();

function createModelRoute(smallScreen) {
  if (smallScreen) {
    return [
      { x: 0.50, y: 0.66, scale: 0.5, rx: -0.1, ry: 0, rz: 0 },
      { x: 0.22, y: 0.45, scale: 0.39, rx: 0.2, ry: 1.6, rz: -0.16 },
      { x: 0.78, y: 0.61, scale: 0.47, rx: -0.12, ry: 3.0, rz: 0.18 },
      { x: 0.28, y: 0.48, scale: 0.39, rx: 0.23, ry: 4.5, rz: -0.2 },
      { x: 0.73, y: 0.62, scale: 0.48, rx: -0.16, ry: 6.0, rz: 0.14 },
    ];
  }

  return [
    { x: 0.73, y: 0.48, scale: 0.82, rx: -0.12, ry: 0, rz: 0.04 },
    { x: 0.22, y: 0.47, scale: 0.62, rx: 0.3, ry: 1.7, rz: -0.2 },
    { x: 0.78, y: 0.58, scale: 0.88, rx: -0.18, ry: 3.25, rz: 0.22 },
    { x: 0.28, y: 0.45, scale: 0.62, rx: 0.33, ry: 4.85, rz: -0.2 },
    { x: 0.76, y: 0.52, scale: 0.84, rx: -0.12, ry: 6.25, rz: 0.18 },
  ];
}

async function addThreeDimensionalArt() {
  const canvas = document.querySelector("#site-canvas");
  if (!canvas) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js");
    const compactScreen = window.matchMedia("(max-width: 850px)").matches;
    const smallScreen = window.matchMedia("(max-width: 640px)").matches;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    camera.position.set(0, 0, 7.2);

    scene.add(new THREE.HemisphereLight(0xffe9dc, 0x49211b, 1.25));
    const keyLight = new THREE.DirectionalLight(0xffe5d4, 2.6);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xf04b3c, 16, 12);
    rimLight.position.set(3, -1, 3.2);
    scene.add(rimLight);

    const sculpture = new THREE.Group();
    scene.add(sculpture);

    const segments = smallScreen ? 56 : 88;
    const coreGeometry = new THREE.SphereGeometry(0.91, segments, Math.round(segments * 0.72));
    const vertices = coreGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i += 1) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const z = vertices.getZ(i);
      const displacement = 1 + 0.035 * Math.sin(x * 5.2 + y * 2.4) * Math.sin(z * 4.1 - x * 2.2);
      vertices.setXYZ(i, x * displacement, y * displacement, z * displacement);
    }
    coreGeometry.computeVertexNormals();

    const core = new THREE.Mesh(coreGeometry, new THREE.MeshPhysicalMaterial({
      color: 0xb72218,
      roughness: 0.24,
      metalness: 0.08,
      clearcoat: 0.9,
      clearcoatRoughness: 0.16,
    }));
    sculpture.add(core);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc5b2,
      transparent: true,
      opacity: 0.48,
    });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.009, 8, 128), haloMaterial);
    halo.rotation.set(0.68, 0.24, -0.34);
    sculpture.add(halo);

    const innerHalo = new THREE.Mesh(
      new THREE.TorusGeometry(1.13, 0.004, 6, 128),
      new THREE.MeshBasicMaterial({ color: 0x6d211b, transparent: true, opacity: 0.36 })
    );
    innerHalo.rotation.set(-0.46, 0.9, 0.3);
    sculpture.add(innerHalo);

    const render = () => renderer.render(scene, camera);
    const resize = () => {
      const width = window.innerWidth;
      const height = window.visualViewport?.height || window.innerHeight;
      const isSmall = window.matchMedia("(max-width: 640px)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.15 : 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      render();
    };

    const worldPoint = (x, y) => {
      const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const viewWidth = viewHeight * camera.aspect;
      return { x: (x - 0.5) * viewWidth, y: (0.5 - y) * viewHeight };
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.visualViewport?.addEventListener("resize", resize, { passive: true });
    document.querySelector(".hero-art")?.classList.add("webgl-ready");

    const initialStop = createModelRoute(compactScreen)[0];
    const initialPoint = worldPoint(initialStop.x, initialStop.y);
    sculpture.position.set(initialPoint.x, initialPoint.y, 0);
    sculpture.scale.setScalar(initialStop.scale);
    sculpture.rotation.set(initialStop.rx, initialStop.ry, initialStop.rz);
    render();

    if (window.gsap && window.ScrollTrigger) {
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);
      const media = gsap.matchMedia();
      media.add({
        reduceMotion: "(prefers-reduced-motion: reduce)",
        compact: "(max-width: 850px)",
      }, ({ conditions }) => {
        if (conditions.reduceMotion) return;

        const route = createModelRoute(conditions.compact);
        const path = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1,
            invalidateOnRefresh: true,
          },
        });

        route.slice(1).forEach((stop, index) => {
          const at = index;
          path.to(sculpture.position, {
            x: () => worldPoint(stop.x, stop.y).x,
            y: () => worldPoint(stop.x, stop.y).y,
            duration: 1,
            ease: "none",
          }, at);
          path.to(sculpture.scale, {
            x: stop.scale,
            y: stop.scale,
            z: stop.scale,
            duration: 1,
            ease: "none",
          }, at);
          path.to(sculpture.rotation, {
            x: stop.rx,
            y: stop.ry,
            z: stop.rz,
            duration: 1,
            ease: "none",
          }, at);
        });
        path.eventCallback("onUpdate", render);
        render();
      });
    } else {
      render();
    }
  } catch {
    // Keep the CSS sculpture visible if WebGL or the Three.js CDN is unavailable.
  }
}

addThreeDimensionalArt();
