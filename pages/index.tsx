import Head from "../node_modules/next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Diplomski</title>
        <meta name="description" content="Graduation project at ETF" />
      </Head>
      <main
        style={{
          height: "95vh",
          width: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        <div>
          <div>
            <input
              type="text"
              placeholder="Potreban/no mi je "
              id="basicSearch"
            />
          </div>
          <div>TREBA MI:</div>
        </div>
        <div className="probaWrapper">
          <div className="proba">p1</div>
          <div className="proba">p2</div>
        </div>
      </main>
    </div>
  );
}
