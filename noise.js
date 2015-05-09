var GRID_SIZE = 255;

var grid = [];

function generateGrid() {
	grid = [];

	for (var x = 0; x < GRID_SIZE; ++x) {
		for (var y = 0; y < GRID_SIZE; ++y) {
			var theta = 2 * Math.PI * Math.random();

			var xComponent = Math.sin(theta);
			var yColumn = Math.cos(theta);

			grid.push(xComponent);
			grid.push(yColumn);
		}
	}
};

var COORDS_PER_GRID = 50;

/**
 * We'll assume integer incoming coordinates, but for the purposes
 * of the noise function, we'll map them into a compressed representation
 * to map into the gradient grid.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Number} noise [-1, 1]
 * @public
 */
function perlin(x, y) {
	var i = Math.floor(x / COORDS_PER_GRID);
	var j = Math.floor(y / COORDS_PER_GRID);

	var g00x = grid[2 * ((i + 0) * GRID_SIZE + (j + 0)) + 0];
	var g00y = grid[2 * ((i + 0) * GRID_SIZE + (j + 0)) + 1];

	var g10x = grid[2 * ((i + 1) * GRID_SIZE + (j + 0)) + 0];
	var g10y = grid[2 * ((i + 1) * GRID_SIZE + (j + 0)) + 1];

	var g01x = grid[2 * ((i + 0) * GRID_SIZE + (j + 1)) + 0];
	var g01y = grid[2 * ((i + 0) * GRID_SIZE + (j + 1)) + 1];

	var g11x = grid[2 * ((i + 1) * GRID_SIZE + (j + 1)) + 0];
	var g11y = grid[2 * ((i + 1) * GRID_SIZE + (j + 1)) + 1];

	var u = (x / COORDS_PER_GRID) - i;
	var v = (y / COORDS_PER_GRID) - j;

	var n00 = g00x *  u      + g00y *  v;
	var n10 = g10x * (u - 1) + g10y *  v;
	var n01 = g01x *  u      + g01y * (v - 1);
	var n11 = g11x * (u - 1) + g11y * (v - 1);

	function f(t) { return t * t * t * (10 + t * (-15 + 6 * t)); }

	var nx0 = n00 * (1 - f(u)) + n10 * f(u);
	var nx1 = n01 * (1 - f(u)) + n11 * f(u);
	var nxy = nx0 * (1 - f(v)) + nx1 * f(v);

	return nxy;

};

var canvas = document.getElementById("canvas");

var MAP_SIZE = 128;
var BLOCK_SIZE = 10;
canvas.width = MAP_SIZE * BLOCK_SIZE;
canvas.height = MAP_SIZE * BLOCK_SIZE;

var ctx = canvas.getContext("2d");

var DEEP_WATER_COLOR = {
	r: 0x00,
	g: 0x00,
	b: 0xcd,
	stop: -0.45
};
var WATER_COLOR = {
	r: 0x00,
	g: 0xBF,
	b: 0xFF,
	stop: -0.3
};
var SAND_COLOR = {
	r: 0xf5,
	g: 0xf5,
	b: 0xdc,
	stop: -0.2
};
var GRASS_COLOR = {
	r: 0x98,
	g: 0xfb,
	b: 0x98,
	stop: 0.2
};
var TREE_COLOR = {
	r: 0x22,
	g: 0x8b,
	b: 0x22,
	stop: 0.45
};
var SNOW_COLOR = {
	r: 0xf5,
	g: 0xff,
	b: 0xfa,
	stop: 100
};

var tileColors = [
	DEEP_WATER_COLOR,
	WATER_COLOR,
	SAND_COLOR,
	GRASS_COLOR,
	TREE_COLOR,
	SNOW_COLOR
];

var xCoord = 0;
var yCoord = 0;

function drawNoise() {
	var imageData = ctx.getImageData(0, 0, MAP_SIZE * BLOCK_SIZE, MAP_SIZE * BLOCK_SIZE);
	var pixelData = imageData.data;

	for (var x = 0; x < MAP_SIZE; ++x) {
		for (var y = 0; y < MAP_SIZE; ++y) {
			var noise = perlin(x + xCoord, y + yCoord);

			var colorIdx = 0;
			var color = tileColors[0];
			while (noise > color.stop) {
				++colorIdx;
				color = tileColors[colorIdx];
			}

			// Fill a whole rectangle
			for (var idx = 0; idx < BLOCK_SIZE * BLOCK_SIZE; ++idx) {
				var rectX = x * BLOCK_SIZE + ~~(idx / BLOCK_SIZE);
				var rectY = y * BLOCK_SIZE + idx % BLOCK_SIZE;

				var pixelIdx = 4 * (rectX * MAP_SIZE * BLOCK_SIZE + rectY);

				pixelData[pixelIdx] = color.r;
				pixelData[pixelIdx + 1] = color.g;
				pixelData[pixelIdx + 2] = color.b;
				pixelData[pixelIdx + 3] = 255;
			}
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

generateGrid();

var delta = -1;
var scale = 5;
function updateGridScale() {
	if (COORDS_PER_GRID <= 25) {
		delta = 1;
	} else if (COORDS_PER_GRID >= 500) {
		delta = -1;
	}

	COORDS_PER_GRID += (delta * scale);
};

var keyMap = {};

function animate() {
	if (keyMap[37]) {
		yCoord -= 10;
	}
	if (keyMap[38]) {
		xCoord -= 10;
	}
	if (keyMap[39]) {
		yCoord += 10;
	}
	if (keyMap[40]) {
		xCoord += 10;
	}

	xCoord = Math.min(Math.max(0, xCoord), GRID_SIZE * COORDS_PER_GRID);
	yCoord = Math.min(Math.max(0, yCoord), GRID_SIZE * COORDS_PER_GRID);

	//updateGridScale();
	drawNoise();

	requestAnimationFrame(animate);
};

animate();

document.onkeydown = function keydown(e) {
	var code = e.keyCode;
	keyMap[code] = true;
};

document.onkeyup = function keyup(e) {
	var code = e.keyCode;
	keyMap[code] = false;
};
