precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vTexcoords;

void main(void) {
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
    vec3 diffuseColor = albedo;

    vec3 finalColor = diffuseColor;

    finalColor = finalColor;

    gl_FragColor = vec4(finalColor, 1.0);
}