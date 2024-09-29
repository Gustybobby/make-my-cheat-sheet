"use client";

import { createCheatsheet } from "@/scripts/compress-pdf";
import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<number>(4);
  const [cols, setCols] = useState<number>(3);
  const [pageRemoves, setPageRemoves] = useState<string[]>([]);
  return (
    <section className="p-4 flex flex-col items-center justify-center h-screen">
      <h1 className="text-5xl font-bold text-center mb-4">Create Cheatsheet</h1>
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
          setPageRemoves((pageRemoves) => [...pageRemoves, ""]);
        }}
        accept="application/pdf"
      />
      <ul className="my-2 space-y-1 text-left">
        {files?.map((file, idx) => (
          <li key={idx}>
            <div className="font-semibold">
              {idx + 1}. {file.name}
            </div>
            <div className="flex flex-col items-center">
              <label className="my-2">
                Remove Page (comma seperated i.e. 1,2,3)
              </label>
              <input
                value={pageRemoves[idx]}
                onChange={(e) =>
                  setPageRemoves((pageRemoves) => {
                    const newRem = [...pageRemoves];
                    newRem[idx] = e.target.value;
                    return newRem;
                  })
                }
                className="bg-white text-black w-64 text-center"
              />
            </div>
          </li>
        ))}
      </ul>
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
      <button
        className="mt-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-500 transition-colors font-semibold disabled:bg-gray-500"
        disabled={!files?.length}
        onClick={async () => {
          if (files?.length) {
            const pdf = await createCheatsheet(
              files,
              cols,
              rows,
              pageRemoves.map((pageRemove) =>
                pageRemove
                  .split(",")
                  .map(Number)
                  .filter((num) => !isNaN(num)),
              ),
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
