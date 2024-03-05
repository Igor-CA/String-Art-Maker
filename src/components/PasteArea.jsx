import { useState } from "react";

export default function PasteArea({setSteps, setStepsPasteArea}) {
    const [pasteAreaValue, setPasteAreaValue] = useState(null);
	
    const handlePasteAreaValue = (e) => {
		const values = e.target.value.split(",").map((value) => value.trim());
		setPasteAreaValue(values);
	};
    
	return (
		<div className="bg-white p-3 border border-gray-400 rounded-md my-6 lg:max-w-screen-md lg:mx-auto">
			<p>Insert your already generataed step by step</p>
			<textarea
				className="w-full p-2.5 my-2.5 border-solid border border-gray-400 rounded-md shadow-md"
				onChange={handlePasteAreaValue}
			></textarea>
			<button
				className="bg-blue-400 my-2.5 p-2.5 rounded-md text-white font-semibold inline-block w-full"
				onClick={() => {
					setSteps(pasteAreaValue);
					setStepsPasteArea(false);
				}}
			>
				Generate string art
			</button>
		</div>
	);
}
