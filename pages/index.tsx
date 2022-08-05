import { useEffect, useRef, useState } from "react";
import Head from "next/head";

// setTimeout(() => {
//   document
//     .getElementById("basicSearch")
//     .setAttribute("placeholder", placeholder);
//   i++;
//   if (i >= arr.length) {
//     text.push(text.shift());
//     i = 0;
//     document.getElementById("basicSearch").setAttribute("placeholder", start);
//   }
//   typePlaceholder(start, text);
// }, Math.random() * 200 + 160);
// };

const top100Films = ["abc", "edf", "ghj"];

export default function Home() {
  return (
    <>
      <Head>
        <title>Diplomski</title>
        <meta name="description" content="Graduation project at ETF" />
      </Head>
      {/* <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={top100Films}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Movie" />}
      /> */}
      <div>
        <div className="probaWrapper">
          <div className="proba">p1</div>
          <div className="proba">p2</div>
        </div>
        <div style={{ alignSelf: "center" }}>
          <div>
            <input type="text" id="basicSearch" className="basicSearch" />
          </div>
          <div>TREBA MI:</div>
        </div>
      </div>
    </>
  );
}
