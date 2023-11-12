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
		setRangeValues((previos) => {
			return { ...previos, [name]: value };
		});
		renderImage(imageFile);
	};
	const renderImage = (img) => {
		const croppedImage = cropImage(img);
		const croppedImageData = croppedImage.data.slice()
		const grayScaleImage = applyGrayScaleFilter(croppedImageData);

		const scannedImageCopy = new ImageData(
			croppedImage.width,
			croppedImage.height
		);

		scannedImageCopy.data.set(grayScaleImage);
		contextRef.current.putImageData(scannedImageCopy, 0, 0);
	};
	const cropImage = (image) => {
		const canvas = canvasRef.current;

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

	return (
		<div className="App">
			<input
				type="file"
				name="fileInput"
				id="fileInput"
				onChange={handleFileInputChange}
			/>
			<canvas
				id="imageCanvas"
				width="400"
				height="400"
				ref={canvasRef}
			></canvas>
			{imageFile && (
				<>
					<label htmlFor="zoom">Zoom</label>
					<input
						type="range"
						min={0.1}
						max={1}
						step={0.01}
						defaultValue={1}
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
