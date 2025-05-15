

/**
 * Creates an HTML viewer for a 3D model with three.js
 * @param modelFileName The name of the model file
 * @returns HTML content for the viewer
 */
export function createViewerHTML(modelFileName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Model Viewer</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #1a1a1a;
        }
        #info {
            position: absolute;
            top: 10px;
            width: 100%;
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 100;
            pointer-events: none;
        }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 16px;
        }
        #controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 100;
        }
        button {
            padding: 8px 16px;
            background: #444;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: Arial, sans-serif;
        }
        button:hover {
            background: #555;
        }
    </style>
</head>
<body>
    <div id="info">Use mouse to rotate, scroll to zoom</div>
    <div id="loading">Loading model...</div>
    <div id="controls">
        <button id="reset">Reset View</button>
        <button id="wireframe">Toggle Wireframe</button>
        <button id="autoRotate">Toggle Auto Rotate</button>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/DRACOLoader.min.js"></script>
    
    <script>
        // Main variables
        let scene, camera, renderer, controls, model, mixer, clock;
        let wireframeMode = false;
        let autoRotate = false;
        let originalMaterials = [];
        
        // Setup scene
        function init() {
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x222222);
            
            // Create camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.outputEncoding = THREE.sRGBEncoding;
            document.body.appendChild(renderer.domElement);
            
            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 1, 1);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);
            
            // Add controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            
            // Clock for animation
            clock = new THREE.Clock();
            
            // Load model
            loadModel();
            
            // Handle resize event
            window.addEventListener('resize', onWindowResize, false);
            
            // Control buttons
            document.getElementById('reset').addEventListener('click', resetCamera);
            document.getElementById('wireframe').addEventListener('click', toggleWireframe);
            document.getElementById('autoRotate').addEventListener('click', toggleAutoRotate);
            
            // Start animation loop
            animate();
        }
        
        // Load GLB model
        function loadModel() {
            const loadingManager = new THREE.LoadingManager();
            loadingManager.onProgress = (url, loaded, total) => {
                console.log(\`Loading: \${Math.round(loaded / total * 100)}%\`);
            };
            
            loadingManager.onLoad = () => {
                document.getElementById('loading').style.display = 'none';
            };
            
            const loader = new THREE.GLTFLoader(loadingManager);
            const dracoLoader = new THREE.DRACOLoader();
            dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
            loader.setDRACOLoader(dracoLoader);
            
            // Path to the GLB file - Ensure this path is correct
            const modelPath = '${modelFileName}';
            
            loader.load(
                modelPath,
                (gltf) => {
                    model = gltf.scene;
                    
                    // Store original materials
                    model.traverse((child) => {
                        if (child.isMesh) {
                            originalMaterials.push({
                                mesh: child,
                                material: child.material.clone()
                            });
                            
                            // Enable shadows
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    // Auto-center and auto-scale model
                    centerModel(model);
                    
                    // Add model to scene
                    scene.add(model);
                    
                    // Setup animation if available
                    if (gltf.animations && gltf.animations.length) {
                        mixer = new THREE.AnimationMixer(model);
                        const animation = gltf.animations[0];
                        const action = mixer.clipAction(animation);
                        action.play();
                    }
                },
                (xhr) => {
                    const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                    console.log(\`\${percent}% loaded\`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    document.getElementById('loading').textContent = 'Error loading model. Please check the path.';
                }
            );
        }
        
        // Center model
        function centerModel(model) {
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            
            model.position.x = -center.x;
            model.position.y = -center.y;
            model.position.z = -center.z;
            
            model.scale.set(scale, scale, scale);
        }
        
        // Reset camera to initial position
        function resetCamera() {
            camera.position.set(0, 0, 5);
            controls.reset();
        }
        
        // Toggle wireframe mode
        function toggleWireframe() {
            wireframeMode = !wireframeMode;
            
            model.traverse((child) => {
                if (child.isMesh) {
                    if (wireframeMode) {
                        child.material = new THREE.MeshBasicMaterial({
                            wireframe: true,
                            color: 0x00ff00
                        });
                    } else {
                        // Restore original material
                        const original = originalMaterials.find(m => m.mesh === child);
                        if (original) {
                            child.material = original.material.clone();
                        }
                    }
                }
            });
        }
        
        // Toggle auto rotate
        function toggleAutoRotate() {
            autoRotate = !autoRotate;
            controls.autoRotate = autoRotate;
            document.getElementById('autoRotate').textContent = autoRotate ? 'Stop Rotating' : 'Auto Rotate';
        }
        
        // Handle window resize
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        // Render loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Update controls
            controls.update();
            
            // Update animation if available
            if (mixer) {
                mixer.update(clock.getDelta());
            }
            
            // Render scene
            renderer.render(scene, camera);
        }
        
        // Initialize
        init();
    </script>
</body>
</html>`;
}
