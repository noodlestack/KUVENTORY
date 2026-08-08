const fs = require('fs');
const files = [
  'src/hooks/inventory/useInventory.ts',
  'src/hooks/categories/useCategories.ts',
  'src/hooks/suppliers/useSuppliers.ts',
  'src/hooks/purchases/usePurchases.ts',
  'src/hooks/sales/useSales.ts',
  'src/hooks/expenses/useExpenses.ts'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let code = fs.readFileSync(f, 'utf8');
    
    // add import toast if not present
    if (!code.includes('import { toast }')) {
      code = 'import { toast } from "sonner";\n' + code;
    }

    // Replace unhandled service calls with try-catch that throws
    code = code.replace(/const (\w+) = async \(([^)]*)\) => \{([\s\S]*?)\n  \};/g, (match, name, args, body) => {
      // Avoid re-wrapping
      if (body.includes('try {')) return match;

      if (name.startsWith('fetch') || name === 'refresh') {
        return `const ${name} = async (${args}) => {\n    try {${body}\n    } catch (error: any) {\n      console.error(error);\n      toast.error(error.message || 'Failed to fetch ${name}');\n      setIsLoading(false);\n    }\n  };`;
      }

      return `const ${name} = async (${args}) => {\n    try {${body}\n    } catch (error: any) {\n      console.error(error);\n      toast.error(error.message || 'Action failed');\n      throw error;\n    }\n  };`;
    });

    fs.writeFileSync(f, code);
  }
});
