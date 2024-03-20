// make this 120 for the mac:
#version 330 compatibility

// these have to be set dynamically from glman sliders or keytime animations:

// in variables from the vertex shader:
in vec2 vST; // texture coordinates
in vec3 vN; // normal vector
in vec3 vE; // vector from point to eye
in vec3 vMC; // model coordinates

// get the noise from the glman 3D noise texture
uniform sampler3D Noise3;
uniform float uNoiseAmp, uNoiseFreq;

// skin texture
uniform sampler2D uTexUnitA;

// cube maps
uniform samplerCube DiffuseCubeMap, SpecularCubeMap, Texture;

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

	// sample specular texture
	vec4 s_nvx = texture( uTexUnitA, uNoiseFreq*(vMC.xy));
	vec4 s_nvy = texture( uTexUnitA, uNoiseFreq * vec3(vMC.xy, vMC.z + 0.5).xy);

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

	// compare newly calculated surface normal to the view direction
	// find the angle between the normal and view direction
	float nDotV = dot(Eye, Normal);

	// sample skin texture
	vec4 skinColor = texture(uTexUnitA, vST.xy);

	// diffuse color is calculated using diffuse cube map and sampled specular skin color
	vec4 diffuseSample = texture(DiffuseCubeMap, Normal);
	vec3 diffuse = skinColor.rgb * diffuseSample.rgb;
	
	vec3 result = diffuse.rgb;

	// retrieve color of the environment behind the object by indexing on Eye
	vec3 highlight = 0.7 * texture(Texture, Eye).rgb;

	// reflection vector based on eye direction, dot product between eye direction and surface normal, and surface normal
	vec3 reflVect = Eye * nDotV - (Normal * 2.0);

	// sample color from specular cube map based on reflection vector
	vec4 reflColor = texture(uTexUnitA, reflVect.xy) * s_nvy.a;

	// add specular highlight and apply attenuation
	result += (reflColor.rgb * 0.02);
	
	result += (reflColor.rgb * reflColor.a);
	float highlightAttenuator = s_nvx.r;
	result += (highlight * highlightAttenuator);

	// calculate haze
	float haze = reflColor.a * highlightAttenuator;

	// output the final color
	gl_FragColor = vec4(result, haze);
}