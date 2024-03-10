// make this 120 for the mac:
#version 330 compatibility
#define PI 3.14159265

uniform float uPower;
uniform float uRtheta;
uniform float uMosaic;
uniform float uBlend;
uniform sampler2D TexUnitA;
uniform sampler2D TexUnitB;

// in variables from the vertex shader and interpolated in the rasterizer:

in vec2 vST;

const vec4 BLACK = vec4( 0., 0., 0., 1. );

float
atan2( float y, float x )
{
        if( x == 0. )
        {
                if( y >= 0. )
                        return  PI/2.;
                else
                        return -PI/2.;
        }
        return atan(y,x);
}

void
main( )
{
	// Fisheye
	// uPower is the exponent in the fisheye equation
	vec2 st = vST - vec2(0.5, 0.5); // put (0,0) in the middle so that the range is -0.5 to +0.5
	float r = length(st);
	float r1 = pow((2*r), uPower);

	// Whirl
	
	// uRtheta is the radius multiplier in the whirl equation
	float theta = atan2(st.t, st.s);
	float theta1 = theta - uRtheta * r;

	// Restoring (st.s,st.t)
	st = r1 * vec2(cos(theta1), sin(theta1)); 		// now in the range -1. to +1.
	st += 1; 										// change the range to 0. to +2.
	st *= 0.5; 										// change the range to 0. to +1.

	// Mosaicing
	// uMosaic is the size in s and t to collapse into a single color
	float Ar = uMosaic/2; // ellipse radius for s, aka Ar
	float Br = uMosaic/2; // ellipse radius for t, aka Br

	// Which block of pixels will this pixel be in? The methodology is the same as with the ellipses

	int numins = int(st.s/uMosaic);
	int numint = int(st.t/uMosaic);
	float sc = numins * uMosaic + Ar;
	float tc = numint * uMosaic + Br;

	// for this block of pixels, we are only going to sample the texture at the center:
	st.s = sc;
	st.t = tc;

	// Blacking out parts of the image that don't reach the borders and blending
	// if s or t end up outside the range [0., 1.], paint the pixel black:
	if(any(lessThan(st, vec2(0.,0.)))){
		gl_FragColor = BLACK;
	} else {
		if(any(greaterThan(st, vec2(1.,1.)))) {
			gl_FragColor = BLACK;
		} else {
			// sample both textures at (s,t) giving back two rgb vec3s
			vec3 smallrgb = texture(TexUnitA, st).rgb;
			vec3 bigrgb = texture(TexUnitB, st).rgb;
			// mix the two rgbs using uBlend
			vec3 rgb = mix(smallrgb, bigrgb, uBlend);

			gl_FragColor = vec4(rgb, 1.);
		}
	}
}