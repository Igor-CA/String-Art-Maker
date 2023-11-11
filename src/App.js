import { useEffect, useRef } from "react";

function App() {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		contextRef.current = context;
	});



	const handleChange = (event) => {
		
		const file = event.target.files[0];
		const imageType = /image.*/;

		if (!file) return;
		if (!file.type.match(imageType)) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const imageFile = new Image();
			imageFile.onload = function () {
				processImage(imageFile);
			};
			imageFile.src = e.target.result;
		};
		reader.readAsDataURL(file);
	};

	const processImage = (img) => {
		const canvas = canvasRef.current;
		const context = contextRef.current;
		
		canvas.width = img.width;
		canvas.height = img.height;
		context.drawImage(img, 0, 0, img.width, img.height);

		const scannedImage = context.getImageData(
			0,
			0,
			canvas.width,
			canvas.height
		);
		const imageData = scannedImage.data.slice();
		const grayScaleImage = applyGrayScaleFilter (imageData);

		const scannedImageCopy = new ImageData(
			scannedImage.width,
			scannedImage.height
		);
		scannedImageCopy.data.set(grayScaleImage);
		contextRef.current.putImageData(scannedImageCopy, 0, 0);
	}
	const applyGrayScaleFilter  = (imageData) => {
		for (let i = 0; i < imageData.length; i += 4) {
			const grayScale =
				imageData[i] * 0.299 + //Red brightness
				imageData[i + 1] * 0.587 + //Green brightness
				imageData[i + 2] * 0.114; //Blue brightness

			imageData[i] = grayScale;
			imageData[i + 1] = grayScale;
			imageData[i + 2] = grayScale;
		}
		return imageData
	}

	return (
		<div className="App">
			<input
				type="file"
				name="fileInput"
				id="fileInput"
				onChange={handleChange}
			/>
			<canvas
				width="400"
				height="400"
				id="imageCanvas"
				ref={canvasRef}
			></canvas>
		</div>
	);
}

export default App;
