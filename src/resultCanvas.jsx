import { useEffect, useRef } from "react";
import { calculateLine, geneatePinCoodinates } from "./algorithm";

const LINE_TRANSPARENCY = 0.25;
const SCREEN_SIZE = 1000;

function putPixel(x, y, data) {
	const index = (y * SCREEN_SIZE + x)*4;
    const dataCopy = data
    //console.log({data, index, x, y})
	dataCopy[index] -= LINE_TRANSPARENCY * 255;
	dataCopy[index + 1] -= LINE_TRANSPARENCY * 255;
	dataCopy[index + 2] -= LINE_TRANSPARENCY * 255;
    return dataCopy
}

export default function ResultCanvas({ steps, points }) {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		contextRef.current = context;
	}, []);

	useEffect(() => {
        //console.log({steps})
        if(steps.length > 0){
            let canvasData = contextRef.current.getImageData(0,0,SCREEN_SIZE, SCREEN_SIZE).data;
            for(let i=0; i< canvasData.length; i++){
                canvasData[i] = 255
            }
            for (let step = 0; step< steps.length-1; step++) {
                // console.log(canvasData)
                canvasData = drawLine(steps[step], steps[step+1],canvasData)
            }
            const newCanvas = new ImageData(
                SCREEN_SIZE,
                SCREEN_SIZE
            );
    
            newCanvas.data.set(canvasData);
            contextRef.current.putImageData(newCanvas, 0, 0);
    

        }
	}, [steps]);

    const drawLine = (point1, point2, data) => {
        const coordinates = geneatePinCoodinates(points, SCREEN_SIZE);
        const x1 = coordinates[point1][0];
        const y1 = coordinates[point1][1];
        const x2 = coordinates[point2][0];
        const y2 = coordinates[point2][1];
        const line = calculateLine(x1, y1, x2, y2);
        let dataCopy = data
        line.forEach(pixel => {
            dataCopy = putPixel(pixel[0], pixel[1], dataCopy)
        })

        return dataCopy
    }

	return (
		<canvas
			id="resultCanvas"
			className="bg-white w-4/5 max-w-2xl aspect-square m-auto my-3"
			ref={canvasRef}
			width={SCREEN_SIZE}
			height={SCREEN_SIZE}
		></canvas>
	);
}
