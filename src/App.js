import { useEffect, useRef, useState } from "react";
import generateStringArt from "./algorithm";
import ResultCanvas from "./resultCanvas";

const LINE_TRANSPARENCY = 0.25;
const SCREEN_SIZE = 1000;

function App() {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [rangeValues, setRangeValues] = useState({ zoom: 1, x: 50, y: 50 });
	const [stepsCopyArea, setStepsCopyArea] = useState(false);
	const [copyAreaValue, setCopyAreaValue] = useState(null);
	const [imageFile, setImageFile] = useState(null);
	const [numberOfPoints, setNumberOfPoints] = useState(250);
	const [numberOfThreads, setNumberOfThreads] = useState(4000);
	const [steps, setSteps] = useState();
	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		contextRef.current = context;
	}, []);

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

	const generateArt = async () => {
		const imageData = contextRef.current.getImageData(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);
		const initialTime = new Date();
		const generatedSteps = await generateStringArt(
			imageData.data,
			numberOfThreads,
			numberOfPoints,
			SCREEN_SIZE,
			LINE_TRANSPARENCY
		);
		const finalTime = new Date();
		console.log(`Total time: ${finalTime - initialTime}`);
		console.log(generatedSteps);
		setSteps(generatedSteps);
	};
	const handlePointsChange = (e) => {
		setNumberOfPoints(e.target.value);
	};
	const handleThreadsChange = (e) => {
		setNumberOfThreads(e.target.value);
	};
	const handleCopyAreaValue = (e) => {
		const values = e.target.value.split(",").map((value) => value.trim());
		setCopyAreaValue(values);
	};
	//TODO make new error handler -> show to user that the input value has something wrong
	const errorHandler = () => {
		console.log("Deu problema");
		setSteps(null);
	};
	return (
		<div className="min-h-screen bg-gray-50 p-2">
			<div className=" bg-gray-200 rounded-md p-3 lg:max-w-screen-md lg:mx-auto drop-shadow-md">
				<h1 className="text-lg font-bold drop-shadow-sm">
					String art generator
				</h1>
				<p className="mt-2">
					Select a image to create a string art. <br></br> Select the area of
					the image you want to use and then click "Generate string art"
					<br></br> Wait for generate to complete loading. <br></br>
					<strong>Note:</strong> For best results use close up high contrast
					pictures. <br></br> If you already have a step by step process you can
					click in "Use generated steps" and copy your steps to see the results
				</p>

				<h2 className="font-bold mt-3">Variables that affects the result</h2>
				<div className="flex flex-col md:flex-row">
					<label
						htmlFor="pointsInput"
						title="The amount of points in the image increases resoltion but it takes more time to compute"
					>
						Number of nails:
						<input
							type="number"
							className="m-2.5 p-2.5 rounded-md font-semibold inline-block"
							id="pointsInput"
							name="pointsInput"
							defaultValue={250}
							onChange={(e) => handlePointsChange(e)}
						/>
					</label>
					<label
						htmlFor="numberOfThreads"
						title="Can make images brighter or darker and also give the images more details. With more lines more it takes more time to compute"
					>
						Number of lines:
						<input
							type="number"
							id="numberOfThreads"
							name="numberOfThreads"
							className="m-2.5 p-2.5 rounded-md font-semibold inline-block"
							defaultValue={4000}
							onChange={(e) => handleThreadsChange(e)}
						/>
					</label>
				</div>
				<div className="flex flex-col items-stretch gap-2.5 md:flex-row">
					<label
						htmlFor="fileInput"
						className="bg-blue-400 p-2.5 rounded-md text-white font-semibold inline-block text-center"
					>
						Choose the image to start
					</label>
					<input
						type="file"
						name="fileInput"
						id="fileInput"
						onChange={handleFileInputChange}
						className="hidden"
					/>
					<button
						className="bg-blue-400 p-2.5 rounded-md text-white font-semibold inline-block"
						onClick={() => {
							setStepsCopyArea(true);
							setImageFile(null);
						}}
					>
						Use generated steps
					</button>
				</div>
			</div>
			{stepsCopyArea && !imageFile && (
				<div className="bg-white p-3 border border-gray-400 rounded-md my-6 lg:max-w-screen-md lg:mx-auto">
					<p>Insert your already generataed step by step</p>
					<textarea
						className="w-full p-2.5 my-2.5 border-solid border border-gray-400 rounded-md shadow-md"
						onChange={handleCopyAreaValue}
					></textarea>
					<button
						className="bg-blue-400 my-2.5 p-2.5 rounded-md text-white font-semibold inline-block w-full"
						onClick={() => {
							setSteps(copyAreaValue);
							setStepsCopyArea(false)
						}}
					>
						Generate string art
					</button>
				</div>
			)}
			<canvas
				id="imageCanvas"
				className={`bg-gray-50 w-4/5 max-w-2xl aspect-square m-auto my-3 ${
					imageFile ? "" : "hidden"
				}`}
				ref={canvasRef}
				width={SCREEN_SIZE}
				height={SCREEN_SIZE}
			></canvas>

			{imageFile && (
				<div className="bg-gray-50 m-2 p-3 lg:max-w-screen-md lg:mx-auto flex flex-col items-stretch">
					<div className="flex justify-evenly">
						<label htmlFor="zoom">
							Zoom
							<input
								type="range"
								min={0}
								max={0.9}
								step={0.01}
								defaultValue={0}
								name="zoom"
								onChange={handleRadioInputChange}
							/>
						</label>
						<label htmlFor="x">
							X
							<input
								type="range"
								min={0}
								max={100}
								defaultValue={50}
								name="x"
								onChange={handleRadioInputChange}
							/>
						</label>
						<label htmlFor="y">
							Y
							<input
								type="range"
								min={0}
								max={100}
								defaultValue={50}
								name="y"
								onChange={handleRadioInputChange}
							/>
						</label>
					</div>

					<button
						className="bg-blue-400 my-2.5 p-2.5 rounded-md text-white font-semibold inline-block"
						onClick={generateArt}
					>
						Generate string art
					</button>
				</div>
			)}
			{steps && (
				<div className="border-solid border-2 border-indigo-60 p-1 rounded-md bg-white shadow-md lg:max-w-screen-md lg:mx-auto">
					<ResultCanvas
						steps={steps}
						points={numberOfPoints}
						errorHandler={errorHandler}
					></ResultCanvas>
					<p>Step by step process:</p>
					<p className="w-full bg-gray-300 p-1 rounded-md h-40 overflow-scroll">
						{steps.join(", ")}
					</p>
					<p>
						By copying these numbers you can also save it for later so you won't
						have to generete them again
					</p>
					<p>
						To build your string art you just have to follow the order of the
						steps above so for exemple in the part "
						{`${steps[0]}, ${steps[1]}, ${steps[2]}`}" you start from nail/pin{" "}
						{steps[0]}, pass a line from {steps[0]} to steps {steps[1]} and then
						a line from pin {steps[1]} to pin {steps[2]} and so on
					</p>
				</div>
			)}
		</div>
	);
}

export default App;
