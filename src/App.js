import { useEffect, useRef, useState } from "react";

function App() {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [rangeValues, setRangeValues] = useState({ zoom: 1, x: 50, y: 50 });
	const [imageFile, setImageFile] = useState(null);
	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		contextRef.current = context;
	});

	const handleFileInputChange = (event) => {
		const file = event.target.files[0];
		const imageType = /image.*/;

		if (!file) return;
		if (!file.type.match(imageType)) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const imageFile = new Image();
			imageFile.onload = function () {
				setImageFile(imageFile);
				renderImage(imageFile);
			};
			imageFile.src = e.target.result;
		};
		reader.readAsDataURL(file);
	};

	const handleRadioInputChange = (e) => {
		const { name, value } = e.target;
		const invertedValue = 1 - parseFloat(value);
		setRangeValues((previos) => {
			return { ...previos, [name]: name === "zoom" ? invertedValue : value };
		});
		renderImage(imageFile);
	};
	const renderImage = (img) => {
		const croppedImage = cropImage(img);
		const croppedImageData = croppedImage.data.slice();
		const grayScaleImage = applyGrayScaleFilter(croppedImageData);
		const circularImage = circularCut(grayScaleImage);

		const scannedImageCopy = new ImageData(
			croppedImage.width,
			croppedImage.height
		);

		scannedImageCopy.data.set(circularImage);
		contextRef.current.putImageData(scannedImageCopy, 0, 0);
	};
	const cropImage = (image) => {
		const canvas = canvasRef.current;
		const maxWidth = 672;
    	const width = Math.min(0.8 * window.innerWidth, maxWidth);
		canvas.height = canvas.width = width

		const { zoom, x, y } = rangeValues;
		const imageSize = Math.min(image.width, image.height) * zoom;

		const selectedX = (x * (image.width - imageSize)) / 100;
		const selectedY = (y * (image.height - imageSize)) / 100;
		const selectedWidth = imageSize;
		const selectedHeight = imageSize;

		const croppedCanvas = document.createElement("canvas");
		croppedCanvas.width = canvas.width;
		croppedCanvas.height = canvas.height;
		const croppedContext = croppedCanvas.getContext("2d");
		croppedContext.drawImage(
			image,
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
	const circularCut = (imageData) => {
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

	return (
		<div className="bg-gray-100 min-h-screen">
			<label htmlFor="fileInput" className="bg-blue-400 m-2.5 p-2.5 rounded-md text-white font-semibold inline-block">Escolha o arquivo</label>
			<input
				type="file"
				name="fileInput"
				id="fileInput"
				onChange={handleFileInputChange}
				className="hidden"
			/>
			<canvas
				id="imageCanvas"
				className="w-4/5 max-w-2xl aspect-square m-auto my-3"
				ref={canvasRef}
			></canvas>
			{imageFile && (
				<>
					<label htmlFor="zoom">Zoom</label>
					<input
						type="range"
						min={0}
						max={0.9}
						step={0.01}
						defaultValue={0}
						name="zoom"
						onChange={handleRadioInputChange}
					/>
					<label htmlFor="x">X</label>
					<input
						type="range"
						min={0}
						max={100}
						defaultValue={50}
						name="x"
						onChange={handleRadioInputChange}
					/>
					<label htmlFor="y"></label>Y
					<input
						type="range"
						min={0}
						max={100}
						defaultValue={50}
						name="y"
						onChange={handleRadioInputChange}
					/>
				</>
			)}
		</div>
	);
}

export default App;
