// Wersja 0.0.3
(function () {
    const canvas = document.getElementById('pipe-rack-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1628);
    scene.fog = new THREE.FogExp2(0x0a1628, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(9, 6, 11);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0x60a5fa, 0.25);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x93c5fd, 0.7);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.3);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const pointLight1 = new THREE.PointLight(0x60a5fa, 0.5, 25);
    pointLight1.position.set(0, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x2563eb, 0.3, 20);
    pointLight2.position.set(-5, 0, 3);
    scene.add(pointLight2);

    const pipeMat = new THREE.MeshPhongMaterial({
        color: 0x3b82f6, emissive: 0x1e3a5f,
        specular: 0x93c5fd, shininess: 90,
        transparent: true, opacity: 0
    });

    const pipeMatAlt = new THREE.MeshPhongMaterial({
        color: 0x2563eb, emissive: 0x172554,
        specular: 0x60a5fa, shininess: 80,
        transparent: true, opacity: 0
    });

    const pipeMatSmall = new THREE.MeshPhongMaterial({
        color: 0x0ea5e9, emissive: 0x0c4a6e,
        specular: 0x7dd3fc, shininess: 70,
        transparent: true, opacity: 0
    });

    const flangeMat = new THREE.MeshPhongMaterial({
        color: 0x64748b, emissive: 0x1e293b,
        specular: 0x94a3b8, shininess: 60,
        transparent: true, opacity: 0
    });

    const valveMat = new THREE.MeshPhongMaterial({
        color: 0x475569, emissive: 0x0f172a,
        specular: 0x94a3b8, shininess: 50,
        transparent: true, opacity: 0
    });

    const valveRedMat = new THREE.MeshPhongMaterial({
        color: 0xef4444, emissive: 0x7f1d1d,
        specular: 0xfca5a5, shininess: 60,
        transparent: true, opacity: 0
    });

    const valveGreenMat = new THREE.MeshPhongMaterial({
        color: 0x22c55e, emissive: 0x14532d,
        specular: 0x86efac, shininess: 60,
        transparent: true, opacity: 0
    });

    const tankMat = new THREE.MeshPhongMaterial({
        color: 0x334155, emissive: 0x0f172a,
        specular: 0x64748b, shininess: 40,
        transparent: true, opacity: 0
    });

    const tankCapMat = new THREE.MeshPhongMaterial({
        color: 0x475569, emissive: 0x1e293b,
        specular: 0x94a3b8, shininess: 50,
        transparent: true, opacity: 0
    });

    const allParts = [];

    function addPart(mesh) {
        scene.add(mesh);
        allParts.push(mesh);
        return mesh;
    }

    function createPipe(start, end, radius, material) {
        radius = radius || 0.06;
        material = material || pipeMat;

        const startVec = new THREE.Vector3(start[0], start[1], start[2]);
        const endVec = new THREE.Vector3(end[0], end[1], end[2]);
        const direction = new THREE.Vector3().subVectors(endVec, startVec);
        const length = direction.length();

        const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
        const mesh = new THREE.Mesh(geometry, material.clone());

        mesh.position.copy(startVec).add(endVec).multiplyScalar(0.5);
        mesh.setRotationFromQuaternion(
            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
        );

        return addPart(mesh);
    }

    function createElbow(position, radius) {
        radius = radius || 0.09;
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), pipeMat.clone());
        mesh.position.set(position[0], position[1], position[2]);
        return addPart(mesh);
    }

    function createFlange(position, axis, radius) {
        radius = radius || 0.14;
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.05, 16), flangeMat.clone());
        mesh.position.set(position[0], position[1], position[2]);

        if (axis === 'x') mesh.rotation.z = Math.PI / 2;
        if (axis === 'z') mesh.rotation.x = Math.PI / 2;
        addPart(mesh);

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const boltRadius = radius * 0.75;
            const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), valveMat.clone());

            if (axis === 'y') {
                bolt.position.set(position[0] + Math.cos(angle) * boltRadius, position[1], position[2] + Math.sin(angle) * boltRadius);
            } else if (axis === 'x') {
                bolt.position.set(position[0], position[1] + Math.cos(angle) * boltRadius, position[2] + Math.sin(angle) * boltRadius);
                bolt.rotation.z = Math.PI / 2;
            } else {
                bolt.position.set(position[0] + Math.cos(angle) * boltRadius, position[1] + Math.sin(angle) * boltRadius, position[2]);
                bolt.rotation.x = Math.PI / 2;
            }
            addPart(bolt);
        }
    }

    function createGateValve(position, axis, wheelMat) {
        wheelMat = wheelMat || pipeMat;

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 10), valveMat.clone());
        body.position.set(position[0], position[1], position[2]);
        if (axis === 'x') body.rotation.z = Math.PI / 2;
        if (axis === 'z') body.rotation.x = Math.PI / 2;
        addPart(body);

        const wheel = addPart(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 16), wheelMat.clone()));
        wheel.position.set(position[0], position[1] + 0.22, position[2]);

        const stem = addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 8), flangeMat.clone()));
        stem.position.set(position[0], position[1] + 0.12, position[2]);
    }

    function createBallValve(position) {
        const ball = addPart(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), valveMat.clone()));
        ball.position.set(position[0], position[1], position[2]);

        const handle = addPart(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.03), valveRedMat.clone()));
        handle.position.set(position[0], position[1] + 0.16, position[2]);

        const stem = addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6), flangeMat.clone()));
        stem.position.set(position[0], position[1] + 0.08, position[2]);
    }

    function createButterflyValve(position, axis) {
        const body = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 8, 16), valveMat.clone());
        body.position.set(position[0], position[1], position[2]);
        if (axis === 'x') body.rotation.y = Math.PI / 2;
        if (axis === 'z') body.rotation.x = Math.PI / 2;
        addPart(body);

        const lever = addPart(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.03), valveGreenMat.clone()));
        lever.position.set(position[0], position[1] + 0.17, position[2]);
        lever.rotation.z = 0.3;
    }

    function createCheckValve(position, axis) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 10), valveMat.clone());
        cone.position.set(position[0], position[1], position[2]);
        if (axis === 'x') cone.rotation.z = -Math.PI / 2;
        if (axis === 'z') cone.rotation.x = Math.PI / 2;
        addPart(cone);

        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), flangeMat.clone());
        if (axis === 'x') cap.position.set(position[0] + 0.14, position[1], position[2]);
        else if (axis === 'z') cap.position.set(position[0], position[1], position[2] + 0.14);
        else cap.position.set(position[0], position[1] + 0.14, position[2]);
        addPart(cap);
    }

    function createTee(position, radius) {
        radius = radius || 0.09;
        const mesh = addPart(new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), pipeMat.clone()));
        mesh.position.set(position[0], position[1], position[2]);
        return mesh;
    }

    function createReducer(position, axis, radiusLarge, radiusSmall) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radiusLarge, radiusSmall, 0.18, 12),
            pipeMat.clone()
        );
        mesh.position.set(position[0], position[1], position[2]);
        if (axis === 'x') mesh.rotation.z = Math.PI / 2;
        if (axis === 'z') mesh.rotation.x = Math.PI / 2;
        addPart(mesh);
    }

    function createNozzle(position, axis, radius) {
        radius = radius || 0.08;
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius * 1.3, 0.15, 12),
            flangeMat.clone()
        );
        mesh.position.set(position[0], position[1], position[2]);
        if (axis === 'x') mesh.rotation.z = Math.PI / 2;
        if (axis === 'z') mesh.rotation.x = Math.PI / 2;
        addPart(mesh);
    }

    function createVerticalTank(x, z, tankHeight, radius) {
        const bodyGeo = new THREE.CylinderGeometry(radius, radius, tankHeight, 20);
        addPart(new THREE.Mesh(bodyGeo, tankMat.clone())).position.set(x, tankHeight / 2, z);

        const topGeo = new THREE.SphereGeometry(radius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        addPart(new THREE.Mesh(topGeo, tankCapMat.clone())).position.set(x, tankHeight, z);

        const botGeo = new THREE.SphereGeometry(radius, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        addPart(new THREE.Mesh(botGeo, tankCapMat.clone())).position.set(x, 0, z);

        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), flangeMat.clone());
            leg.position.set(x + Math.cos(angle) * radius * 0.8, -0.3, z + Math.sin(angle) * radius * 0.8);
            addPart(leg);
        }
    }

    function createHorizontalTank(x, y, z, length, radius) {
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, length, 20),
            tankMat.clone()
        );
        body.position.set(x, y, z);
        body.rotation.z = Math.PI / 2;
        addPart(body);

        const cap1 = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            tankCapMat.clone()
        );
        cap1.position.set(x + length / 2, y, z);
        cap1.rotation.z = -Math.PI / 2;
        addPart(cap1);

        const cap2 = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
            tankCapMat.clone()
        );
        cap2.position.set(x - length / 2, y, z);
        cap2.rotation.z = Math.PI / 2;
        addPart(cap2);

        const saddle1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, radius * 1.2, radius * 2.2), flangeMat.clone());
        saddle1.position.set(x - length * 0.3, y - radius * 0.6, z);
        addPart(saddle1);

        const saddle2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, radius * 1.2, radius * 2.2), flangeMat.clone());
        saddle2.position.set(x + length * 0.3, y - radius * 0.6, z);
        addPart(saddle2);
    }

    createVerticalTank(-6, 0, 3.5, 0.7);
    createHorizontalTank(5.5, 1.5, 0, 2.5, 0.6);
    createNozzle([-6, 3.5, 0.7], 'z', 0.08);
    createNozzle([-6, 1.5, 0.7], 'z', 0.07);
    createNozzle([-6, 0, 0], 'y', 0.06);
    createNozzle([5.5, 2.1, 0], 'y', 0.08);
    createNozzle([4.25, 1.5, 0], 'x', 0.07);
    createNozzle([5.5, 0.9, 0], 'y', 0.06);

    createPipe([-6, 3.5, 0.7], [-6, 3.5, 2], 0.07);
    createElbow([-6, 3.5, 2], 0.09);
    createPipe([-6, 3.5, 2], [-3, 3.5, 2], 0.07);
    createGateValve([-4.5, 3.5, 2], 'x');
    createTee([-3, 3.5, 2], 0.09);
    createPipe([-3, 3.5, 2], [0, 3.5, 2], 0.07);
    createElbow([0, 3.5, 2], 0.09);
    createPipe([0, 3.5, 2], [0, 3.5, 0], 0.07);
    createElbow([0, 3.5, 0], 0.09);
    createPipe([0, 3.5, 0], [3, 3.5, 0], 0.07);
    createBallValve([1.5, 3.5, 0]);
    createElbow([3, 3.5, 0], 0.09);
    createPipe([3, 3.5, 0], [3, 2.5, 0], 0.07);
    createElbow([3, 2.5, 0], 0.09);
    createPipe([3, 2.5, 0], [4.25, 2.5, 0], 0.07);
    createElbow([4.25, 2.5, 0], 0.09);
    createPipe([4.25, 2.5, 0], [4.25, 1.5, 0], 0.07);

    createPipe([-3, 3.5, 2], [-3, 5, 2], 0.06, pipeMatAlt);
    createElbow([-3, 5, 2], 0.08);
    createPipe([-3, 5, 2], [2, 5, 2], 0.06, pipeMatAlt);
    createButterflyValve([0, 5, 2], 'x');
    createElbow([2, 5, 2], 0.08);
    createPipe([2, 5, 2], [2, 5, -1], 0.06, pipeMatAlt);
    createElbow([2, 5, -1], 0.08);
    createPipe([2, 5, -1], [6, 5, -1], 0.06, pipeMatAlt);

    createPipe([-6, 1.5, 0.7], [-6, 1.5, 2], 0.06);
    createElbow([-6, 1.5, 2], 0.08);
    createPipe([-6, 1.5, 2], [-3, 1.5, 2], 0.06);
    createCheckValve([-4, 1.5, 2], 'x');
    createTee([-3, 1.5, 2], 0.08);
    createPipe([-3, 1.5, 2], [0, 1.5, 2], 0.06);
    createGateValve([-1.5, 1.5, 2], 'x', valveRedMat);
    createElbow([0, 1.5, 2], 0.08);
    createPipe([0, 1.5, 2], [0, 1.5, 0], 0.06);
    createTee([0, 1.5, 0], 0.08);
    createPipe([0, 1.5, 0], [3, 1.5, 0], 0.06);
    createReducer([1.5, 1.5, 0], 'x', 0.06, 0.08);
    createPipe([3, 1.5, 0], [5.5, 1.5, 0], 0.08);

    createPipe([-3, 1.5, 2], [-3, 0, 2], 0.05, pipeMatSmall);
    createElbow([-3, 0, 2], 0.07);
    createPipe([-3, 0, 2], [-3, 0, 4], 0.05, pipeMatSmall);
    createBallValve([-3, 0, 3]);
    createElbow([-3, 0, 4], 0.07);
    createPipe([-3, 0, 4], [2, 0, 4], 0.05, pipeMatSmall);
    createElbow([2, 0, 4], 0.07);
    createPipe([2, 0, 4], [2, 0, 2], 0.05, pipeMatSmall);
    createElbow([2, 0, 2], 0.07);
    createPipe([2, 0, 2], [5, 0, 2], 0.05, pipeMatSmall);

    createPipe([0, 1.5, 0], [0, 0, 0], 0.05);
    createElbow([0, 0, 0], 0.07);
    createPipe([0, 0, 0], [5.5, 0, 0], 0.05);
    createButterflyValve([3, 0, 0], 'x');
    createElbow([5.5, 0, 0], 0.07);
    createPipe([5.5, 0, 0], [5.5, 0.9, 0], 0.05);

    createPipe([-6, 0, 0], [-6, -1.5, 0], 0.06, pipeMatAlt);
    createElbow([-6, -1.5, 0], 0.08);
    createPipe([-6, -1.5, 0], [-2, -1.5, 0], 0.06, pipeMatAlt);
    createGateValve([-4, -1.5, 0], 'x', valveGreenMat);
    createTee([-2, -1.5, 0], 0.08);
    createPipe([-2, -1.5, 0], [3, -1.5, 0], 0.06, pipeMatAlt);
    createElbow([3, -1.5, 0], 0.08);
    createPipe([3, -1.5, 0], [3, -1.5, 3], 0.06, pipeMatAlt);
    createElbow([3, -1.5, 3], 0.08);
    createPipe([3, -1.5, 3], [6, -1.5, 3], 0.06, pipeMatAlt);

    createPipe([-2, -1.5, 0], [-2, -1.5, -2], 0.05, pipeMatAlt);
    createCheckValve([-2, -1.5, -1], 'z');
    createElbow([-2, -1.5, -2], 0.07);
    createPipe([-2, -1.5, -2], [4, -1.5, -2], 0.05, pipeMatAlt);
    createElbow([4, -1.5, -2], 0.07);
    createPipe([4, -1.5, -2], [4, 2.1, -2], 0.05, pipeMatAlt);

    createPipe([5.5, 2.1, 0], [5.5, 3.5, 0], 0.07);
    createElbow([5.5, 3.5, 0], 0.09);
    createPipe([5.5, 3.5, 0], [5.5, 3.5, 3], 0.07);
    createGateValve([5.5, 3.5, 1.5], 'z');
    createElbow([5.5, 3.5, 3], 0.09);
    createPipe([5.5, 3.5, 3], [2, 3.5, 3], 0.07);
    createElbow([2, 3.5, 3], 0.09);
    createPipe([2, 3.5, 3], [2, 3.5, 5], 0.07);

    createPipe([-5.3, 3.2, 0], [-5.3, 3.2, -1.5], 0.03, pipeMatSmall);
    createElbow([-5.3, 3.2, -1.5], 0.045);
    createPipe([-5.3, 3.2, -1.5], [-5.3, 5.5, -1.5], 0.03, pipeMatSmall);

    createPipe([-5.3, 2, 0], [-5.3, 2, -1], 0.03, pipeMatSmall);
    createElbow([-5.3, 2, -1], 0.045);
    createPipe([-5.3, 2, -1], [-3, 2, -1], 0.03, pipeMatSmall);
    createBallValve([-4, 2, -1]);

    createPipe([6.2, 2.1, 0.5], [6.2, 4, 0.5], 0.03, pipeMatSmall);
    createElbow([6.2, 4, 0.5], 0.045);
    createPipe([6.2, 4, 0.5], [7, 4, 0.5], 0.03, pipeMatSmall);

    createVerticalTank(0, -2, 2.5, 0.5);
    createNozzle([0, 2.5, -1.5], 'z', 0.06);
    createNozzle([0.5, 1.2, -2], 'x', 0.05);
    createNozzle([0, 0, -2], 'y', 0.05);

    createPipe([0, 2.5, -1.5], [0, 2.5, -3], 0.05);
    createElbow([0, 2.5, -3], 0.07);
    createPipe([0, 2.5, -3], [4, 2.5, -3], 0.05);
    createGateValve([2, 2.5, -3], 'x');
    createElbow([4, 2.5, -3], 0.07);
    createPipe([4, 2.5, -3], [4, 2.5, -1], 0.05);
    createElbow([4, 2.5, -1], 0.07);
    createPipe([4, 2.5, -1], [7, 2.5, -1], 0.05);

    createPipe([0.5, 1.2, -2], [2, 1.2, -2], 0.05, pipeMatAlt);
    createTee([2, 1.2, -2], 0.07);
    createPipe([2, 1.2, -2], [5, 1.2, -2], 0.05, pipeMatAlt);
    createButterflyValve([3.5, 1.2, -2], 'x');
    createElbow([5, 1.2, -2], 0.07);
    createPipe([5, 1.2, -2], [5, 1.2, 0], 0.05, pipeMatAlt);

    createPipe([2, 1.2, -2], [2, -0.5, -2], 0.04, pipeMatSmall);
    createElbow([2, -0.5, -2], 0.06);
    createPipe([2, -0.5, -2], [2, -0.5, -4], 0.04, pipeMatSmall);
    createCheckValve([2, -0.5, -3], 'z');
    createElbow([2, -0.5, -4], 0.06);
    createPipe([2, -0.5, -4], [6, -0.5, -4], 0.04, pipeMatSmall);

    createPipe([0, 0, -2], [0, -2, -2], 0.05);
    createElbow([0, -2, -2], 0.07);
    createPipe([0, -2, -2], [-4, -2, -2], 0.05);
    createBallValve([-2, -2, -2]);
    createElbow([-4, -2, -2], 0.07);
    createPipe([-4, -2, -2], [-4, -2, 3], 0.05);
    createGateValve([-4, -2, 0], 'z', valveRedMat);
    createTee([-4, -2, 3], 0.07);
    createPipe([-4, -2, 3], [0, -2, 3], 0.05);
    createElbow([0, -2, 3], 0.07);
    createPipe([0, -2, 3], [0, 0, 3], 0.05);

    createPipe([-4, -2, 3], [-4, -2, 6], 0.04, pipeMatSmall);
    createButterflyValve([-4, -2, 4.5], 'z');

    createPipe([-5, 4.5, 0], [-5, 4.5, -2], 0.05, pipeMatAlt);
    createElbow([-5, 4.5, -2], 0.07);
    createPipe([-5, 4.5, -2], [-2, 4.5, -2], 0.05, pipeMatAlt);
    createTee([-2, 4.5, -2], 0.07);
    createPipe([-2, 4.5, -2], [1, 4.5, -2], 0.05, pipeMatAlt);
    createGateValve([0, 4.5, -2], 'x', valveGreenMat);
    createElbow([1, 4.5, -2], 0.07);
    createPipe([1, 4.5, -2], [1, 4.5, 0], 0.05, pipeMatAlt);
    createElbow([1, 4.5, 0], 0.07);
    createPipe([1, 4.5, 0], [4, 4.5, 0], 0.05, pipeMatAlt);
    createElbow([4, 4.5, 0], 0.07);
    createPipe([4, 4.5, 0], [4, 3.5, 0], 0.05, pipeMatAlt);

    createPipe([-2, 4.5, -2], [-2, 3, -2], 0.04, pipeMatSmall);
    createCheckValve([-2, 3.8, -2], 'y');
    createElbow([-2, 3, -2], 0.06);
    createPipe([-2, 3, -2], [0, 3, -2], 0.04, pipeMatSmall);
    createElbow([0, 3, -2], 0.06);
    createPipe([0, 3, -2], [0, 2.5, -2], 0.04, pipeMatSmall);

    createPipe([-6, -0.5, 3], [-3, -0.5, 3], 0.06);
    createTee([-3, -0.5, 3], 0.08);
    createPipe([-3, -0.5, 3], [0, -0.5, 3], 0.06);
    createReducer([0, -0.5, 3], 'x', 0.06, 0.04);
    createPipe([0, -0.5, 3], [4, -0.5, 3], 0.04);
    createBallValve([2, -0.5, 3]);
    createElbow([4, -0.5, 3], 0.06);
    createPipe([4, -0.5, 3], [4, -0.5, 5], 0.04);

    createPipe([-3, -0.5, 3], [-3, 1, 3], 0.05, pipeMatSmall);
    createElbow([-3, 1, 3], 0.07);
    createPipe([-3, 1, 3], [-3, 1, 5], 0.05, pipeMatSmall);
    createGateValve([-3, 1, 4], 'z');

    createPipe([-5, 0.5, -3], [-2, 0.5, -3], 0.05, pipeMatAlt);
    createTee([-2, 0.5, -3], 0.07);
    createPipe([-2, 0.5, -3], [2, 0.5, -3], 0.05, pipeMatAlt);
    createButterflyValve([0, 0.5, -3], 'x');
    createElbow([2, 0.5, -3], 0.07);
    createPipe([2, 0.5, -3], [2, 0.5, -5], 0.05, pipeMatAlt);

    createPipe([-2, 0.5, -3], [-2, 2, -3], 0.04, pipeMatSmall);
    createElbow([-2, 2, -3], 0.06);
    createPipe([-2, 2, -3], [-4, 2, -3], 0.04, pipeMatSmall);
    createCheckValve([-3, 2, -3], 'x');
    createElbow([-4, 2, -3], 0.06);
    createPipe([-4, 2, -3], [-4, 4, -3], 0.04, pipeMatSmall);

    createPipe([-1, 3.5, 2], [-1, 3.5, 3.5], 0.03, pipeMatSmall);
    createElbow([-1, 3.5, 3.5], 0.04);
    createPipe([-1, 3.5, 3.5], [-1, 5, 3.5], 0.03, pipeMatSmall);

    createPipe([3, 1.5, 0], [3, 1.5, -1.5], 0.03, pipeMatSmall);
    createElbow([3, 1.5, -1.5], 0.04);
    createPipe([3, 1.5, -1.5], [3, 3, -1.5], 0.03, pipeMatSmall);
    createBallValve([3, 2.3, -1.5]);

    createPipe([5.5, 3.5, 1.5], [7, 3.5, 1.5], 0.03, pipeMatSmall);
    createElbow([7, 3.5, 1.5], 0.04);
    createPipe([7, 3.5, 1.5], [7, 5, 1.5], 0.03, pipeMatSmall);

    createPipe([-6, 2.5, 0.7], [-7.5, 2.5, 0.7], 0.03, pipeMatSmall);
    createElbow([-7.5, 2.5, 0.7], 0.04);
    createPipe([-7.5, 2.5, 0.7], [-7.5, 2.5, 3], 0.03, pipeMatSmall);
    createElbow([-7.5, 2.5, 3], 0.04);
    createPipe([-7.5, 2.5, 3], [-7.5, 5, 3], 0.03, pipeMatSmall);

    const gridHelper = new THREE.GridHelper(20, 40, 0x1e3a5f, 0x0f1d32);
    gridHelper.position.y = -2.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.25;
    scene.add(gridHelper);

    allParts.forEach(part => {
        part.material.opacity = 0;
        part.scale.set(0.01, 0.01, 0.01);
    });

    const timeline = gsap.timeline({ delay: 0.8 });

    allParts.forEach((part, index) => {
        const offset = index * 0.01;
        timeline.to(part.material, { opacity: 0.9, duration: 0.06, ease: 'power2.out' }, offset);
        timeline.to(part.scale, { x: 1, y: 1, z: 1, duration: 0.15, ease: 'back.out(1.5)' }, offset);
    });

    function animate() {
        requestAnimationFrame(animate);
        scene.rotation.y += 0.0015;
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
})();
