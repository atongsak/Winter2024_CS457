#version 330 compatibility
uniform float uKa;
uniform float uKd;
uniform float uKs;
uniform float uShininess;
uniform float uFreq;
uniform sampler2D Color_Map;
uniform sampler2D Normal_Map;
in vec3 vSurfacePosition;
in vec3 vSurfaceNormal; // not actually using this – just here if we need it
in vec3 vEyeVector;
in vec2 vST;
const vec3 LIGHTPOSITION = vec3( -2., 3., 10. );
const vec3 WHITE = vec3( 1., 1., 1. );
void
main( )
{
	vec3 P = vSurfacePosition;
	vec3 E = normalize( vEyeVector );
	vec3 N = normalize( gl_NormalMatrix * (2.*texture( Normal_Map, uFreq*vST ).xyz - vec3(1.,1.,1.) ) );
	vec3 L = normalize( LIGHTPOSITION - P );
	vec3 Ambient = uKa * texture( Color_Map, uFreq * vST ).rgb;
	float Diffuse_Intensity = dot( N, L );
	vec3 Diffuse = uKd * Diffuse_Intensity * texture( Color_Map, uFreq * vST ).rgb;
	float Specular_Intensity = pow( max( dot( reflect( -L, N ), E ), 0. ), uShininess );
	vec3 Specular = uKs * Specular_Intensity * WHITE;
	gl_FragColor = vec4(Ambient+ Diffuse + Specular, 1. );
}