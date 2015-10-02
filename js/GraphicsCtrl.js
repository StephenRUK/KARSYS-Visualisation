function GraphicsController() {
	var scene, camera, renderer, controls, objects = [];
    
    var mouseWorldCoords = { x:0, y:0, z:0 };
	
    //
    // Setup
    //
    function createStatusBar () {
        statusBar = document.createElement( 'div' );
        statusBar.style.position = 'absolute';
        statusBar.style.left = '20px';
        statusBar.style.top = '10px';
        statusBar.style.width = '200px';
        statusBar.style.textAlign = 'center';
        statusBar.style.backgroundColor = 'lightgray';
        statusBar.style.opacity = 0.6;
        statusBar.innerHTML = 'x: 0, y: 0, z: 0';
        
        return statusBar;
    }
    
    //
    // Event handlers
    //
    
    function updateMouseCoordinates (event) {
        
    
    }
    
    /******************************************************
    * Public
    ******************************************************/
    
	this.init = function (container) {
		scene = new THREE.Scene(); 
		renderer = new THREE.WebGLRenderer();
		container.appendChild(renderer.domElement);
		renderer.setSize(container.clientWidth, container.clientHeight);
		
		// Camera
		camera = new THREE.PerspectiveCamera(75, renderer.domElement.width/renderer.domElement.height, 0.1, 1000);
		camera.position.y = 40;
		camera.position.z = 100;
		
		// Orbit Controls
		controls = new THREE.OrbitControls( camera, renderer.domElement);
		controls.damping = 0.2;
		controls.addEventListener( 'change', render );
		
		// Lighting
		scene.add(new THREE.AmbientLight(0x404040));
		
		/*
		var light = new THREE.PointLight(0x606060);
		light.position.set(-100,200,100);
		scene.add(light);
		*/
		
		// Listeners
		window.addEventListener( 'resize', onWindowResize, true);
		renderer.domElement.addEventListener('click', onClick, false);
		renderer.domElement.addEventListener('mousemove', showWorldCoordinates);
		document.getElementById('modelList').addEventListener('change', changeModel, false);
        
        container.appendChild(createStatusBar());

	};
    
    //
    // Public utility functions
    //
    
    this.moveCamera = function (x, y, z) {
        camera.position.x = x;
        camera.position.y = y;
		camera.position.z = z;
    };
    
    this.enableMovement = function (enabled) {
        controls.enabled = enabled;
    };
    
    this.enableCoordinatesDisplay = function (enabled) {
        
    };
    
    //
    // Read-only data functions
    //
    
    this.getMouseWorldCoordinates = function () {
        
    }
    
	
	//
	// Model Loaders
	//
	
	this.loadObjMtl = function(objPath, mtlPath) {
		
	};
	
	this.loadDae = function(daePath) {
		
	};
	
	
}