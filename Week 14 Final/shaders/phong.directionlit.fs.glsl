precision mediump float;

uniform vec3 uDirectionToLight;
uniform vec3 uCameraPosition;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    vec3 worldNormal01 = normalize(vWorldNormal);
    vec3 directionToEye01 = normalize(uCameraPosition - vWorldPosition);
    vec3 reflection01 = 2.0 * dot(worldNormal01, uDirectionToLight) * worldNormal01 - uDirectionToLight;

    float lambert = max(dot(worldNormal01, uDirectionToLight), 0.0);
    float reflectionDotEyeDir = max(dot(reflection01, directionToEye01), 0.0);
    float specularIntensity = pow(reflectionDotEyeDir, 64.0);

    vec3 ambient = vec3(0.0, 0.0, 0.0); 
    vec3 diffuseColor = vec3(lambert, lambert, lambert); 
    vec3 specularColor = vec3(0.3, 0.3, 0.3) * specularIntensity;
    vec3 finalColor = ambient + diffuseColor + specularColor;

    gl_FragColor = vec4(finalColor, 1.0);
}
