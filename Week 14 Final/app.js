// Luis Morales
// My bootleg Solar System for my final

'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var earthGeometry = null; // this will be created after loading from a file
var sunGeometry = null;
var mercuryGeometry = null;
var venusGeometry = null;
var marsGeometry = null;
var pointLightGeometry = null;
var jupiterGeometry = null;
var saturnGeometry = null;
var uranusGeometry = null;
var neptuneGeometry = null;
var moonGeometry = null;
var bottomWall = null;
var topWall = null;
var leftWall = null;
var rightWall = null;
var backWall = null;
var frontWall = null;

var projectionMatrix = new Matrix4();
var sunPosition = new Vector3();
var earthPosition = new Vector3();
var mercuryPosition = new Vector3();
var venusPosition = new Vector3();
var marsPosition = new Vector3();
var jupiterPosition = new Vector3();
var saturnPosition = new Vector3();
var neptunePosition = new Vector3();
var uranusPosition = new Vector3();
var moonPosition = new Vector3();
var lightPosition = new Vector3();


// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var basicColorProgram;
var sunColorProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    vertexColorVS: null, vertexColorFS: null,
    sunTextVS:null, sunTextFS: null,
    sphereJSON: null,
    sunImage: null, earthImage: null,
    crackedMudImage: null,
    mercuryImage: null,
    venusImage: null,
    marsImage: null,
    jupiterImage: null,
    saturnImage: null,
    neptuneImage: null,
    uranusImage: null,
    moonImage: null,
    GalaxyTex_NegativeX: null,
    GalaxyTex_NegativeY: null,
    GalaxyTex_NegativeZ: null,
    GalaxyTex_PositiveX: null,
    GalaxyTex_PositiveY: null,
    GalaxyTex_PositiveZ: null,
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/sun.jpg'),
        loadImage('./data/earth.jpg'),
        loadImage('./data/mars.jpg'),
        loadImage('./data/mercury.jpg'),
        loadImage('./data/GalaxyTex_NegativeX.png'),
        loadImage('./data/GalaxyTex_NegativeY.png'),
        loadImage('./data/GalaxyTex_Negativez.png'),
        loadImage('./data/GalaxyTex_PositiveX.png'),
        loadImage('./data/GalaxyTex_PositiveY.png'),
        loadImage('./data/GalaxyTex_PositiveZ.png'),
        loadImage('./data/venusAt.jpg'),
        loadImage('./data/jupiter.jpg'),
        loadImage('./data/saturn.jpg'),
        loadImage('./data/uranus.jpg'),
        loadImage('./data/neptune.jpg'),
        loadImage('./data/moon.png'),
        fetch('./shaders/sun.texture.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/sun.texture.fs.glsl').then((response) => { return response.text(); })
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.vertexColorVS = values[2];
        loadedAssets.vertexColorFS = values[3];
        loadedAssets.sphereJSON = values[4];
        loadedAssets.sunImage = values[5];
        loadedAssets.earthImage = values[6]
        loadedAssets.marsImage = values[7];
        loadedAssets.mercuryImage = values[8];
        loadedAssets.GalaxyTex_NegativeX = values[9];
        loadedAssets.GalaxyTex_NegativeY = values[10];
        loadedAssets.GalaxyTex_NegativeZ = values[11];
        loadedAssets.GalaxyTex_PositiveX = values[12];
        loadedAssets.GalaxyTex_PositiveY = values[13];
        loadedAssets.GalaxyTex_PositiveZ = values[14];
        loadedAssets.venusImage = values[15];
        loadedAssets.jupiterImage = values[16];
        loadedAssets.saturnImage = values[17];
        loadedAssets.uranusImage = values[18];
        loadedAssets.neptuneImage = values[19];
        loadedAssets.moonImage = values[20];
        loadedAssets.sunTextVS = values[21];
        loadedAssets.sunTextFS = values[22];
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };

    basicColorProgram = createCompiledAndLinkedShaderProgram(loadedAssets.vertexColorVS, loadedAssets.vertexColorFS);
    gl.useProgram(basicColorProgram);

    basicColorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(basicColorProgram, "aVertexPosition"),
        vertexColorsAttribute: gl.getAttribLocation(basicColorProgram, "aVertexColor"),
    };

    basicColorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(basicColorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(basicColorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(basicColorProgram, "uProjectionMatrix"),
        colorUniform: gl.getUniformLocation(basicColorProgram, "uColor")
    };

    sunColorProgram = createCompiledAndLinkedShaderProgram(loadedAssets.sunTextVS, loadedAssets.sunTextFS);
    gl.useProgram(basicColorProgram);

    sunColorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(sunColorProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(sunColorProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(sunColorProgram, "aTexcoords")
    };

    sunColorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(sunColorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(sunColorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(sunColorProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(sunColorProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(sunColorProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(sunColorProgram, "uTexture")
    };
}

// -------------------------------------------------------------------------
function createScene() {

    bottomWall = new WebGLGeometryQuad(gl, phongShaderProgram);
    bottomWall.create(loadedAssets.GalaxyTex_NegativeY);

    var scale = new Matrix4().makeScale(30.0, 30.0, 30.0);
    var rotation = new Matrix4().makeRotationX(-90);
    var translation = new Matrix4().makeTranslation(0, -30, 0);

    bottomWall.worldMatrix.makeIdentity();
    bottomWall.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);

    topWall = new WebGLGeometryQuad(gl, phongShaderProgram);
    topWall.create(loadedAssets.GalaxyTex_PositiveY);

    var scale = new Matrix4().makeScale(30.0, 30.0, 30.0);
    var rotation = new Matrix4().makeRotationX(90);
    var translation = new Matrix4().makeTranslation(0, 30, 0);

    topWall.worldMatrix.makeIdentity();
    topWall.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);


    backWall = new WebGLGeometryQuad(gl, phongShaderProgram);
    backWall.create(loadedAssets.GalaxyTex_NegativeZ);

    var scale = new Matrix4().makeScale(30.0, 30.0, 30.0);
    var translation = new Matrix4().makeTranslation(0, 0, -30);

    backWall.worldMatrix.makeIdentity();
    backWall.worldMatrix.multiply(translation).multiply(scale);


    leftWall = new WebGLGeometryQuad(gl, phongShaderProgram);
    leftWall.create(loadedAssets.GalaxyTex_NegativeX);

    var scale = new Matrix4().makeScale(30.0, 30.0, 30.0);
    var rotation = new Matrix4().makeRotationY(90);
    var translation = new Matrix4().makeTranslation(-30, 0, 0);

    leftWall.worldMatrix.makeIdentity();
    leftWall.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);

    rightWall = new WebGLGeometryQuad(gl, phongShaderProgram);
    rightWall.create(loadedAssets.GalaxyTex_PositiveX);

    var scale = new Matrix4().makeScale(30.0, 30.0, 30.0);
    var rotation = new Matrix4().makeRotationY(-90);
    var translation = new Matrix4().makeTranslation(30, 0, 0);

    rightWall.worldMatrix.makeIdentity();
    rightWall.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);

    frontWall = new WebGLGeometryQuad(gl, phongShaderProgram);
    frontWall.create(loadedAssets.GalaxyTex_PositiveZ);

    var scale = new Matrix4().makeScale(30, 30, 30);
    var rotation = new Matrix4().makeRotationX(180);
    var translation = new Matrix4().makeTranslation(0, 0, 30);

    frontWall.worldMatrix.makeIdentity();
    frontWall.worldMatrix.multiply(translation).multiply(rotation).multiply(scale);

    //Venus
    venusGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    venusGeometry.create(loadedAssets.sphereJSON, loadedAssets.venusImage);

    var scale = new Matrix4().makeScale(0.02, 0.02, 0.02);

    var translation = new Matrix4().makeTranslation(0, 1.5, 0);

    venusGeometry.worldMatrix.makeIdentity();
    venusGeometry.worldMatrix.multiply(scale);

    //The EARF
    earthGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    earthGeometry.create(loadedAssets.sphereJSON, loadedAssets.earthImage);

    var scale = new Matrix4().makeScale(0.025, 0.025, 0.025);

    earthGeometry.worldMatrix.makeIdentity();
    earthGeometry.worldMatrix.multiply(scale);

    //Moon
    moonGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    moonGeometry.create(loadedAssets.sphereJSON, loadedAssets.moonImage);

    var scale = new Matrix4().makeScale(0.01, 0.01, 0.01);
    var translation = new Matrix4().makeTranslation(0, 1.5, 12);

    moonGeometry.worldMatrix.makeIdentity();
    moonGeometry.worldMatrix.multiply(translation).multiply(scale);

    //PointLight
    pointLightGeometry = new WebGLGeometryJSON(gl, basicColorProgram);
    pointLightGeometry.create(loadedAssets.sphereJSON);

    var pointlightScaleMatrix = new Matrix4().makeScale(0.05, 0.05, 0.05);
    var translation = new Matrix4().makeTranslation(0, 1.5, 0);
    pointLightGeometry.worldMatrix.makeIdentity();
    pointLightGeometry.worldMatrix.multiply(translation).multiply(pointlightScaleMatrix);

    //The SUN
    sunGeometry = new WebGLGeometryJSON(gl, sunColorProgram);
    sunGeometry.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    var sunScale = new Matrix4().makeScale(0.07, 0.07, 0.07);
    var translation = new Matrix4().makeTranslation(0, 1.5, 0);
    sunGeometry.worldMatrix.makeIdentity();
    sunGeometry.worldMatrix.multiply(translation).multiply(sunScale);

    //Mercury
    mercuryGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    mercuryGeometry.create(loadedAssets.sphereJSON, loadedAssets.mercuryImage);

    var mercuryScale = new Matrix4().makeScale(0.015, 0.015, 0.015);

    mercuryGeometry.worldMatrix.makeIdentity();
    mercuryGeometry.worldMatrix.multiply(mercuryScale);

    //Mars
    marsGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    marsGeometry.create(loadedAssets.sphereJSON, loadedAssets.marsImage);

    var marsScale = new Matrix4().makeScale(0.015, 0.015, 0.015);

    marsGeometry.worldMatrix.makeIdentity();
    marsGeometry.worldMatrix.multiply(marsScale);

    //Jupiter
    jupiterGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    jupiterGeometry.create(loadedAssets.sphereJSON, loadedAssets.jupiterImage);

    var jupiterScale = new Matrix4().makeScale(0.03, 0.03, 0.03);

    jupiterGeometry.worldMatrix.makeIdentity();
    jupiterGeometry.worldMatrix.multiply(jupiterScale);

    //Saturn
    saturnGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    saturnGeometry.create(loadedAssets.sphereJSON, loadedAssets.saturnImage);

    var saturnScale = new Matrix4().makeScale(0.025, 0.025, 0.025);

    saturnGeometry.worldMatrix.makeIdentity();
    saturnGeometry.worldMatrix.multiply(saturnScale);

    //Neptune
    neptuneGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    neptuneGeometry.create(loadedAssets.sphereJSON, loadedAssets.neptuneImage);

    var neptuneScale = new Matrix4().makeScale(0.02, 0.02, 0.02);

    neptuneGeometry.worldMatrix.makeIdentity();
    neptuneGeometry.worldMatrix.multiply(neptuneScale);

    //uranus
    uranusGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    uranusGeometry.create(loadedAssets.sphereJSON, loadedAssets.uranusImage);

    var uranusScale = new Matrix4().makeScale(0.017, 0.017, 0.017);

    uranusGeometry.worldMatrix.makeIdentity();
    uranusGeometry.worldMatrix.multiply(uranusScale);

}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    camera.update(time.deltaTime);

    var degrees = time.deltaTime * 10;

    var rotationY = new Matrix4().makeRotationY(degrees)

    var cosTime = Math.cos(time.secondsElapsedSinceStart);
    var sinTime = Math.sin(time.secondsElapsedSinceStart);
    

    var earthDistance = 12;
    earthPosition.x = cosTime * earthDistance;
    earthPosition.y = 1.5;
    earthPosition.z = sinTime * earthDistance;


    sunGeometry.worldMatrix.multiply(rotationY);
    earthGeometry.worldMatrix.multiply(rotationY);
    
    earthGeometry.worldMatrix.elements[3] = earthPosition.x;
    earthGeometry.worldMatrix.elements[7] = earthPosition.y;
    earthGeometry.worldMatrix.elements[11] = earthPosition.z;

    //moon
    var moonCosTime = Math.cos(time.secondsElapsedSinceStart);
    var moonSinTime = Math.sin(time.secondsElapsedSinceStart);

    var moonDistance = 4;
    moonPosition.x = moonCosTime * moonDistance;
    moonPosition.y = 1.5;
    moonPosition.z = moonSinTime * moonDistance;

    moonGeometry.worldMatrix.multiply(rotationY);
    
    moonGeometry.worldMatrix.elements[3] = moonPosition.x;
    moonGeometry.worldMatrix.elements[7] = moonPosition.y;
    moonGeometry.worldMatrix.elements[11] = moonPosition.z;

    //Mercury
    var mercuryCosTime = Math.cos(2.0 * time.secondsElapsedSinceStart);
    var mercurySinTime = Math.sin(2.0 * time.secondsElapsedSinceStart);

    var mercuryDistance = 5;
    mercuryPosition.x = mercuryCosTime * mercuryDistance;
    mercuryPosition.y = 1.5;
    mercuryPosition.z = mercurySinTime * mercuryDistance;

    mercuryGeometry.worldMatrix.multiply(rotationY);

    mercuryGeometry.worldMatrix.elements[3] = mercuryPosition.x;
    mercuryGeometry.worldMatrix.elements[7] = mercuryPosition.y;
    mercuryGeometry.worldMatrix.elements[11] = mercuryPosition.z;

    //Venus
    var venusCosTime = Math.cos(1.8 * time.secondsElapsedSinceStart);
    var venusSinTime = Math.sin(1.8 * time.secondsElapsedSinceStart);

    var venusDistance = 8;
    venusPosition.x = venusCosTime * venusDistance;
    venusPosition.y = 1.5;
    venusPosition.z = venusSinTime * venusDistance;

    venusGeometry.worldMatrix.multiply(rotationY);

    venusGeometry.worldMatrix.elements[3] = venusPosition.x;
    venusGeometry.worldMatrix.elements[7] = venusPosition.y;
    venusGeometry.worldMatrix.elements[11] = venusPosition.z;

    //Mars
    var marsCosTime = Math.cos(1.6 * time.secondsElapsedSinceStart);
    var marsSinTime = Math.sin(1.6 * time.secondsElapsedSinceStart);

    var marsDistance = 15;
    marsPosition.x = marsCosTime * marsDistance;
    marsPosition.y = 1.5;
    marsPosition.z = marsSinTime * marsDistance;

    marsGeometry.worldMatrix.multiply(rotationY);

    marsGeometry.worldMatrix.elements[3] = marsPosition.x;
    marsGeometry.worldMatrix.elements[7] = marsPosition.y;
    marsGeometry.worldMatrix.elements[11] = marsPosition.z;

    //Jupiter
    var jupiterCosTime = Math.cos(1.4 * time.secondsElapsedSinceStart);
    var jupiterSinTime = Math.sin(1.4 * time.secondsElapsedSinceStart);

    var jupiterDistance = 18;
    jupiterPosition.x = jupiterCosTime * jupiterDistance;
    jupiterPosition.y = 1.5;
    jupiterPosition.z = jupiterSinTime * jupiterDistance;

    jupiterGeometry.worldMatrix.multiply(rotationY);

    jupiterGeometry.worldMatrix.elements[3] = jupiterPosition.x;
    jupiterGeometry.worldMatrix.elements[7] = jupiterPosition.y;
    jupiterGeometry.worldMatrix.elements[11] = jupiterPosition.z;

    //saturn
    var saturnCosTime = Math.cos(1.8 * time.secondsElapsedSinceStart);
    var saturnSinTime = Math.sin(1.8 * time.secondsElapsedSinceStart);

    var saturnDistance = 21;
    saturnPosition.x = saturnCosTime * saturnDistance;
    saturnPosition.y = 1.5;
    saturnPosition.z = saturnSinTime * saturnDistance;

    saturnGeometry.worldMatrix.multiply(rotationY);

    saturnGeometry.worldMatrix.elements[3] = saturnPosition.x;
    saturnGeometry.worldMatrix.elements[7] = saturnPosition.y;
    saturnGeometry.worldMatrix.elements[11] = saturnPosition.z;

    //neptune
    var neptuneCosTime = Math.cos(1.95 * time.secondsElapsedSinceStart);
    var neptuneSinTime = Math.sin(1.95 * time.secondsElapsedSinceStart);

    var neptuneDistance = 24;
    neptunePosition.x = neptuneCosTime * neptuneDistance;
    neptunePosition.y = 1.5;
    neptunePosition.z = neptuneSinTime * neptuneDistance;

    neptuneGeometry.worldMatrix.multiply(rotationY);

    neptuneGeometry.worldMatrix.elements[3] = neptunePosition.x;
    neptuneGeometry.worldMatrix.elements[7] = neptunePosition.y;
    neptuneGeometry.worldMatrix.elements[11] = neptunePosition.z;

    //uranus
    var uranusCosTime = Math.cos(1.2 * time.secondsElapsedSinceStart);
    var uranusSinTime = Math.sin(1.2 * time.secondsElapsedSinceStart);

    var uranusDistance = 27;
    uranusPosition.x = uranusCosTime * uranusDistance;
    uranusPosition.y = 1.5;
    uranusPosition.z = uranusSinTime * uranusDistance;

    uranusGeometry.worldMatrix.multiply(rotationY);

    uranusGeometry.worldMatrix.elements[3] = uranusPosition.x;
    uranusGeometry.worldMatrix.elements[7] = uranusPosition.y;
    uranusGeometry.worldMatrix.elements[11] = uranusPosition.z;

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);
    earthGeometry.render(camera, projectionMatrix, phongShaderProgram);
    //sunGeometry.render(camera, projectionMatrix, phongShaderProgram);
    mercuryGeometry.render(camera, projectionMatrix, phongShaderProgram);
    venusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    marsGeometry.render(camera, projectionMatrix, phongShaderProgram);
    jupiterGeometry.render(camera, projectionMatrix, phongShaderProgram);
    saturnGeometry.render(camera, projectionMatrix, phongShaderProgram);
    neptuneGeometry.render(camera, projectionMatrix, phongShaderProgram);
    uranusGeometry.render(camera, projectionMatrix, phongShaderProgram);
    //moonGeometry.render(camera, projectionMatrix, phongShaderProgram);
    bottomWall.render(camera, projectionMatrix, phongShaderProgram);
    backWall.render(camera, projectionMatrix, phongShaderProgram);
    leftWall.render(camera, projectionMatrix, phongShaderProgram);
    frontWall.render(camera, projectionMatrix, phongShaderProgram);
    rightWall.render(camera, projectionMatrix, phongShaderProgram);
    topWall.render(camera, projectionMatrix, phongShaderProgram);

    gl.useProgram(basicColorProgram);
    gl.uniform4f(basicColorProgram.uniforms.colorUniform, 1.0, 1.0, 1.0, 1.0);
    pointLightGeometry.render(camera, projectionMatrix, basicColorProgram);

    gl.useProgram(sunColorProgram);
    var sunUniforms = sunColorProgram.uniforms;
    var sunCameraPosition = camera.getPosition();
    gl.uniform3f(sunUniforms.lightPositionUniform, lightPosition.x, lightPosition.y, lightPosition.z);
    gl.uniform3f(sunUniforms.cameraPositionUniform, sunCameraPosition.x, sunCameraPosition.y, sunCameraPosition.z);
    sunGeometry.render(camera, projectionMatrix, sunColorProgram);
}
