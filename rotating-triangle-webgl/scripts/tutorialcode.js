var vertextShaderText =
	[
		'precision mediump float;',
		'',
		'attribute vec3 vertPosition;',
		'attribute vec3 vertColor;',
		'varying vec3 fragColor;',
		'uniform mat4 mWorld;', // world matrix
		'uniform mat4 mView;', // view matrix
		'uniform mat4 mProj;', // projection matrix
		'',
		'void main()',
		'{',
		'	fragColor = vertColor;',
		'	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
		'}'
	].join('\n');

var fragmentShaderText =
	[
		'precision mediump float;',
		'',
		'varying vec3 fragColor;',
		'void main()',
		'{',
		'	gl_FragColor = vec4(fragColor, 1.0);',
		'}'
	].join('\n');


function InitDemo() {
	console.log('This is working');

	// assigning to canvas declared in HTML 
	var canvas = document.getElementById('game-surface');
	// gets context from canvas
	var gl = canvas.getContext('webgl');

	if (!gl) {
		throw new Error('WebGL not supported :(');
	}

	// Clearing webGL context and resetting it's color to a specific color
	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create Shaders
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertextShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	// how we get errors from shader compilation
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR: Compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR: Compiling vertex shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	// link error handling
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR: Linking program!', gl.getProgramInfoLog(program));
		return;
	}

	// catches additional errors but is expensive to run
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.log('ERROR: Validating program!', gl.getProgramInfoLog(program));
		return;
	}

	// create vertex buffer
	var triangleVertices =
		[	// X, Y			R, G, B
			0.0, 0.5, 0.0, 		1.0, 1.0, 0.0,
			-0.5, -0.5, 0.0,	0.7, 0.0, 1.0,
			0.5, -0.5, 0.0,		0.1, 1.0, 0.6
		];

	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW); // uses last buffer bound

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation, //Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE, // Is data normalized
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0, // Offset from the beginning of asingle vertex to this attribute
	);
	gl.vertexAttribPointer(
		colorAttribLocation, //Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE, // Is data normalized
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		3 * Float32Array.BYTES_PER_ELEMENT, // Offset from the beginning of asingle vertex to this attribute
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);
	// create fragment buffer

	// TRell OpenGL State machine which program should be active
	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	glMatrix.mat4.identity(worldMatrix);
	glMatrix.mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
	glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix); // must always be false for WebGL. Sets tranpose (does not work for WebGL)
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


	/* TYPICAL JAVASCRIPT GAME LOOP
	var loop = function () {
		updateWorld();
		renderWorld();
		if (running) {
			requestAnimationFrame(loop)
		}
	}
	requestAnimationFrame(loop)
	*/
	//
	// MAIN RENDER LOOP
	//

	// not a good idea to declare variables inside of loop
	//		(memory allocation takes a bit)
	var angle = 0;
	var identityMatrix = new Float32Array(16);
	glMatrix.mat4.identity(identityMatrix);
	function loop () {
		// rotation
		angle = performance.now() / 1000 / 3 * 2 * Math.PI;
		glMatrix.mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]); // output, about, angle of degrees, axis to change
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
		
		gl.clear(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 3); // way to draw, which ones to skip, how many vertices to draw

		// request animation frame called when screen ready to draw new image (every 1/60 of a second)
		requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop);
}
