import { Supplier, SupplierFormData } from "@/types/suppliers";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}`;

let suppliers: Supplier[] = [
  {
    id: "sup1",
    name: "Global Beans Inc.",
    contactPerson: "Alice Johnson",
    phoneNumber: "+1234567890",
    email: "contact@globalbeans.com",
    address: "123 Coffee Lane, Seattle, WA",
    status: "Active",
    totalPurchases: 5,
    lastPurchaseDate: "2026-06-01T10:00:00Z",
    dateAdded: "2026-01-10T08:00:00Z",
    notes: "Premium supplier for Arabica",
  },
  {
    id: "sup2",
    name: "Local Farms Co.",
    contactPerson: "Bob Smith",
    phoneNumber: "+0987654321",
    email: "sales@localfarms.com",
    address: "456 Dairy Road, Portland, OR",
    status: "Active",
    totalPurchases: 12,
    lastPurchaseDate: "2026-06-15T09:00:00Z",
    dateAdded: "2026-02-15T09:00:00Z",
  },
  {
    id: "sup3",
    name: "Packit Supply",
    contactPerson: "Charlie Davis",
    phoneNumber: "+1122334455",
    email: "info@packitsupply.com",
    address: "789 Box Street, Industry City, CA",
    status: "Inactive",
    totalPurchases: 0,
    dateAdded: "2026-03-20T11:00:00Z",
  }
];

export const mockSupplierService = {
  getSuppliers: async (): Promise<Supplier[]> => {
    await delay(600);
    return [...suppliers];
  },

  createSupplier: async (data: SupplierFormData): Promise<Supplier> => {
    await delay(600);
    const newSupplier: Supplier = {
      id: generateId("sup"),
      ...data,
      totalPurchases: 0,
      dateAdded: new Date().toISOString(),
    };
    suppliers = [...suppliers, newSupplier];
    return newSupplier;
  },

  updateSupplier: async (id: string, data: SupplierFormData): Promise<Supplier> => {
    await delay(600);
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Supplier not found");

    const updatedSupplier = { ...suppliers[index], ...data };
    suppliers = [
      ...suppliers.slice(0, index),
      updatedSupplier,
      ...suppliers.slice(index + 1),
    ];
    return updatedSupplier;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await delay(600);
    suppliers = suppliers.filter(s => s.id !== id);
  }
};
