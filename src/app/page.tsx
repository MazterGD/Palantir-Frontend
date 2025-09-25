export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-4xl">Palantir</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center sm:text-left">
          Interactive tool to model asteroid impact scenarios, predict consequences, and evaluate mitigation strategies using NASA and USGS data.
        </p>
      </main>
    </div>
  );
}