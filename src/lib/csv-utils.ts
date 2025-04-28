export type MetaData = {
  url: string;
  metaTitle: string;
  metaDescription: string;
};

/**
 * Converts an array of objects into a CSV string.
 * @param data Array of MetaData objects.
 * @param columns Optional headers for the CSV file.
 * @returns A string in CSV format.
 */
function convertToCSV(data: MetaData[], columns: string[] = ['URL', 'Meta Title', 'Meta Description']): string {
  if (!data || data.length === 0) {
    return '';
  }

  const columnDelimiter = ',';
  const lineDelimiter = '\n';

  // Add header row
  let result = columns.join(columnDelimiter);
  result += lineDelimiter;

  // Add data rows
  data.forEach(item => {
    const values = [
      `"${item.url.replace(/"/g, '""')}"`, // Escape double quotes
      `"${item.metaTitle.replace(/"/g, '""')}"`,
      `"${item.metaDescription.replace(/"/g, '""')}"`,
    ];
    result += values.join(columnDelimiter);
    result += lineDelimiter;
  });

  return result;
}

/**
 * Triggers a browser download for the given CSV data.
 * @param csvData The CSV data string.
 * @param filename The desired filename for the downloaded file.
 */
export function downloadCSV(csvData: string, filename: string = 'metagenius_export.csv') {
  if (!csvData) return;

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) { // Feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up URL object
  } else {
    // Fallback for older browsers (e.g., IE)
    if (navigator && (navigator as any).msSaveBlob) {
      (navigator as any).msSaveBlob(blob, filename);
    } else {
      // Generic fallback (might not work everywhere)
      console.error('CSV download not fully supported in this browser.');
      alert('CSV download not fully supported. Please try a different browser.');
    }
  }
}

/**
 * Generates a CSV string from MetaData and initiates download.
 * @param data Array of MetaData objects.
 * @param filename Optional filename for the download.
 */
export function generateAndDownloadCSV(data: MetaData[], filename?: string) {
  const csvString = convertToCSV(data);
  downloadCSV(csvString, filename);
}
