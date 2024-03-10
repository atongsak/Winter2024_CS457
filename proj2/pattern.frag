// make this 120 for the mac:
#version 330 compatibility

// lighting uniform variables -- these can be set once and left alone:
// you can set these uniform variables  dynamically or hardwire them:
uniform float uKa, uKd, uKs; // coefficients of each type of lighting
uniform float uShininess; // specular exponent

// these have to be set dynamically from glman sliders or keytime animations:
uniform float uAd, uBd;
uniform float uTol;

// in variables from the vertex shader:
in vec2 vST; // texture cords
in vec3 vN; // normal vector
in vec3 vL; // vector from point to light
in vec3 vE; // vector from point to eye
in vec3 vMCposition;

// get the noise from the glman 3D noise texture
// look it up using (s,t,0.) if using 2D texture coords:
// look it up using (x,y,z)  if using 3D model   coords:

uniform sampler3D Noise3;
uniform float uNoiseAmp, uNoiseFreq;
uniform bool uUseXYZforNoise;

void
main( )
{
	vec3 Normal = normalize(vN);
	vec3 Light = normalize(vL);
	vec3 Eye = normalize(vE);
	vec3 mySpecularColor = vec3( 1., 1., 1. );	// whatever default color you'd like

	// set myColor by using the ellipse equation to create a smooth blend between the ellipse color and the background color 
	// now use myColor in the lighting equations 

	float a = vST.s;
	float b = vST.t;

	float Ar = uAd/2.; // ellipse radius for s, aka Ar
	float Br = uBd/2.; // ellipse radius for t, aka Br

	// calculate ellipse coordinates using numins and numint
	int numins = int(vST.s/uAd);
	int numint = int(vST.t/uBd);

	// determine sc and tc 
	float uSc = numins * uAd + Ar;
	float uTc = numint * uBd + Br;

	// ellipse boundary check
	float ellipseEquation = (a - uSc) * (a - uSc) / (Ar * Ar) + (b - uTc) * (b - uTc) / (Br * Br);

	float t = smoothstep(1-uTol, 1+uTol, ellipseEquation);
	vec3 myColor = mix(vec3(1.0, 0.5, 0), mySpecularColor, t);



	vec4 nv;

	if(uUseXYZforNoise) { // index noise from 3D model coordinates
		nv = texture(Noise3, uNoiseFreq * vMCposition);
	} else { // index noise from 2D texture coordinates
		nv = texture(Noise3, uNoiseFreq * vec3(vST,0.));
	}

	// give the noise a range of [-1., +1]
	float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
	n = n - 2.;                             // -1. -> 1.
	n *= uNoiseAmp;				// -uNoiseAmp -> uNoiseAmp

	// determine sc and tc 

	// determine ds and dt 
	float ds = a - uSc; // with respect to ellipse center
	float dt = b - uTc; // wrt ellipse center

	// add noise to the actual input values to produce new "fake" input values
	float oldDist = sqrt(ds*ds + dt*dt);
	float newDist = oldDist + n;
	float scale = newDist / oldDist; // this could be < 1., = 1., or > 1.

	// scale ds and dt
	ds *= scale; // scale by noise factor
	dt *= scale;

	// divide the modified ds and dt by Ar and Br, respectively 
	ds /= Ar;
	dt /= Br;

	// compute d by squaring the modified quantities and adding them together
	float de = ds*ds + dt*dt;

	// use d in the smoothstep( ) function
	t = smoothstep(1.-uTol, 1.+uTol, de);

	// use what you get back from smoothstep( ) to mix( ) the 2 colors
	// this gives you the noise-modified pattern 
	myColor = mix(vec3(1.0, 0.5, 0), mySpecularColor, t);



	// here is the per-fragment lighting:
	vec3 ambient = uKa * myColor;
	float d = 0.;
	float s = 0.;
	if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
	{
		d = dot(Normal,Light);
		vec3 ref = normalize( reflect( -Light, Normal ) ); // reflection vector
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 diffuse =  uKd * d * myColor;
	vec3 specular = uKs * s * mySpecularColor;
	gl_FragColor = vec4( ambient + diffuse + specular, 1. );
}

