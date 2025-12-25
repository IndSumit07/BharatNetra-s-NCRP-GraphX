import * as XLSX from "xlsx";
import { buildTree } from "./buildTree";

export function parseExcel(file, setTreeData) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "array" });

        console.log("Workbook Sheets:", workbook.SheetNames);

        if (!workbook.SheetNames.length) {
          reject(new Error("No sheets found in file"));
          return;
        }

        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        console.log(`Parsed ${rows.length} rows from sheet "${firstSheetName}"`);

        if (!rows || rows.length === 0) {
          reject(new Error("File detected as empty (no rows parsed)"));
          return;
        }

        const tree = buildTree(rows);
        setTreeData(tree);
        resolve(tree);
      } catch (error) {
        console.error("Detailed parsing error:", error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}
