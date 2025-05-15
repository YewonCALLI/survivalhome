import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { degToRad } from 'three/src/math/MathUtils';



const container = document.body;
const FOV = 45;
const NEAR = 1;
const FAR = 20;
let height = window.innerHeight;
let width = window.innerWidth;
const ASPECT = width / height;
// const resolution = new THREE.Vector2(width, height);
// const SHADOW_MAP_SIZE = 1024;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);


const canvas = renderer.domElement;

const scene = new THREE.Scene();
const scene1 = new THREE.Scene();

const clock = new THREE.Clock();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-4, 2, 4);
camera.target = new THREE.Vector3(0, 0, 0);
camera.layers.enable(1);

const controls = new OrbitControls(camera, canvas)

const matNormal = new THREE.MeshNormalMaterial();
const matShadow = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 0.0,
});

let room,bed,desk,hamburger,crayon;
let fan;

let audioInitialized = false;
let audioPlaying = false;
let rain_audioPlaying = false;

/**
 * Object
 */
 //const material_objects = new MeshBasicMaterial();
 const gltfLoader = new GLTFLoader()
 gltfLoader.load(
     'room.gltf',
     (gltf) =>
     {  
        gltf.scene.rotation.set(0,135, 0)
        scene.add(gltf.scene);
     }
 )

 gltfLoader.load(
    'bed.gltf',
    (gltf) =>
    {   
        let bed = gltf.scene.children[0];
        gltf.scene.position.set(0.1, -1.8, 0.2)
        //bed.layers.set(1);
        scene.add(gltf.scene);
    }
)

gltfLoader.load(
    'desk.gltf',
    (gltf) =>
    {   
        let desk = gltf.scene.children[0];
        gltf.scene.position.set(0.5, -1.7, 1.0)
        //desk.layers.set(1);
        scene.add(gltf.scene);
    }
)
gltfLoader.load(
    'hamburger.gltf',
    (gltf) =>
    {   
        
        let hamburger = gltf.scene.children[0];
        gltf.scene.position.set(-1.0, -1.2, 0.5)
        gltf.scene.scale.set(0.5, 0.5, 0.5)
        //hamburger.layers.set(1);
        scene.add(gltf.scene);
    }
)

gltfLoader.load(
    'fan.gltf',
    (gltf) =>
    {
        fan = gltf.scene;
        gltf.scene.position.set(0, 1.0, 0)

        gltf.scene.scale.set(0.3, 0.3, 0.3)
        //crayon.layers.set(0);
        scene.add(gltf.scene);
    }
)
let duck;

gltfLoader.load(
    'duck.gltf',
    (gltf) =>
    {
        duck = gltf.scene.children[4];
        gltf.scene.position.set(1.0, -1.2, 0)
        gltf.scene.scale.set(1.0, 1.0, 1.0)
        gltf.scene.rotateY(degToRad(270))
        scene.add(gltf.scene);
    }
)

let pipe;
gltfLoader.load(
    'pipes.gltf',
    (gltf) =>
    {
        pipe = gltf.scene.children[4];
        gltf.scene.position.set(0.0, 0.0,- 1.7)
        gltf.scene.scale.set(0.08, 0.08, 0.08)
        gltf.scene.rotateX(degToRad(90))
        scene.add(gltf.scene);
    }
)

gltfLoader.load(
    'pipes.gltf',
    (gltf) =>
    {
        pipe = gltf.scene.children[4];
        gltf.scene.position.set(1.0, -1.2, 0)
        gltf.scene.scale.set(1.3, 1.3, 1.3)
        gltf.scene.rotateY(degToRad(270))
        scene.add(gltf.scene);
    }
)


const floorGeo = new THREE.PlaneBufferGeometry(1.2, 1.0);
const floor = new THREE.Mesh(floorGeo, matNormal);
floor.position.set(1.56 -0.0, 0);
floor.rotation.y = -((Math.PI * 90) / 180);
let height_water=0.1;

const sphereGeo = new THREE.SphereBufferGeometry(0.5, 32, 32);

const matNormal1 = new THREE.MeshBasicMaterial( { color: 0xD61C4E } );
//const cube2 = new THREE.Mesh(geometry1, matNormal1); 

//cube2.position.y=-1.5;
const material_sun = new THREE.MeshBasicMaterial( { color: 0xD61C4E } );
const sphere = new THREE.Mesh(sphereGeo, material_sun);
sphere.position.y=2.5;

scene.add(floor);
//scene1.add(cube2);

//scene.add(sphere);
scene.add(camera);
scene1.add(camera);




/**Rain texture */
var rainCount=1000;
var cloudParticles=[];
var rainDrop;
const vertices = [];
var rainGeo = new THREE.BufferGeometry();
let rain;
const velocity = [];

for(let i=0; i<rainCount; i++) {
  rainDrop = new THREE.Vector3(
    Math.random()*4-1,
    Math.random()*4,
    Math.random()*4-3
  )
  vertices.push(rainDrop.x,rainDrop.y,rainDrop.z);
  velocity.push(0);
}
const positionAttribute = new THREE.Float32BufferAttribute(vertices, 3)

const geometry = new THREE.SphereBufferGeometry(0.4, 10, 10);
positionAttribute.setUsage(THREE.DynamicDrawUsage);
geometry.setAttribute('position', positionAttribute);

const material = new THREE.PointsMaterial({
    color: 0x06283D,
    size: 0.07,
    transparent: true
  });
  rain = new THREE.Points(geometry, material);
  scene1.add(rain);


const geometry1 = new THREE.BoxGeometry(3.4,0.01,3.4);
const cube1 = new THREE.Mesh(geometry1, matNormal); //Water box
cube1.position.y = -1.7;
scene.add(cube1);


// ...
renderer.shadowMap.enabled = true;
renderer.shadowMap.renderReverseSided = false;

// ...
floor.receiveShadow = true;

// ...
sphere.castShadow = true;
sphere.receiveShadow = true;

const SHADOW_MAP_SIZE = 1024;

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
directionalLight.position.set( -1, 1.75, 1 );
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
directionalLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
directionalLight.shadow.camera.far = 5000;
directionalLight.shadow.bias = -0.0001;



const PARAMETERS = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: false
};

const shadowBuffer = new THREE.WebGLRenderTarget(1, 1, PARAMETERS);




const directionalLight1 = new THREE.DirectionalLight( 0xffffff, 2.0 );
scene.add(directionalLight);
scene1.add(directionalLight1);






const resolution = new THREE.Vector2(width, height);



const VERTEX = `
    varying vec2 vUv;
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
    }
`;

const FRAGMENT = `
    uniform sampler2D tDiffuse;
    uniform sampler2D tShadow;
    uniform vec2 iResolution;
    varying vec2 vUv;
    #define Sensitivity (vec2(0.3, 1.5) * iResolution.y / 400.0)
    float checkSame(vec4 center, vec4 samplef)
    {
        vec2 centerNormal = center.xy;
        float centerDepth = center.z;
        vec2 sampleNormal = samplef.xy;
        float sampleDepth = samplef.z;
        vec2 diffNormal = abs(centerNormal - sampleNormal) * Sensitivity.x;
        bool isSameNormal = (diffNormal.x + diffNormal.y) < 0.1;
        float diffDepth = abs(centerDepth - sampleDepth) * Sensitivity.y;
        bool isSameDepth = diffDepth < 0.1;
        return (isSameNormal && isSameDepth) ? 1.0 : 0.0;
    }
    void main( )
    {
        vec4 sample0 = texture2D(tDiffuse, vUv);
        vec4 sample1 = texture2D(tDiffuse, vUv + (vec2(1.0, 1.0) / iResolution.xy));
        vec4 sample2 = texture2D(tDiffuse, vUv + (vec2(-1.0, -1.0) / iResolution.xy));
        vec4 sample3 = texture2D(tDiffuse, vUv + (vec2(-1.0, 1.0) / iResolution.xy));
        vec4 sample4 = texture2D(tDiffuse, vUv + (vec2(1.0, -1.0) / iResolution.xy));
        float edge = checkSame(sample1, sample2) * checkSame(sample3, sample4);
        // gl_FragColor = vec4(edge, sample0.w, 1.0, 1.0);
        float shadow = texture2D(tShadow, vUv).x;
        gl_FragColor = vec4(edge, shadow, 1.0, 1.0);
    }
`;




const drawShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        tShadow: { type: 't', value: null },
        iResolution: { type: 'v2', value: resolution },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
};



    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    //composer.addPass(new RenderPass(scene1, camera));
    const pass = new ShaderPass(drawShader);
    // pass.renderToScreen = true;
    composer.addPass(pass);

 const FRAGMENT_FINAL = `
        uniform sampler2D tDiffuse;
        uniform sampler2D tNoise;
        uniform float iTime;
        varying vec2 vUv;
        #define EdgeColor vec4(0.2, 0.2, 0.15, 1.0)
        #define BackgroundColor vec4(1,0.95,0.85,1)
        #define NoiseAmount 0.01
        #define ErrorPeriod 30.0
        #define ErrorRange 0.003
        // Reference: https://www.shadertoy.com/view/MsSGD1
        float triangle(float x)
        {
            return abs(1.0 - mod(abs(x), 2.0)) * 2.0 - 1.0;
        }
        float rand(float x)
        {
            return fract(sin(x) * 43758.5453);
        }
        void main()
        {
            float time = floor(iTime * 16.0) / 16.0;
            vec2 uv = vUv;
            uv += vec2(triangle(uv.y * rand(time) * 1.0) * rand(time * 1.9) * 0.005,
                    triangle(uv.x * rand(time * 3.4) * 1.0) * rand(time * 2.1) * 0.005);
            float noise = (texture2D(tNoise, uv * 0.5).r - 0.5) * NoiseAmount;
            vec2 uvs[3];
            uvs[0] = uv + vec2(ErrorRange * sin(ErrorPeriod * uv.y + 0.0) + noise, ErrorRange * sin(ErrorPeriod * uv.x + 0.0) + noise);
            uvs[1] = uv + vec2(ErrorRange * sin(ErrorPeriod * uv.y + 1.047) + noise, ErrorRange * sin(ErrorPeriod * uv.x + 3.142) + noise);
            uvs[2] = uv + vec2(ErrorRange * sin(ErrorPeriod * uv.y + 2.094) + noise, ErrorRange * sin(ErrorPeriod * uv.x + 1.571) + noise);
            float edge = texture2D(tDiffuse, uvs[0]).r * texture2D(tDiffuse, uvs[1]).r * texture2D(tDiffuse, uvs[2]).r;
            float diffuse = texture2D(tDiffuse, uv).g;
            float w = fwidth(diffuse) * 2.0;
            vec4 mCol = mix(BackgroundColor * 0.5, BackgroundColor, mix(0.0, 1.0, smoothstep(-w, w, diffuse - 0.3)));
            gl_FragColor = mix(EdgeColor, mCol, edge);
        }
        `;


let initial_height = -1.7;

const finalShader = {
    uniforms: {
        tDiffuse: { type: 't', value: null},
        iTime: { type: 'f', value: 0.0},
        tNoise: { type: 't', value: new THREE.TextureLoader().load('noise.png')}
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT_FINAL
};

const passFinal = new ShaderPass(finalShader);
passFinal.renderToScreen = true;
passFinal.material.extensions.derivatives = true;
composer.addPass(passFinal);


const resize = (width, height) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    composer.setSize(width, height);
    shadowBuffer.setSize(width, height);

    pass.uniforms.iResolution.value.set(width, height);

    renderer.setSize(width, height);
};

let num = 0;
var audio = new Audio('dryersound.mp3');
var audio1 = new Audio('rain-03.mp3');

let diff = 0.0005;
const render = () => {
    const tmpHeight = window.innerHeight;
    const tmpWidth = window.innerWidth;
    if (tmpHeight !== height || tmpWidth !== width) {
        height = tmpHeight;
        width = tmpWidth;
        resize(width, height);
    }
    
    controls.update();

    renderer.clear();
    floor.material = matShadow;
    renderer.render(scene, camera, shadowBuffer);
    pass.uniforms.tShadow.value = shadowBuffer.texture;

    const ellapsed = clock.getElapsedTime();
    passFinal.uniforms.iTime.value = ellapsed;
    
    composer.render();
    renderer.autoClear = false;
    
    renderer.clearDepth();
    camera.layers.set(0);
    
    let rule2 = false;
    let diff2 = 0.0005;
  
    requestAnimationFrame(render);
    
    // RainDrop Animation
    const positionAttribute = rain.geometry.getAttribute('position');

    for (let i = 0; i < positionAttribute.count; i++) {
        velocity[i] -= 0.1 + Math.random() * 0.01;
        let y = positionAttribute.getY(i);
        y += 0.008*velocity[i];
        
        if (y < -2) {
            y = 10;
            velocity[i] = 0;
        }
        positionAttribute.setY(i, y);
    }
    
    positionAttribute.needsUpdate = true;
    
    // Only play audio if user has interacted and conditions are met
    if (audioInitialized && cube1.position.y < -0.6 && rule2 == false) {
        cube1.scale.y += 0.1;
        if (!rain_audioPlaying) {
            audio1.play().catch(e => console.warn("Rain audio play failed:", e));
            rain_audioPlaying = true;
        }
    }
    
    scene.add(cube1);
    
    if(fan) {
        fan.rotation.y += 0.02;
    }
  
    if(selectedname == 'Cube') {
        num += 1;
        selectedname = 'num';
    }
    
    if(num == 1) {
        console.log("Yes");
        document.getElementById("imgId").src = "hairdryer1.png";  
    } else if(num == 2) {
        console.log("Yes");
        document.getElementById("imgId").src = "hairdryer3.png";  
    } else if(num >= 3) {
        // Only play audio if user has interacted
        if (audioInitialized && !audioPlaying) {
            audio.play().catch(e => console.warn("Dryer audio play failed:", e));
            audioPlaying = true;
        }
        rule2 = true;
        if(cube1.scale.y > -1.7) {
            cube1.scale.y -= 0.4;
            if(cube1.scale.y < 0) {
                cube1.scale.y = 0;
            }
        }
    }
    
    console.log(num, rule2);
    renderer.render(scene1, camera);
    renderer.autoClear = true;
};



/**
 * Interactions
 */
//마우스 설정
let rule = false;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
let selectedPiece = null;
var selectedPiece_x, selectedPiece_y, selectedPiece_z;
var selectedPiece_scale_x, selectedPiece_scale_y, selectedPiece_scale_z;
var selectedname;
var difference1, difference2;

function onMouseMove( event ) {

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

//클릭
function onClick( event ) {

    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children );

    //zoomin(selectedPiece,30);
    if ( intersects.length > 0 ) {

        selectedPiece = intersects[ 0 ].object.userData.currentSquare;
        console.log( intersects[ 0 ].object );
        rule = true;
        selectedPiece_x = intersects[ 0 ].object.position.x;
        selectedPiece_y = intersects[ 0 ].object.position.y;
        selectedPiece_z = intersects[ 0 ].object.position.z;

        selectedPiece_scale_x = intersects[ 0 ].object.scale.x;
        selectedPiece_scale_y = intersects[ 0 ].object.scale.y;
        selectedPiece_scale_z = intersects[ 0 ].object.scale.z;

        selectedname = intersects[ 0 ].object.name;

        difference1 = selectedPiece_y - camera.position.y;
        difference2 = selectedPiece_z - camera.position.x;

    }

    selectedPiece = intersects[ 0 ].object;
    //scene.add(new THREE.BoxHelper(selectedPiece));

    console.log( selectedname );

}


var intersects;
function resetMaterials() {

    intersects = raycaster.intersectObjects( scene.children );

    for ( let i = 0; i < intersects.length; i ++ ) {

        if ( intersects[ i ].object.material ) {

            intersects[ i ].object.material.color.set( 0xffffff );

        }


    }

}

function hoverPieces() {

    raycaster.setFromCamera( mouse, camera );
    intersects = raycaster.intersectObjects( scene.children );
    for ( let i = 0; i < intersects.length; i ++ ) {

        //intersects[ i ].object.material.transparent = true;
        intersects[ i ].object.material.color.set( 0xff0000 );

    }

}


window.addEventListener('click', (event) => {
    onClick(event);
    
    // Initialize audio on first user interaction
    if (!audioInitialized) {
        // Create promise-based initialization
        const initAudio = async () => {
            try {
                // Try to play and immediately pause both audio files
                await audio.play();
                audio.pause();
                audio.currentTime = 0;
                
                await audio1.play();
                audio1.pause();
                audio1.currentTime = 0;
                
                audioInitialized = true;
                console.log("Audio initialized successfully");
            } catch (e) {
                console.warn("Audio initialization failed:", e);
            }
        };
        
        initAudio();
    }
});
container.appendChild(canvas);
resize(width, height);
render();