"use client";

import { useState } from "react";
import { createCheatsheet } from "@/scripts/compress-pdf";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<number>(4);
  const [cols, setCols] = useState<number>(3);
  const [pageMods, setPageMods] = useState<string[]>([]);
  const [modRemoves, setModRemoves] = useState<boolean[]>([]);

  return (
    <section className="p-4 flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
      <h1 className="text-5xl font-extrabold text-center mb-4">
        Create Cheatsheet
      </h1>
      <p className="mb-2">PDF only</p>
      <input
        value={undefined}
        type="file"
        className="bg-white text-black w-64"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) {
            return files;
          }
          setFiles((files) => [...files, file]);
          setPageMods((pageMods) => [...pageMods, ""]);
          setModRemoves((modRemoves) => [...modRemoves, true]);
        }}
        accept="application/pdf"
      />
      <ul className="my-2 text-left">
        {files?.map((file, idx) => (
          <li key={idx} className="border border-white p-4">
            <div className="font-semibold text-white">
              {idx + 1}. {file.name}
            </div>
            <div className="flex flex-col items-center">
              <button
                className={
                  "my-2 p-2 rounded-lg font-semibold transition-colors " +
                  (modRemoves[idx]
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-green-600 hover:bg-green-500")
                }
                onClick={() =>
                  setModRemoves((modRemoves) => {
                    const newModRemoves = [...modRemoves];
                    newModRemoves[idx] = !newModRemoves[idx];
                    return newModRemoves;
                  })
                }
              >
                {modRemoves[idx] ? "Remove Mode" : "Select Mode"}
              </button>
              <label className="mb-2">
                {modRemoves[idx] ? "Remove" : "Select"} Page (comma seperated
                i.e. 1,2,3)
              </label>
              <input
                value={pageMods[idx]}
                onChange={(e) =>
                  setPageMods((pageMods) => {
                    const newMods = [...pageMods];
                    newMods[idx] = e.target.value;
                    return newMods;
                  })
                }
                className="bg-white text-black w-64 text-center"
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <label>Rows</label>
        <input
          value={rows}
          onChange={(e) =>
            isNaN(Number(e.target.value))
              ? undefined
              : setRows(Number(e.target.value))
          }
          className="bg-white text-black w-16 text-center"
        />
        <label>Cols</label>
        <input
          value={cols}
          onChange={(e) =>
            isNaN(Number(e.target.value))
              ? undefined
              : setCols(Number(e.target.value))
          }
          className="bg-white text-black w-16 text-center"
        />
      </div>
      <button
        className="mt-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 transition-colors font-semibold disabled:bg-gray-500"
        disabled={!files?.length}
        onClick={async () => {
          if (files?.length) {
            const pdf = await createCheatsheet(
              files,
              cols,
              rows,
              pageMods.map((pageMod) =>
                pageMod
                  .split(",")
                  .map(Number)
                  .filter((num) => !isNaN(num)),
              ),
              modRemoves,
            );
            if (!pdf) {
              return;
            }
            const title = "CHEAT_SHEET_" + Date.now();
            pdf.setTitle(title);
            const pdfBytes = await pdf.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const pdfFile = new File([blob], title + ".pdf", {
              type: "application/pdf",
            });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(pdfFile);
            link.download = title;
            link.click();
          }
        }}
      >
        Create
      </button>
    </section>
  );
}
