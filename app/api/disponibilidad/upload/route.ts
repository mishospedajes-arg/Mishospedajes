import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { updateAvailabilityFromExcel } from '@/lib/data';

// Helper to convert Excel serial date to JS Date, ensuring timezone neutrality.
const excelDateToJSDate = (serial: number) => {
  // Excel's epoch starts on 1900-01-01, but it incorrectly thinks 1900 was a leap year.
  // JavaScript's epoch is 1970-01-01. The difference is 25569 days (70 years + 17 leap days + the incorrect leap day).
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
  
  // The result is a clean UTC date, representing the exact date from the Excel sheet.
  return jsDate;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No se ha subido ningún archivo.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData: unknown[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: true });

    // Se omiten las dos primeras filas para corregir el desfase.
    // La fila de IDs ahora estará en el índice 0, y las fechas comenzarán en el índice 1.
    const jsonData = rawData.slice(2);

    if (jsonData.length < 2) { // Se necesitan al menos la fila de IDs y una fila de fecha.
      return NextResponse.json({ message: 'El archivo Excel no tiene el formato esperado (faltan filas de datos).' }, { status: 400 });
    }

    const headerRow = jsonData[0];
    if (!Array.isArray(headerRow)) {
      return NextResponse.json({ message: 'La fila de cabecera (IDs) no es válida.' }, { status: 400 });
    }
    const mapNodeIds: string[] = headerRow.slice(1).filter(Boolean).map(String); // IDs están en la 1ra fila del nuevo array

    const availabilityData: { map_node_id: string; start_date: Date; end_date: Date }[] = [];

    mapNodeIds.forEach((mapNodeId, colIndex) => {
      if (!mapNodeId) return; // Saltar columnas sin ID

      let startDate: Date | null = null;

      // El bucle ahora comienza en 1, que es la primera fila de fechas.
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!Array.isArray(row)) continue; // Saltar filas que no son arrays

        const dateValue = row[0];
        const cellValue = row[colIndex + 1];
        const isUnavailable = cellValue !== null && cellValue !== undefined && String(cellValue).trim().toUpperCase() === 'X';

        if (typeof dateValue !== 'number') continue; // Saltar filas sin fecha válida

        const currentDate = excelDateToJSDate(dateValue);
        console.log(`[UPLOAD] Fecha procesada desde Excel (UTC): ${currentDate.toISOString()}`);

        if (isUnavailable) {
          if (!startDate) {
            startDate = currentDate; // Inicia un nuevo rango de no disponibilidad
          }
        } else {
          if (startDate) {
            // Termina el rango actual y lo guarda. La fecha de fin es el primer día de disponibilidad.
            const endDate = new Date(currentDate.getTime());
            availabilityData.push({
              map_node_id: String(mapNodeId),
              start_date: startDate,
              end_date: endDate,
            });
            startDate = null; // Resetea para el próximo rango
          }
        }
      }

      // Si el archivo termina con un rango no disponible, hay que guardarlo
      if (startDate) {
        const lastDateValue = jsonData[jsonData.length - 1][0];
        if (typeof lastDateValue === 'number') {
          // La fecha de fin debe ser el día siguiente al último día no disponible.
          const lastUnavailableDate = excelDateToJSDate(lastDateValue);
          const endDate = new Date(lastUnavailableDate.getTime());
          endDate.setDate(endDate.getDate() + 1);

          availabilityData.push({
            map_node_id: String(mapNodeId),
            start_date: startDate,
            end_date: endDate,
          });
        }
      }
    });
    
    await updateAvailabilityFromExcel(availabilityData);

    return NextResponse.json({ message: 'Disponibilidad actualizada correctamente.' });

  } catch (error) {
    console.error('Error al procesar la subida del archivo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error interno del servidor.', error: errorMessage }, { status: 500 });
  }
}
