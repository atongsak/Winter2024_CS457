// make this 120 for the mac:
#version 330 compatibility
#define M_PI 3.14159265

uniform float uA, uB, uC, uD;

// out variables to be interpolated in the rasterizer and sent to each fragment shader:

out  vec3  vNs;	  
out  vec3  vEs;	 
out  vec3  vMC;	  

void
main( )
{
	float x = gl_Vertex.x;
	float y = gl_Vertex.y;

	vMC = gl_Vertex.xyz;
	vec4 newVertex = gl_Vertex;
	float r = sqrt(pow(x,2) + pow(y,2));
	newVertex.z = uA * cos(2*M_PI*uB*r + uC) * exp(-uD*r);

	vec4 ECposition = gl_ModelViewMatrix * newVertex;

	float dzdr = uA * ( -sin(2.*M_PI*uB*r+uC) * 2.*M_PI*uB * exp(-uD*r) + cos(2.*M_PI*uB*r+uC) * -uD * exp(-uD*r) );
	float drdx = newVertex.x/r;
	float drdy = newVertex.y/r;
	float dzdx = dzdr * drdx;
	float dzdy = dzdr * drdy;
	vec3 xtangent = vec3(1., 0., dzdx);
	vec3 ytangent = vec3(0., 1., dzdy);

	vec3 newNormal = normalize(cross(xtangent, ytangent));
	vNs = newNormal;
	vEs = ECposition.xyz - vec3( 0., 0., 0. ) ; 
	       		// vector from the eye position to the point

	gl_Position = gl_ModelViewProjectionMatrix * newVertex;
}
