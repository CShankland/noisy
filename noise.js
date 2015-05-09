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

var MAP_SIZE = 80;
var BLOCK_SIZE = 16;
canvas.width = MAP_SIZE * BLOCK_SIZE;
canvas.height = MAP_SIZE * BLOCK_SIZE;

var ctx = canvas.getContext("2d");

function createColorStop(color, stop) {
	return {
		styles: color.map(function createStyle(c) {
			return "rgb(" + c.r + "," + c.g + "," + c.b + ")"
		}),
		stop: stop
	};
}

var DEEP_WATER_COLOR = [
	{ r: 0x00, g: 0x00, b: 0xCD },
	{ r: 0x10, g: 0x10, b: 0xA9 }
];
var WATER_COLOR = [
	{ r: 0x00, g: 0xBF, b: 0xFF },
	{ r: 0x00, g: 0x9A, b: 0xFF }
];
var LIGHT_WATER_COLOR = [{ r: 0x72, g: 0xDA, b: 0xFF }];
var SAND_COLOR        = [{ r: 0xf5, g: 0xf5, b: 0xdc }];
var GRASS_COLOR = [
	{ r: 0x98, g: 0xfb, b: 0x98 },
	{ r: 0xE0, g: 0xFA, b: 0x99 }
];
var TREE_COLOR        = [{ r: 0x22, g: 0x8b, b: 0x22 }];
var SNOW_COLOR        = [{ r: 0xf5, g: 0xff, b: 0xfa }];

var tileColors = [
	createColorStop(DEEP_WATER_COLOR, -0.45),
	createColorStop(WATER_COLOR, -0.38),
	createColorStop(LIGHT_WATER_COLOR, -0.34),
	createColorStop(WATER_COLOR, -0.3),
	createColorStop(SAND_COLOR, -0.2),
	createColorStop(GRASS_COLOR, 0.2),
	createColorStop(TREE_COLOR, 0.45),
	createColorStop(SNOW_COLOR, 100)
];

var xCoord = 0;
var yCoord = 0;

function drawNoise() {
	for (var x = 0; x < MAP_SIZE; ++x) {
		for (var y = 0; y < MAP_SIZE; ++y) {
			var noise = perlin(x + xCoord, y + yCoord);

			var colorIdx = 0;
			var color = tileColors[0];
			while (noise > color.stop) {
				++colorIdx;
				color = tileColors[colorIdx];
			}

			var styleIdx = ~~(Math.abs(noise) * (10 + color.styles.length)) % color.styles.length;
			var style = color.styles[styleIdx];
			ctx.fillStyle = style;
			ctx.fillRect(
				x * BLOCK_SIZE, y * BLOCK_SIZE,
				BLOCK_SIZE, BLOCK_SIZE
			);
		}
	}
};

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
		xCoord -= 2;
	}
	if (keyMap[38]) {
		yCoord -= 2;
	}
	if (keyMap[39]) {
		xCoord += 2;
	}
	if (keyMap[40]) {
		yCoord += 2;
	}

	if (keyMap[65]) {
		COORDS_PER_GRID -= 1;
	}

	if (keyMap[90]) {
		COORDS_PER_GRID += 1;
	}

	xCoord = Math.min(Math.max(0, xCoord), GRID_SIZE * COORDS_PER_GRID);
	yCoord = Math.min(Math.max(0, yCoord), GRID_SIZE * COORDS_PER_GRID);

	drawNoise();

	requestAnimationFrame(animate);
};

animate();

document.onkeydown = function keydown(e) {
	var code = e.keyCode;
	keyMap[code] = true;

	console.debug(code);
};

document.onkeyup = function keyup(e) {
	var code = e.keyCode;
	keyMap[code] = false;
};
