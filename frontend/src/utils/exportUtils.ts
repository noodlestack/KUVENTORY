import * as xlsx from 'xlsx';

export const exportToExcel = <T extends Record<string, any>>(data: T[], filename: string) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  xlsx.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = <T extends Record<string, any>>(data: T[], filename: string) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const csv = xlsx.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
