// make this 120 for the mac:
#version 330 compatibility

// out variables to be interpolated in the rasterizer and sent to each fragment shader:

out  vec2  vST;	  // (s,t) texture coordinates

void
main( )
{
	vST = gl_MultiTexCoord0.st;
	
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
