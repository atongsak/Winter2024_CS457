// make this 120 for the mac:
#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable
layout( triangles ) in;
layout( triangle_strip, max_vertices=73 ) out;

uniform int	    uLevel;		// how many levels to subdivide the triangle
uniform float	uQuantize;	// the quantization multiplier
uniform float	uDiam;		// diameter of the spheres
uniform float 	uLightX;
uniform float 	uLightY;
uniform float 	uLightZ;

out vec3	gN;		 // normal vector
out vec3	gL;		 // vector from point to light
out vec3	gE;		 // vector from point to eye
out float 	gZ;

vec3  V0, V1, V2;
vec3  V01, V02;
vec3  CG;
vec3 LIGHTPOS = vec3( uLightX, uLightY, uLightZ );	// feel free to just set the light position to a fixed location

float
Quantize( float f )
{
    f *= uQuantize;
    int fi = int( f );
    f = float( fi ) / uQuantize;
    return f;
}

// give it an s and t and figure out what the x, y, z coordinates are
void
ProduceVertex( float s, float t )
{
	vec3 v = V0 + s*V01 + t*V02;		// do the vertex (s,t) interpolation
	v -= CG;							// make v's coordinates be with respect to the CG
	v = v * ((uDiam / 2.0)/length(v.xyz));		// roughly same code as morphing the cow into a sphere of radius uDiam/2.
	v += CG;							// put v back in the global space (ie, un-do the second line of code)

	vec4 ECposition = gl_ModelViewMatrix * vec4(v,1.); // eye coordinate position

	vec3 n = v - CG;						// on a sphere, the normal is a vector from the sphere center (CG) to the vertex
	n = normalize(gl_NormalMatrix * n);		// multiply the new normal by the proper matrix and normalize it

	// will be needed by the fragment shader to perform per-fragment lighting:
	gN = n; 							
	gL = normalize(LIGHTPOS - ECposition.xyz); 
	gE = normalize(vec3( 0., 0., 0. ) - ECposition.xyz); 
	gZ = -ECposition.z;

	// finally multiply the vertex by the combined matrices:
	gl_Position = gl_ModelViewProjectionMatrix * vec4(v,1.);
	EmitVertex();
}

void
main( )
{
	V0  =   gl_PositionIn[0].xyz;
	V1  =   gl_PositionIn[1].xyz;
	V2  =   gl_PositionIn[2].xyz;
	V01 = V1 - V0;
	V02 = V2 - V0;

	CG = ( V0 + V1 + V2 ) / 3.;
	CG = vec3(Quantize(CG.x), Quantize(CG.y), Quantize(CG.z));

	// determine how many layers are needed based on the level
	int numLayers = 1 << uLevel;

	float dt = 1./float(numLayers);

	float t_top = 1.;

	for(int it = 0; it < numLayers; it++){
		float t_bot = t_top - dt;
		float smax_top = 1. - t_top;
		float smax_bot = 1. - t_bot;

		int nums = it + 1;
		float ds_top = smax_top / float(nums - 1);
		float ds_bot = smax_bot / float(nums);

		float s_top = 0.;
		float s_bot = 0.;

		// produce vertices as we subdivide across the layer
		for(int is = 0; is < nums; is++){
			ProduceVertex(s_bot, t_bot);
			ProduceVertex(s_top, t_top);
			s_top += ds_top;
			s_bot += ds_bot;
		}

		ProduceVertex(s_bot, t_bot);
		EndPrimitive();

		t_top = t_bot;
		t_bot -= dt;
	}
}