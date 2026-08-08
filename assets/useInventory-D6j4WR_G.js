import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{i as t}from"./utils-2Y7OFES2.js";import{Bt as n}from"./index-U27M7oeR.js";var r=e(t(),1),i={getInventory:async()=>{try{let{data:e,error:t}=await n.from(`inventory_balances`).select(`
          id,
          quantity,
          location:inventory_locations (id, name),
          item:stock_items (
            id,
            stock_code,
            name,
            category:categories (id, name),
            unit:units_of_measure (code),
            tracking_type,
            minimum_stock_level,
            cost_price,
            selling_price,
            created_at,
            updated_at
          )
        `);if(t)throw t;return(e||[]).map(e=>{let t=e.quantity===0?`Out of Stock`:e.quantity<=(e.item.minimum_stock_level||0)?`Low Stock`:`In Stock`;return{id:e.item.id,itemCode:e.item.stock_code,name:e.item.name,categoryId:e.item.category?.id||``,categoryName:e.item.category?.name||`Uncategorized`,unit:e.item.unit?.code||`pcs`,supplier:`Default Supplier`,beginningStock:0,addedStock:0,totalStock:e.quantity,morningSales:0,afternoonSales:0,endingStock:e.quantity,cost:e.item.cost_price||0,sellingPrice:e.item.selling_price||0,minStockLevel:e.item.minimum_stock_level||0,storageLocation:e.location?.name||`Main Warehouse`,status:t,lastUpdated:e.item.updated_at||new Date().toISOString(),createdAt:e.item.created_at||new Date().toISOString()}})}catch{return[]}},createItem:async(e,t)=>{let{data:r,error:i}=await n.from(`stock_items`).insert({name:e.name,stock_code:e.itemCode,category_id:e.categoryId,tracking_type:`PORTION`,minimum_stock_level:e.minStockLevel,cost_price:e.cost,selling_price:e.sellingPrice}).select(`*, category:categories(id, name), unit:units_of_measure(code)`).single();if(i)throw i;return{id:r.id,itemCode:r.stock_code,name:r.name,categoryId:r.category?.id||``,categoryName:r.category?.name||t,unit:r.unit?.code||e.unit,supplier:e.supplier,beginningStock:0,addedStock:0,totalStock:0,morningSales:0,afternoonSales:0,endingStock:0,cost:r.cost_price,sellingPrice:r.selling_price,minStockLevel:r.minimum_stock_level,storageLocation:e.storageLocation,status:`Out of Stock`,notes:e.notes,lastUpdated:new Date().toISOString(),createdAt:new Date().toISOString()}},updateItem:async(e,t,r)=>{let{data:i,error:a}=await n.from(`stock_items`).update({name:t.name,stock_code:t.itemCode,category_id:t.categoryId,minimum_stock_level:t.minStockLevel,cost_price:t.cost,selling_price:t.sellingPrice}).eq(`id`,e).select(`*, category:categories(id, name), unit:units_of_measure(code)`).single();if(a)throw a;return{id:i.id,itemCode:i.stock_code,name:i.name,categoryId:i.category?.id||``,categoryName:i.category?.name||r,unit:i.unit?.code||t.unit,supplier:t.supplier,beginningStock:0,addedStock:0,totalStock:0,morningSales:0,afternoonSales:0,endingStock:0,cost:i.cost_price,sellingPrice:i.selling_price,minStockLevel:i.minimum_stock_level,storageLocation:t.storageLocation,status:`In Stock`,notes:t.notes,lastUpdated:new Date().toISOString(),createdAt:i.created_at||new Date().toISOString()}},getMovements:async()=>{try{let{data:e,error:t}=await n.from(`stock_movements`).select(`
          id,
          movement_type,
          quantity,
          reference_id,
          notes,
          created_at,
          item:stock_items (id, name, stock_code),
          user:profiles (full_name)
        `).order(`created_at`,{ascending:!1});if(t)throw t;return(e||[]).map(e=>({id:e.id,referenceNo:e.reference_id||`-`,itemId:e.item?.id||``,itemName:e.item?.name||`Unknown`,itemCode:e.item?.stock_code||`Unknown`,type:e.movement_type===`IN`?`Stock In`:e.movement_type===`OUT`?`Stock Out`:e.movement_type===`ADJUSTMENT`?`Adjustment`:e.movement_type===`TRANSFER`?`Transfer`:`Stock In`,quantity:e.quantity,performedBy:e.user?.full_name||`System`,remarks:e.notes||``,date:e.created_at}))}catch{return[]}},getAdjustments:async()=>{try{let{data:e,error:t}=await n.from(`stock_movements`).select(`
          id,
          quantity,
          notes,
          created_at,
          item:stock_items (id, name, stock_code),
          user:profiles (full_name)
        `).eq(`movement_type`,`ADJUSTMENT`).order(`created_at`,{ascending:!1});if(t)throw t;return(e||[]).map(e=>({id:e.id,itemId:e.item?.id||``,itemName:e.item?.name||`Unknown`,currentQuantity:0,actualQuantity:e.quantity,difference:e.quantity,reason:e.notes||`Adjustment`,adjustedBy:e.user?.full_name||`System`,remarks:e.notes||``,date:e.created_at}))}catch{return[]}},getHistory:async()=>{try{let{data:e,error:t}=await n.from(`stock_movements`).select(`
          id,
          movement_type,
          quantity,
          notes,
          created_at,
          item:stock_items (id, name, stock_code),
          user:profiles (full_name)
        `).order(`created_at`,{ascending:!1});if(t)throw t;return(e||[]).map(e=>({id:e.id,itemId:e.item?.id||``,itemName:e.item?.name||`Unknown`,action:e.movement_type===`ADJUSTMENT`?`Adjusted`:`Restocked`,performedBy:e.user?.full_name||`System`,details:`${e.quantity>0?`+`:``}${e.quantity} - ${e.notes||``}`,date:e.created_at}))}catch{return[]}},adjustStock:async e=>{let{data:t}=await n.from(`inventory_locations`).select(`id`).limit(1).single();if(!t)throw Error(`No inventory location found to adjust stock against.`);let r=e.actualQuantity,{error:i}=await n.rpc(`inventory_adjust`,{p_stock_item_id:e.itemId,p_location_id:t.id,p_adjustment_type:r>=0?`IN`:`OUT`,p_quantity:Math.abs(r),p_reason:e.reason,p_notes:e.remarks});if(i)throw i;return{id:Math.random().toString(36).substr(2,9),itemId:e.itemId,itemName:`Adjusted Item`,currentQuantity:0,actualQuantity:e.actualQuantity,difference:r,reason:e.reason,adjustedBy:`Current User`,remarks:e.remarks,date:new Date().toISOString()}}};function a(){let[e,t]=(0,r.useState)([]),[n,a]=(0,r.useState)(!0),o=(0,r.useCallback)(async()=>{a(!0);let e=await i.getInventory();t(e),a(!1)},[]);return(0,r.useEffect)(()=>{queueMicrotask(o)},[o]),{items:e,isLoading:n,refresh:o,createItem:async(e,n)=>{let r=await i.createItem(e,n);return t(e=>[...e,r]),r},updateItem:async(e,n,r)=>{let a=await i.updateItem(e,n,r);return t(t=>t.map(t=>t.id===e?a:t)),a}}}export{i as n,a as t};