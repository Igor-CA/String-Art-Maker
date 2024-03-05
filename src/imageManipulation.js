export default function renderImage(img, canvas, context, rangeValues) {
	const croppedImage = cropImage(img, canvas, rangeValues);
	const croppedImageData = croppedImage.data.slice();
	const grayScaleImage = applyGrayScaleFilter(croppedImageData);
	const circularImage = circularCut(grayScaleImage, canvas);

	const scannedImageCopy = new ImageData(
		croppedImage.width,
		croppedImage.height
	);

	scannedImageCopy.data.set(circularImage);
	context.current.putImageData(scannedImageCopy, 0, 0);
}

const cropImage = (img, canvasRef, rangeValues) => {
	const canvas = canvasRef.current;

	const { zoom, x, y } = rangeValues;
	const imageSize = Math.min(img.width, img.height) * zoom;

	const selectedX = (x * (img.width - imageSize)) / 100;
	const selectedY = (y * (img.height - imageSize)) / 100;
	const selectedWidth = imageSize;
	const selectedHeight = imageSize;

	const croppedCanvas = document.createElement("canvas");
	croppedCanvas.width = canvas.width;
	croppedCanvas.height = canvas.height;
	const croppedContext = croppedCanvas.getContext("2d");
	croppedContext.drawImage(
		img,
		selectedX,
		selectedY,
		selectedWidth,
		selectedHeight,
		0,
		0,
		canvas.width,
		canvas.height
	);

	return croppedContext.getImageData(0, 0, canvas.width, canvas.height);
};

const applyGrayScaleFilter = (imageData) => {
	for (let i = 0; i < imageData.length; i += 4) {
		const grayScale =
			imageData[i] * 0.299 + //Red brightness
			imageData[i + 1] * 0.587 + //Green brightness
			imageData[i + 2] * 0.114; //Blue brightness

		imageData[i] = grayScale;
		imageData[i + 1] = grayScale;
		imageData[i + 2] = grayScale;
	}
	return imageData;
};

const circularCut = (imageData, canvasRef) => {
	const width = canvasRef.current.width;
	const height = canvasRef.current.height;
	const centerX = Math.floor(width / 2);
	const centerY = Math.floor(height / 2);
	const radius = width / 2;
	for (let i = 0; i < imageData.length; i += 4) {
		const pixelNumber = i / 4;
		const x = pixelNumber % width;
		const y = Math.floor(pixelNumber / height);
		const distanceCenter = Math.sqrt((centerX - x) ** 2 + (centerY - y) ** 2);
		if (distanceCenter > radius) {
			const alpha = 1 - Math.min(1, distanceCenter - radius);
			imageData[i + 3] = Math.round(alpha * imageData[i + 3]);
		}
	}
	return imageData;
};
