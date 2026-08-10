const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Nuero\\.gemini\\antigravity-ide\\brain\\1a3f327b-8844-448e-830c-dda86c5695fe\\.system_generated\\steps\\358\\output.txt', 'utf8');
const data = JSON.parse(content);
fs.writeFileSync('frontend/src/types/database.types.ts', data.types);
console.log('Successfully updated database.types.ts');
