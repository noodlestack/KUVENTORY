import{n as e}from"./vendor-query-C6UIcZK9.js";import{m as t}from"./utils-CSKJBHYl.js";function n(n){return e({queryKey:[`reports`,`list`,n],queryFn:async()=>{let e=n.limit||20,r=n.offset||0,i=t.from(`daily_inventory`).select(`id, inventory_date, state, finalized_at`,{count:`exact`}).eq(`state`,`FINALIZED`);n.fromDate&&(i=i.gte(`inventory_date`,n.fromDate)),n.toDate&&(i=i.lte(`inventory_date`,n.toDate)),i=i.order(`inventory_date`,{ascending:!1}).range(r,r+e-1);let{data:a,error:o,count:s}=await i;if(o)throw console.error(`Reports fetch error:`,o),o;return{data:(a||[]).map(e=>({id:e.id,inventory_date:e.inventory_date,status:e.state,finalized_at:e.finalized_at,finalized_by_name:`Admin User`})),count:s||0}}})}function r(n){return e({queryKey:[`report`,n],queryFn:async()=>{if(!n)return null;let{data:e,error:r}=await t.from(`daily_inventory`).select(`
          id,
          inventory_date,
          state,
          finalized_at,
          daily_inventory_items (
            id,
            beg,
            add,
            total,
            am,
            pm,
            ending,
            inventory_items (
              id,
              name,
              description,
              unit,
              unit_cost,
              supplier_a,
              supplier_b,
              categories ( name )
            )
          )
        `).eq(`id`,n).single();if(r)throw console.error(`Report view error:`,r),r;let i=(e.daily_inventory_items||[]).map(e=>{let t=(e.inventory_items?.categories?.name||``).toUpperCase(),n=`PORTION STOCK`;return t.includes(`GRILL`)?n=`GRILLED STOCK`:t.includes(`CASE`)&&(n=`PER CASES`),{id:e.id,section:n,beginning_qty:Number(e.beg||0),add_qty:Number(e.add||0),total_stock:Number(e.total??Number(e.beg||0)+Number(e.add||0)),sales_am:Number(e.am||0),sales_pm:Number(e.pm||0),ending_qty:Number(e.ending??0),items:{item_name:e.inventory_items?.name||`Unknown Item`,description:e.inventory_items?.description||``,unit:e.inventory_items?.unit||`pcs`,unit_cost:Number(e.inventory_items?.unit_cost||0),supplier_a:e.inventory_items?.supplier_a||``,supplier_b:e.inventory_items?.supplier_b||``}}});return{id:e.id,inventory_date:e.inventory_date,status:e.state,finalized_at:e.finalized_at,daily_inventory_entries:i}},enabled:!!n})}export{n,r as t};