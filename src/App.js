import { useEffect, useRef, useState } from "react";
import PasteArea from "./components/PasteArea";
import FinalResultComponent from "./components/FinalResultsComponent";
import renderImage from "./imageManipulation";
import ImageSelection from "./components/ImageSelection";

const LINE_TRANSPARENCY = 0.25;
const SCREEN_SIZE = 1000;

const worker = new Worker(new URL("./worker.js", import.meta.url));

function App() {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [stepsPasteArea, setStepsPasteArea] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);
	const [numberOfPoints, setNumberOfPoints] = useState(250);
	const [numberOfThreads, setNumberOfThreads] = useState(4000);
	const [steps, setSteps] = useState();
	const [loading, setLoading] = useState(false);

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
				const defaultSelectionValues = { zoom: 1, x: 50, y: 50 };
				setImageFile(imageFile);
				renderImage(imageFile, canvasRef, contextRef, defaultSelectionValues);
			};
			imageFile.src = e.target.result;
		};
		reader.readAsDataURL(file);
	};

	const generateArt = async () => {
		const image = contextRef.current.getImageData(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);

		const imageData = image.data;
		const screenSize = SCREEN_SIZE;
		const lineTranparency = LINE_TRANSPARENCY;

		setLoading(true);
		worker.postMessage({
			imageData,
			numberOfThreads,
			numberOfPoints,
			screenSize,
			lineTranparency,
		});
		worker.onmessage = (e) => {
			setSteps(e.data);
			setLoading(false);
		};
		return;
	};

	const handlePointsChange = (e) => {
		setNumberOfPoints(e.target.value);
	};
	const handleThreadsChange = (e) => {
		setNumberOfThreads(e.target.value);
	};
	const errorHandler = () => {
		setErrorMessage(
			"The step by step you put in has some problem. Please try again"
		);
		setTimeout(() => {
			setErrorMessage(null);
		}, 4000);
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
					If you already have a step by step process you can click in "Use
					generated steps" and copy your steps to see the results<br></br>
					<strong>Note:</strong> For best results use close up high contrast
					pictures. <br></br>
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
							setStepsPasteArea(true);
							setImageFile(null);
						}}
					>
						Use generated steps
					</button>
				</div>
			</div>
			{stepsPasteArea && !imageFile && (
				<PasteArea
					setSteps={setSteps}
					setStepsPasteArea={setStepsPasteArea}
				></PasteArea>
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
				<ImageSelection
					image={imageFile}
					context={contextRef}
					canvas={canvasRef}
					generateFunction={generateArt}
					loading={loading}
				></ImageSelection>
			)}

			{steps && (
				<FinalResultComponent
					steps={steps}
					numberOfPoints={numberOfPoints}
					errorHandler={errorHandler}
				></FinalResultComponent>
			)}
			{errorMessage && (
				<div className="bg-red-100 border border-red-200 rounded-md w-4/5 max-w-md p-4 shadow-lg z-10 -translate-x-1/2 fixed top-5 left-1/2 text-red-500 font-semibold text-center">
					<p>{errorMessage}</p>
				</div>
			)}
		</div>
	);
}

export default App;
