"use client";

import { createCheatsheet } from "@/scripts/compress-pdf";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [rows, setRows] = useState<number>(4);
  const [cols, setCols] = useState<number>(3);
  const [pageRemove, setPageRemove] = useState<string>("");
  return (
    <section className="p-4 flex flex-col items-center justify-center h-screen">
      <h1 className="text-5xl font-bold text-center mb-4">Create Cheatsheet</h1>
      <input
        type="file"
        className="bg-white text-black w-64"
        onChange={(e) => setFile(e.target.files?.[0])}
        accept="application/pdf"
      />
      <p className="my-2">PDF only</p>
      <div className="grid grid-cols-2 gap-2">
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
      <label className="my-2">Remove Page (comma seperated i.e. 1,2,3)</label>
      <input
        value={pageRemove}
        onChange={(e) => setPageRemove(e.target.value)}
        className="bg-white text-black w-64 text-center"
      />
      <button
        className="mt-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 transition-colors font-semibold disabled:bg-gray-500"
        disabled={!file}
        onClick={async () => {
          if (file) {
            const pdf = await createCheatsheet(
              file,
              cols,
              rows,
              pageRemove
                .split(",")
                .map(Number)
                .filter((num) => !isNaN(num)),
            );
            if (!pdf) {
              return;
            }
            pdf.setTitle(file.name);
            const pdfBytes = await pdf.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const pdfFile = new File(
              [blob],
              "CHEATSHEET_" + file.name + ".pdf",
              {
                type: "application/pdf",
              },
            );
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(pdfFile);
            link.download = "CHEATSHEET_" + file.name;
            link.click();
          }
        }}
      >
        Create
      </button>
    </section>
  );
}
