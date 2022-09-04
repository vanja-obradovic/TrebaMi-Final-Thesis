import React from "react";
import PieChart from "../components/PieChart";

const test = () => {
  return (
    <PieChart
      dataset={{
        labels: ["prvi", "drugi", "treci"],
        data: [10, 15, 20],
        title: "Hello2",
      }}
    ></PieChart>
  );
};

export default test;
