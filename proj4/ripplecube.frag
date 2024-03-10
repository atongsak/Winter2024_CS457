#version 330 compatibility

uniform sampler3D	Noise3;
uniform float 		uNoiseAmp;
uniform float 		uNoiseFreq;
uniform float		uEta;
uniform float 		uMix;
uniform float 		uWhiteMix;
uniform samplerCube uReflectUnit;
uniform samplerCube uRefractUnit;

in vec3	vMC;
in vec3	vNs;
in vec3	vEs;

const vec3  WHITE = vec3( 1.,1.,1. );

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
	vec3 Normal = vNs;	// remember to unitize this
	vec3 Eye =    vEs;	// remember to unitize this

	vec4 nvx = texture( Noise3, uNoiseFreq*vMC );
	vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMC.xy,vMC.z+0.5) );

	float angx = nvx.r + nvx.g + nvx.b + nvx.a;	//  1. -> 3.
	angx = angx - 2.;				// -1. -> 1.
	angx *= uNoiseAmp;

	float angy = nvy.r + nvy.g + nvy.b + nvy.a;	//  1. -> 3.
	angy = angy - 2.;				// -1. -> 1.
	angy *= uNoiseAmp;

	Normal = RotateNormal( angx, angy, Normal );
	Normal = normalize( gl_NormalMatrix * Normal );

	vec3 reflectVector = reflect(Eye, Normal);
	vec3 reflectColor = texture(uReflectUnit, reflectVector).rgb;

	vec3 refractVector = refract(Eye, Normal, uEta);

	vec3 refractColor;
	if( all( equal( refractVector, vec3(0.,0.,0.) ) ) )
	{
		refractColor = reflectColor;
	}
	else
	{
		refractColor = texture( uRefractUnit, refractVector ).rgb;
		refractColor = mix( refractColor, WHITE, uWhiteMix );
	}

	// for reference:
	
	// reflection
	//gl_FragColor = vec4(reflectColor.rgb, 1.);

	// refraction
	//vec3 color = mix(refractColor, reflectColor, uMix);
	//color = mix(color, WHITE, uWhiteMix);
	//gl_FragColor = vec4(color, 1.);
	
	gl_FragColor = mix(vec4(reflectColor.rgb, 1.), vec4(refractColor, 1.), uMix);

}