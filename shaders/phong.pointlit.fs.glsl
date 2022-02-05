precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vTexcoords;

void main(void) {
    vec3 fromHereToLight01 = normalize(uLightPosition - vWorldPosition);

    vec3 worldNormal01 = normalize(vWorldNormal);
    vec3 directionToEye01 = normalize(uCameraPosition - vWorldPosition);
    vec3 reflection01 = 2.0 * dot(worldNormal01, fromHereToLight01) * worldNormal01 - fromHereToLight01;

    float lambert = max(dot(worldNormal01, fromHereToLight01), 0.0);
    float reflectionDotEyeDir = max(dot(reflection01, directionToEye01), 0.0);
    float specularIntensity = pow(reflectionDotEyeDir, 64.0);

    vec3 ambient = vec3(0.0, 0.0, 0.0);
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
    vec3 diffuseColor = albedo * lambert;
    vec3 specularColor = vec3(0.3, 0.3, 0.3) * specularIntensity;
    vec3 finalColor = diffuseColor + ambient;

    float distanceToLight = length(uLightPosition - vWorldPosition);
    float distanceToLightSqr = distanceToLight * distanceToLight;

    // https://www.desmos.com/calculator/nmnaud1hrw
    float linearFalloff = 0.1;
    float quadraticFallof = 0.01;
    float attenuation = 5.0 / (2.0 + linearFalloff * distanceToLight + quadraticFallof * distanceToLightSqr);

    finalColor = finalColor * attenuation;

    gl_FragColor = vec4(finalColor, 1.0);
}
