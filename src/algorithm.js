//Variation of Bresenham's Algorithm
export function calculateLine(x1, y1, x2, y2) {
	const incX = Math.sign(x2 - x1);
	const dX = Math.abs(x2 - x1);

	const incY = Math.sign(y2 - y1);
	const dY = Math.abs(y2 - y1);

	const XaY = dX > dY;
	const incD = -2 * Math.abs(dX - dY);
	const incS = 2 * Math.min(dX, dY);
	let cmpt = Math.max(dX, dY);

	let err = incD + cmpt;
	let X = x1;
	let Y = y1;
	const pixelList = [];
	while (cmpt >= 0) {
		pixelList.push([X, Y]);
		cmpt -= 1;

		if (err >= 0 || XaY) {
			X += incX;
		}
		if (err >= 0 || !XaY) {
			Y += incY;
		}
		if (err >= 0) {
			err += incD;
		} else {
			err += incS;
		}
	}

	return pixelList;
}

//Make matrix 4x smaller since only one value is important for each pixel (RGB are equal and all pixels have alpha of same value)
function reduceMatrix(pixelMatrix) {
	const reducedMatrix = [];
	for (let i = 0; i < pixelMatrix.length; i += 4) {
		reducedMatrix.push(pixelMatrix[i]);
	}
	return reducedMatrix;
}

//Turn the matrix into a two dimmensional array instead of one
function simplifyMatrix(pixelMatrix, width, heigh) {
	const simplifiedMatrix = [];
	for (let y = 0; y < heigh; y++) {
		const column = [];
		for (let x = 0; x < width; x++) {
			const index = x * width + y;
			column.push(pixelMatrix[index]);
		}
		simplifiedMatrix.push(column);
	}
	return simplifiedMatrix;
}

function measureBrightness(imageData, line) {
	let lineBrightness = 0;
	for (let pixel of line) {
		const x = pixel[0];
		const y = pixel[1];
		const pixelBrightnes = imageData[x][y];
		lineBrightness += pixelBrightnes;
	}
	const averageBrithness = lineBrightness / line.length;

	return averageBrithness;
}

export function geneatePinCoodinates(numberOfPoints, canvasSize) {
	const center = [canvasSize / 2, canvasSize / 2];
	const coords = [];
	for (let i = 0; i < numberOfPoints; i++) {
		const x = Math.floor(
			center[0] +
				(Math.cos((i * 2 * Math.PI) / numberOfPoints) * (canvasSize - 1)) / 2
		);
		const y = Math.floor(
			center[1] +
				(Math.sin((i * 2 * Math.PI) / numberOfPoints) * (canvasSize - 1)) / 2
		);
		coords.push([x, y]);
	}
	return coords;
}

async function preCalculateLines(numberOfNails, canvasSize) {
	const lines = {};
	const nailsCoords = geneatePinCoodinates(numberOfNails, canvasSize);
	for (let nailOne = 0; nailOne < numberOfNails; nailOne++) {
		for (let nailTwo = nailOne + 1; nailTwo < numberOfNails; nailTwo++) {
			const x1 = nailsCoords[nailOne][0];
			const y1 = nailsCoords[nailOne][1];
			const x2 = nailsCoords[nailTwo][0];
			const y2 = nailsCoords[nailTwo][1];
			const line = calculateLine(x1, y1, x2, y2);

			const key = `${nailOne}-${nailTwo}`;
			lines[key] = line;
			//Work around so UI can get updated so it can run a loading animation
			if (nailTwo % 100 === 0) {
				//Adding a timeout here allow the event queue to run an update on UI 
				await new Promise((resolve) => setTimeout(resolve, 0));
			}
		}
	}
	return lines;
}

//Find the darkest line and the finishing nail of that line from a giving starting nail
function chooseDarkestLine(image, numberOfNails, lines, startingNail) {
	let darkestValue = Infinity;
	let finishingNail = 0;
	for (let secondNail = 0; secondNail < numberOfNails; secondNail++) {
		if (startingNail === secondNail) continue;
		const nailOne = Math.min(startingNail, secondNail);
		const nailTwo = Math.max(startingNail, secondNail);
		const key = `${nailOne}-${nailTwo}`;
		const line = lines[key];
		const lineBrightness = measureBrightness(image, line);

		if (lineBrightness < darkestValue) {
			darkestValue = lineBrightness;
			finishingNail = secondNail;
		}
	}

	const nailOne = Math.min(startingNail, finishingNail);
	const nailTwo = Math.max(startingNail, finishingNail);
	const key = `${nailOne}-${nailTwo}`;

	return [finishingNail, lines[key]];
}

function removeLineFromImage(line, image, lineTranparency) {
	line.forEach((pixel) => {
		const x = pixel[0];
		const y = pixel[1];
		image[x][y] += Math.floor(lineTranparency * 255);
	});
	return image;
}

export default async function generateStringArt(
	imageData,
	numberOfThreads,
	numberOfNails,
	canvasSize,
	lineTranparency
) {
	const reduced = reduceMatrix(imageData);
	const simplified = simplifyMatrix(reduced, canvasSize, canvasSize);
	const lines = await preCalculateLines(numberOfNails, canvasSize);
	const steps = [0];

	let imageCopy = simplified;

	let nail = 0;
	for (let i = 0; i < numberOfThreads; i++) {
		const [nextNail, darkestLine] = chooseDarkestLine(
			imageCopy,
			numberOfNails,
			lines,
			nail
		);
		imageCopy = removeLineFromImage(darkestLine, imageCopy, lineTranparency);
		steps.push(nextNail);
		nail = nextNail;

		//Work around so UI can get updated so it can run a loading animation
		if (i % 10 === 0) {
			//Adding a timeout here allow the event queue to run an update on UI 
			await new Promise((resolve) => setTimeout(resolve, 0));
		}
	}

	return steps;
}
