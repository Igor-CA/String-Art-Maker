import generateStringArt from "./algorithm";

onmessage = (e) => {
	const {imageData, numberOfPoints, numberOfThreads, screenSize, lineTranparency} = e.data
	const generatedSteps = generateStringArt(imageData, numberOfThreads, numberOfPoints, screenSize, lineTranparency)
	postMessage(generatedSteps)
};
