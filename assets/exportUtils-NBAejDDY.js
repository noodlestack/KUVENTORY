import{t as e}from"./xlsx-CWc7jGiH.js";var t=(t,n)=>{let r=e.json_to_sheet(t),i=e.sheet_to_csv(r),a=new Blob([i],{type:`text/csv;charset=utf-8;`}),o=document.createElement(`a`),s=URL.createObjectURL(a);o.setAttribute(`href`,s),o.setAttribute(`download`,`${n}.csv`),o.style.visibility=`hidden`,document.body.appendChild(o),o.click(),document.body.removeChild(o)},n=e=>{let t=window.open(``,`_blank`);if(!t)return;let n=e=>new Intl.DateTimeFormat(`en-US`,{dateStyle:`medium`,timeStyle:`short`}).format(new Date(e)),r=e=>`P${e.toFixed(2)}`,i=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${e.transactionNo}</title>
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
      
      <div class="text-sm">Txn: ${e.transactionNo}</div>
      <div class="text-sm">Date: ${n(e.saleDate)}</div>
      <div class="text-sm">Cashier: ${e.recordedBy}</div>
      <div class="text-sm">Customer: ${e.customerName||`Walk-in`}</div>
      
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
          ${e.items.map(e=>`
            <tr>
              <td>${e.itemName}</td>
              <td class="qty">${e.quantity}</td>
              <td class="price">${r(e.subtotal)}</td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
      
      <div class="divider"></div>
      
      <div class="flex text-sm">
        <span>Subtotal:</span>
        <span>${r(e.totalAmount)}</span>
      </div>
      
      ${(e.discountAmount||0)>0?`
      <div class="flex text-sm">
        <span>Discount:</span>
        <span>-${r(e.discountAmount||0)}</span>
      </div>
      `:``}
      
      <div class="flex font-bold" style="font-size: 14px; margin-top: 5px;">
        <span>Total:</span>
        <span>${r(e.netAmount)}</span>
      </div>
      
      <div class="divider"></div>
      <div class="text-center text-sm" style="margin-top: 20px;">Thank you for your purchase!</div>
      
      <script>
        window.onload = function() { window.print(); window.close(); }
      <\/script>
    </body>
    </html>
  `;t.document.write(i),t.document.close()};export{n,t};