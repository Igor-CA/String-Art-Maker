
//Variation of Bresenham's Algorithm
function calculateLine(x1, y1, x2, y2) {
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
	const pixelList = []
	while (cmpt >= 0) { 
		pixelList.push([X,Y])
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
	return reducedMatrix
}

//Turn the matrix into a two dimmensional array instead of one 
function simplifyMatrix(pixelMatrix, width, heigh){
	const simplifiedMatrix = [];
	let column = [];
	for (let y = 0; y < heigh; y++) {
		for (let x = 0; x < width; x++) {
			const index = x * width + y;
			column.push(pixelMatrix[index]);
		}
		simplifiedMatrix.push(column);
		column = [];
	}
	return simplifiedMatrix;

}

function measureBrightness(imageData, line) {
	const imageLine = [];
	for (let pixel of line) {
		const x = pixel[0];
		const y = pixel[1];
		const imagePixel = imageData[x][y];
		imageLine.push(imagePixel);
	}
	const brightness = imageLine.reduce((a, b) => a + b)/imageLine.length;

	return brightness;
}

function geneatePinCoodinates(numberOfPoints, canvasSize){
	const center = [canvasSize / 2, canvasSize / 2];
	const coords = [];
	for (let i = 0; i < numberOfPoints; i++) {
		const x =
			Math.floor((center[0] + (Math.cos((i * 2 * Math.PI) / numberOfPoints) * (canvasSize-1)) / 2))
		const y =
			Math.floor((center[1] + (Math.sin((i * 2 * Math.PI) / numberOfPoints) * (canvasSize-1)) / 2))
		coords.push([x, y]);
	}
	return coords;
}


export default function generateStringArt(imageData, numberOfThreads, numberOfNails, canvasSize, lineTranparency){
	const reduced = reduceMatrix(imageData)
	const simplified = simplifyMatrix(reduced, canvasSize, canvasSize)
	const imageCopy = simplified
	const steps = [0]
	const nailsCoords = geneatePinCoodinates(numberOfNails, canvasSize)
	let nail = 0
	for(let i=0; i<numberOfThreads; i++){
		let darkestValue = Infinity
		let nextNail = 0
		for(let secondNail = 0; secondNail<numberOfNails; secondNail++){
			if (nail === secondNail) continue
			const x1 = nailsCoords[nail][0]
			const y1 = nailsCoords[nail][1]
			const x2 = nailsCoords[secondNail][0]
			const y2 = nailsCoords[secondNail][1]
			const line = calculateLine(x1,y1,x2,y2)
			const lineBrightness = measureBrightness(imageCopy, line)
			
			if(lineBrightness < darkestValue){
				darkestValue = lineBrightness
				nextNail = secondNail
			}
		}
		
		
		const x1 = nailsCoords[nail][0]
		const y1 = nailsCoords[nail][1]
		const x2 = nailsCoords[nextNail][0]
		const y2 = nailsCoords[nextNail][1]	
		const removedLine = calculateLine(x1,y1,x2,y2)
		removedLine.forEach(pixel => {
			const x = pixel[0]
			const y = pixel[1]
			imageCopy[x][y] += Math.floor(lineTranparency * 255)
		})
		


		steps.push(nextNail)
		nail = nextNail

	}

	return steps
}