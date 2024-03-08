import ResultCanvas from "./resultCanvas";

export default function FinalResultComponent({steps, numberOfPoints, errorHandler}) {
	return (
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
				To build your string art you just have to follow the order of the steps
				above so for exemple in the part "
				{`${steps[0]}, ${steps[1]}, ${steps[2]}`}" you start from nail/pin{" "}
				{steps[0]}, pass a line from {steps[0]} to nail/pin {steps[1]} and then a
				line from pin {steps[1]} to pin {steps[2]} and so on
			</p>
		</div>
	);
}
