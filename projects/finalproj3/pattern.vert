#version 330 compatibility
out vec2 vST;
out vec3 vSurfacePosition;
out vec3 vSurfaceNormal;
out vec3 vEyeVector;

void
main( )
{
	vSurfacePosition = (gl_ModelViewMatrix * gl_Vertex).xyz;
	vSurfaceNormal = normalize( gl_NormalMatrix * gl_Normal );
	vEyeVector = -vSurfacePosition;
	vST = gl_MultiTexCoord0.st;
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}