export function exportToJson(data: any, filename: string) {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `${filename}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function exportToCsv(data: any[], headers: string[], filename: string) {
  // Convert data to CSV format
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header.toLowerCase().replace(/\s+/g, '')] || '';
      // Escape quotes and wrap in quotes if contains comma or quote
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Create CSV string
  const csvString = csvRows.join('\n');
  
  // Create download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
