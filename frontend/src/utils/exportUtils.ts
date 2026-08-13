import * as xlsx from 'xlsx';
import { Sale, SaleItem } from '@/types/sales';

export const exportToExcel = <T extends Record<string, unknown>>(data: T[], filename: string) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  xlsx.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = <T extends Record<string, unknown>>(data: T[], filename: string) => {
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

export const printReceipt = (sale: Sale) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatDate = (dateStr: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
  const formatCurrency = (val: number) => `P${val.toFixed(2)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${sale.transactionNo}</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-sm { font-size: 12px; }
        .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
        .flex { display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
        th, td { text-align: left; padding: 2px 0; }
        .qty { width: 30px; }
        .price { text-align: right; width: 60px; }
      </style>
    </head>
    <body>
      <div class="text-center font-bold" style="font-size: 16px;">KAPEUNO</div>
      <div class="text-center text-sm">Official Receipt</div>
      <div class="divider"></div>
      
      <div class="text-sm">Txn: ${sale.transactionNo}</div>
      <div class="text-sm">Date: ${formatDate(sale.saleDate)}</div>
      <div class="text-sm">Cashier: ${sale.recordedBy}</div>
      <div class="text-sm">Customer: ${sale.customerName || "Walk-in"}</div>
      
      <div class="divider"></div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="qty">Qty</th>
            <th class="price">Amt</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map((item: SaleItem) => `
            <tr>
              <td>${item.itemName}</td>
              <td class="qty">${item.quantity}</td>
              <td class="price">${formatCurrency(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="divider"></div>
      
      <div class="flex text-sm">
        <span>Subtotal:</span>
        <span>${formatCurrency(sale.totalAmount)}</span>
      </div>
      
      ${(sale.discountAmount || 0) > 0 ? `
      <div class="flex text-sm">
        <span>Discount:</span>
        <span>-${formatCurrency(sale.discountAmount || 0)}</span>
      </div>
      ` : ''}
      
      <div class="flex font-bold" style="font-size: 14px; margin-top: 5px;">
        <span>Total:</span>
        <span>${formatCurrency(sale.netAmount)}</span>
      </div>
      
      <div class="divider"></div>
      <div class="text-center text-sm" style="margin-top: 20px;">Thank you for your purchase!</div>
      
      <script>
        window.onload = function() { window.print(); window.close(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
