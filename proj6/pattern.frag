// make this 120 for the mac:
#version 330 compatibility

// these have to be set dynamically from glman sliders or keytime animations:
uniform samplerCube uReflectUnit;
uniform float uIorR;
uniform float uIorG;
uniform float uIorB;

// in variables from the vertex shader:
in vec2 vST; // texture coordinates
in vec3 vN; // normal vector
in vec3 vE; // vector from point to eye
in vec3 vMC; // model coordinates

// get the noise from the glman 3D noise texture
uniform sampler3D Noise3;
uniform float uNoiseAmp, uNoiseFreq;

vec3
RotateNormal( float angx, float angy, vec3 n )
{
	float cx = cos( angx );
	float sx = sin( angx );
	float cy = cos( angy );
	float sy = sin( angy );
	
	// rotate about x:
	float yp =  n.y*cx - n.z*sx;	// y'
	n.z      =  n.y*sx + n.z*cx;	// z'
	n.y      =  yp;
	// n.x      =  n.x;

	// rotate about y:
	float xp =  n.x*cy + n.z*sy;	// x'
	n.z      = -n.x*sy + n.z*cy;	// z'
	n.x      =  xp;
	// n.y      =  n.y;

	return normalize( n );
}

void
main( )
{
	// normalize the surface normal and eye vectors
	vec3 Normal = normalize(vN);
	vec3 Eye = normalize(vE);

	// sample noise textures to generate rotation angles
	vec4 nvx = texture( Noise3, uNoiseFreq*vMC );
	vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMC.xy,vMC.z+0.5) );

	// extract and adjust rotation angles for x-axis
	float angx = nvx.r + nvx.g + nvx.b + nvx.a;	//  1. -> 3.
	angx = angx - 2.;				// -1. -> 1.
	angx *= uNoiseAmp;

	// extract and adjust rotation angles for y-axis
	float angy = nvy.r + nvy.g + nvy.b + nvy.a;	//  1. -> 3.
	angy = angy - 2.;				// -1. -> 1.
	angy *= uNoiseAmp;

	// rotate the normal vector using computed angles and normalize
	Normal = RotateNormal( angx, angy, Normal );
	Normal = normalize( gl_NormalMatrix * Normal );

	// calculate inverse of individual indices of refraction for R, G, and B
	float iorRatioRed = 1.0/uIorR;
	float iorRatioGreen = 1.0/uIorG;
	float iorRatioBlue = 1.0/uIorB;

	vec3 color = vec3(1.0);

	// calculate unique refraction vectors for R, G, and B
	vec3 refractVecR = refract(Eye, Normal, iorRatioRed);
	vec3 refractVecG = refract(Eye, Normal, iorRatioGreen);
	vec3 refractVecB = refract(Eye, Normal, iorRatioBlue);

	// sample the cube map using the unique refraction vectors for each color channel
	float R = textureCube(uReflectUnit, vec3(vST, 0) + refractVecR).r;
	float G = textureCube(uReflectUnit, vec3(vST, 0) + refractVecG).g;
	float B = textureCube(uReflectUnit, vec3(vST, 0) + refractVecB).b;
	
	// apply the refraction results to each color channel
	color.r = R;
	color.g = G;
	color.b = B;

	// output the final color
	gl_FragColor = vec4(color, 1.0);
}