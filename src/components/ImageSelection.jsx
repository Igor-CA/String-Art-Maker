import { useState } from "react";
import renderImage from "../imageManipulation";

export default function ImageSelection({image, canvas, context, generateFunction}) {
	const [rangeValues, setRangeValues] = useState({ zoom: 1, x: 50, y: 50 });

	const handleRadioInputChange = (e) => {
		const { name, value } = e.target;
		const invertedValue = 1 - parseFloat(value);
		setRangeValues((previos) => {
			return { ...previos, [name]: name === "zoom" ? invertedValue : value };
		});
		renderImage(image, canvas, context, rangeValues);
	};

	return (
		<div className="bg-gray-50 m-2 p-3 lg:max-w-screen-md lg:mx-auto flex flex-col items-stretch">
			<div className="flex justify-evenly flex-wrap">
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
				onClick={generateFunction}
			>
				Generate string art
			</button>
		</div>
	);
}
