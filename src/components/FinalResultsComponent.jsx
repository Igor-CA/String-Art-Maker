import { useState } from "react";
import ResultCanvas from "./resultCanvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

export default function FinalResultComponent({
	steps,
	numberOfPoints,
	errorHandler,
}) {
	const [messageVisible, setMessageVisible] = useState(false);

	const handleCopyClick = () => {
		navigator.clipboard.writeText(steps);
		setMessageVisible(true);
		setTimeout(() => {
			setMessageVisible(false);
		}, 3000);
	};
	return (
		<div className="border-solid border-2 border-indigo-60 p-1 rounded-md bg-white shadow-md lg:max-w-screen-md lg:mx-auto">
			<ResultCanvas
				steps={steps}
				points={numberOfPoints}
				errorHandler={errorHandler}
			></ResultCanvas>
			{messageVisible && (
				<div className="bg-green-200 border-green-400 border p-2.5 text-center font-bold text-green-800 shadow-md rounded-md w-fit px-5 fixed z-10 top-2 right-1/2 translate-x-1/2">
					Step by step copied with success
				</div>
			)}
			<p>Step by step process:</p>
			<div className="flex bg-gray-300 items-center px-2 rounded-md">
				<p className="no-scrollbar w-full p-1 h-40 overflow-scroll">
					{steps.join(", ")}
				</p>
				<div
					className="px-2  border rounded-md border-gray-700  aspect-square"
					onClick={handleCopyClick}
				>
					<FontAwesomeIcon icon={faCopy} />
				</div>
			</div>
			<p>
				By copying these numbers you can also save it for later so you won't
				have to generete them again
			</p>
			<p>
				To build your string art you just have to follow the order of the steps
				above so for exemple in the part "
				{`${steps[0]}, ${steps[1]}, ${steps[2]}`}" you start from nail/pin{" "}
				{steps[0]}, pass a line from {steps[0]} to nail/pin {steps[1]} and then
				a line from pin {steps[1]} to pin {steps[2]} and so on
			</p>
		</div>
	);
}
