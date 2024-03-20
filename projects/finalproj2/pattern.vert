#version 330 compatibility
uniform float uLightX, uLightY, uLightZ;
uniform float uHeightScale;
uniform float uSeaLevel;
uniform sampler2D uDispUnit;
uniform bool uDoElevations;
out vec2 vST;
out vec3 vN; // normal vector
out vec3 vL; // vector from point to light
out vec3 vE;

vec3 LIGHTPOS = normalize( vec3( uLightX, uLightY, uLightZ ) );
void
main( )
{
	vec2 st = gl_MultiTexCoord0.st;
	vST = st;
	vec3 norm = normalize( gl_NormalMatrix * gl_Normal ); // normal vector
	vN = norm;
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex; // eye coordinate position
	vL = LIGHTPOS - ECposition.xyz; // vector from the point to the light position
	vE = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point to the eye position
	vec3 vert = gl_Vertex.xyz;
	if( uDoElevations )
	{
		float disp = texture( uDispUnit, st ).r; // in half-meters, relative to a radius of 1727400 meters
		disp -= uSeaLevel;
		disp *= uHeightScale;
		vert += normalize(gl_Normal) * disp;
	}
	gl_Position = gl_ModelViewProjectionMatrix * vec4( vert, 1. );
}