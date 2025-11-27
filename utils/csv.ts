export const parseCSV = (content: string): string[][] => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');
  // A very basic CSV splitter that handles quoted fields crudely but effectively for standard bank exports
  return lines.map((line) => {
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
};
