// make this 120 for the mac:
#version 330 compatibility

// out variables to be interpolated in the rasterizer and sent to each fragment shader:

out vec2 vST; // texture coordinates
out vec3 vN; // normal vector
out vec3 vE; // vector from point to eye
out vec3 vMC; // model coordinates

const vec3 LIGHTPOSITION = vec3( 5., 5., 0. );

void
main( )
{
	vST = gl_MultiTexCoord0.st;
	vMC = gl_Vertex.xyz;
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex; // eye coordinate position
	vN = normalize( gl_NormalMatrix * gl_Normal ); // normal vector
	vE = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point to the eye position
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}