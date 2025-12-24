import * as XLSX from "xlsx";
import { buildTree } from "./buildTree";

export function parseExcel(file, setTreeData) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (!rows || rows.length === 0) {
          reject(new Error("Excel file is empty"));
          return;
        }

        const tree = buildTree(rows);
        setTreeData(tree);
        resolve(tree);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });
}
