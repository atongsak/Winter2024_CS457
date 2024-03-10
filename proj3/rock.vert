// make this 120 for the mac:
#version 330 compatibility
#define M_PI 3.14159265

// out variables to be interpolated in the rasterizer and sent to each fragment shader:

out  vec3  vN;	  // normal vector
out  vec3  vL;	  // vector from point to light
out  vec3  vE;	  // vector from point to eye
out  vec2  vST;	  // (s,t) texture coordinates
out  vec3  vMC;

// where the light is:

uniform float uLightX, uLightY, uLightZ;

uniform float uA, uB, uC, uD;

void
main( )
{
	vec3 LightPosition = vec3(uLightX, uLightY, uLightZ);

	float x = gl_Vertex.x;
	float y = gl_Vertex.y; 	

	// Displace Z
	float r = sqrt(pow(x,2) + pow(y,2));
	float z = uA * cos(2*M_PI*uB*r + uC) * exp(-uD*r);
	
	// Compute Normal
	float dzdr = uA * ( -sin(2.*M_PI*uB*r+uC) * 2.*M_PI*uB * exp(-uD*r) + cos(2.*M_PI*uB*r+uC) * -uD * exp(-uD*r) );
	
	float drdx = x/r;
	float drdy = y/r;
	
	float dzdx = dzdr * drdx;
	float dzdy = dzdr * drdy;

	vec3 Tx = vec3(1., 0., dzdx);
	vec3 Ty = vec3(0., 1., dzdy);

	vN = normalize(cross(Tx, Ty));

	// Compute vector from point to light
	vST = gl_MultiTexCoord0.st;
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;

	// Pass it to the fragment shader as an out vec3 vN
	vN = normalize( gl_NormalMatrix * vN );  // normal vector - notice how we're using vN, the normal we computed
	vL = LightPosition - ECposition.xyz;	    // vector from the point
							// to the light position

	// Compute vector from point to eye
	vE = vec3( 0., 0., 0. ) - ECposition.xyz;       // vector from the point
							// to the eye position
	vec4 newVertex = gl_Vertex;
	newVertex.z = z; // setting to the z we computed
	gl_Position = gl_ModelViewProjectionMatrix * newVertex;

	vMC = newVertex.xyz;
}
