# CS 457 - Computer Graphics Shaders

Here are all my projects from CS 457 - Computer Graphics Shaders with Dr. Mike Bailey. I learned about different shader types (vertex, tessellation, geometry, fragment, compute) and implemented various shader tricks in C++ with OpenGL and GLSL.

Check out my pdfs folder to read about my approach to each project!

## Step- and Blended-edged Elliptical Dots

<img src="readme/proj1.gif" width=500px>

## Noisy Elliptical Dots

<img src="readme/proj2.gif" width=500px>

## Displacement Mapping, Bump Mapping, and Lighting

<img src="readme/proj3.gif" width=500px>

## Cube Mapping Reflective and Refractive Bump-mapped Surfaces

<img src="readme/proj4.gif" width=500px>

## Image Manipulation

<img src="readme/proj5.gif" width=500px>

## The Dragon Menagerie Project 

In celebration of the Year of the Dragon, everyone got to implement whatever shader they wanted on a dragon OBJ. I made a chromatic aberration shader that gives the dragon a diamondesque look.

<img src="readme/proj6.png" width=500px>

## Geometry Shaders

<img src="readme/proj7.gif" width=500px>

## Final Project - Skin Shader

### Attempt #1 - Sampling Cube Maps and a Skin Texture 

I tried to follow along with Curtis Beeson and Kevin Bjorke's documentation of their Skin in the "Dawn" demo from <a href="https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-3-skin-dawn-demo">Chapter 3 of *GPU Gems*</a> but ended up with a translucent skin bubble that attempts to simulate diffuse reflection and specular highlights 😔. I think it is a start at recreating light passing through skin at the very least. 

<img src="skin1.png" width=500px>

<img src="skin2.png" width=500px>

<img src="skin3.png" width=500px>


There was a lot of Dawn-specific code in the GPU Gems chapter that I spent a lot of time figuring out if I needed, like computing skinning for an animated model. In retrospect, I should have followed an implementation like <a href="https://github.com/Mixmax3d/Real-time-skin-shader-in-GLSL/blob/master/paper_skin_shader.pdf">this</a> instead that renders human skin by having a combination of three layers of skin: diffuse/dermal, epidermal, and subdermal, though that would have involved more texture painting than I would have liked. 

Out of pure disappointment at my first attempt, I tried out two simpler methods:

### Attempt #2 - Texture and Displacement Mapping with a Height Map Under Per-Fragment Lighting

<img src="bump.png" width=500px>

I somewhat felt like texture mapping a solid skin texture was kind of cheating, but it already looked better than my attempt at following the GPU Gems chapter. Using a height map to add displacement mapping to the sphere added a bit of texture, which was a small improvement.

### Attempt #3 - Texture and Normal Mapping

<img src="normal.png" width=500px>

Normal mapping gives the sphere an extremely detailed and realistic look.