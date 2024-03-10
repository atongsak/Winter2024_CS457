// make this 120 for the mac:
#version 330 compatibility

// lighting uniform variables -- these can be set once and left alone:
uniform float   uKa, uKd, uKs;	 // coefficients of each type of lighting -- make sum to 1.0
uniform vec4    uColor;		 // object color
uniform vec4    uSpecularColor;	 // light color
uniform float   uShininess;	 // specular exponent

// square-equation uniform variables -- these should be set every time Display( ) is called:

uniform float   uS0, uT0;

// in variables from the vertex shader and interpolated in the rasterizer:

in  vec3  vN;		   // normal vector
in  vec3  vL;		   // vector from point to light
in  vec3  vE;		   // vector from point to eye
in  vec2  vST;		   // (s,t) texture coordinates
in  vec3  vMC;

uniform float uA, uB, uC, uD;
uniform sampler3D Noise3;
uniform float uNoiseAmp, uNoiseFreq;
uniform float uLightX, uLightY, uLightZ;

vec3
RotateNormal( float angx, float angy, vec3 n )
{
    float cx = cos( angx );
    float sx = sin( angx );
	float cy = cos( angy );
	float sy = sin( angy );

	// rotate about x:
	float yp =  n.y*cx - n.z*sx;    // y'
	n.z      =  n.y*sx + n.z*cx;    // z'
	n.y      =  yp;
	// n.x      =  n.x;

	// rotate about y:
	float xp =  n.x*cy + n.z*sy;    // x'
	n.z      = -n.x*sy + n.z*cy;    // z'
	n.x      =  xp;
	// n.y      =  n.y;

	return normalize( n );
}

void
main( )
{
	vec3 Normal = normalize(vN);
	vec3 Light  = normalize(vL);
	vec3 Eye    = normalize(vE);

	// use noise texture capability to get 2 noise values 
	// these will be treated as an angle to rotate the normal about x and an angle to rotate the normal about y

	vec4 nvx = texture(Noise3, uNoiseFreq * vMC); //vMC are the vec3 model coordinates passed over from the vertex shader
	float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.;	// -1. to +1.
	angx *= uNoiseAmp;

    vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMC.xy,vMC.z+0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.;	// -1. to +1.
	angy *= uNoiseAmp;

	// rotate the normal
	vec3 n = RotateNormal( angx, angy, Normal );

	// multiply the normal by the gl_NormalMatrix and normalize it
	n = normalize(  gl_NormalMatrix * n  );

	vec3 myColor = uColor.rgb;

	// apply per-fragment lighting:

	vec3 ambient = uKa * myColor;

	float d = max( dot(n,Light), 0. );       // only do diffuse if the light can see the point
	vec3 diffuse = uKd * d * myColor;

	float s = 0.;
	if( dot(n,Light) > 0. )	      // only do specular if the light can see the point
	{
		vec3 ref = normalize(  reflect( -Light, n )  );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 specular = uKs * s * uSpecularColor.rgb;
	gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}

