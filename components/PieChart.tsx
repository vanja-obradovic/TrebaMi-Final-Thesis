import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  TitleOptions,
  FontSpec,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const PieChart = ({ dataset }) => {
  const backgroudColors = [];
  const borderColors = [];

  const generateColors = (dataset) => {
    for (const elem of dataset.data) {
      const base = Math.round(0xffffff * Math.random());
      const r = base >> 16;
      const g = (base >> 8) & 255;
      const b = base & 255;
      backgroudColors.push(`rgba(${r},${g},${b}, 0.75)`);
      borderColors.push(`rgb(${r},${g},${b})`);
    }
  };
  generateColors(dataset);

  const data = {
    // backgroundColor: [
    //   "rgb(2, 88, 255)",
    //   "rgb(249, 151, 0)",
    //   "rgb(255, 199, 0)",
    //   "rgb(32, 214, 152)",
    // ],
    labels: dataset.labels,
    datasets: [
      {
        label: "My First Dataset",
        data: dataset.data,
        backgroundColor: backgroudColors,
        borderColor: borderColors,
        hoverOffset: 4,
      },
    ],
  };

  const font: Partial<FontSpec> = {
    size: 18,
    weight: "300",
    style: "normal",
  };

  const title: Partial<TitleOptions> = {
    align: "center",
    font: font,
    display: true,
    fullSize: true,
    padding: 0,
    text: dataset.title,
  };

  const options = {
    elements: {
      arc: {
        weight: 0.5,
        borderWidth: 3,
      },
    },

    cutout: "70%",
    plugins: {
      title: title,
    },
  };
  return <Doughnut data={data} width={50} height={50} options={options} />;
};

export default PieChart;
