/**
 * ======================================================
 * ARCHIVO: TableMap.jsx
 * UBICACIÓN: menu-qr-system/admin-panel/src/components/TableMap.jsx
 * FASE: F4
 * VERSIÓN: 1.0
 * ÚLTIMA ACTUALIZACIÓN: 2024-01-16 21:45
 *
 * 🎯 PROPÓSITO:
 * Componente de mapa visual interactivo para la gestión
 * de mesas. Permite arrastrar mesas para reposicionarlas,
 * seleccionarlas y mostrar su estado actual.
 *
 * 📦 DEPENDENCIAS:
 * - react: Librería UI
 * - react-konva: Canvas interactivo
 * - konva: Motor de canvas
 * - ../services/api: Llamadas a API
 *
 * 🔗 RELACIONES:
 * - Importado por: TablesPage.jsx
 *
 * 📋 HISTORIAL DE CAMBIOS:
 * ------------------------------------------------------
 * 1.0 - 2024-01-16 21:45
 *    ✅ Creación inicial del archivo
 *    ✅ Canvas con mesas dibujadas
 *    ✅ Arrastrar y soltar mesas
 *    ✅ Guardar posiciones automático
 *    ✅ Diferentes formas y colores por estado
 *    ✅ Zoom y pan
 * ======================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Rect, Group, Text, Transformer } from 'react-konva';
import toast from 'react-hot-toast';
import api from '../services/api';

const TABLE_STATUS_COLORS = {
  available: '#22c55e',
  occupied: '#ef4444',
  reserved: '#eab308',
  cleaning: '#3b82f6'
};

const TABLE_STATUS_LABELS = {
  available: 'Libre',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  cleaning: 'Limpieza'
};

function TableMap({ tables, branchId, onTablesUpdate }) {
  const [selectedId, setSelectedId] = useState(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  const handleDragEnd = async (e, tableId) => {
    const { x, y } = e.target.position();
    
    // Actualizar posición localmente
    const updatedTables = tables.map(table =>
      table.id === tableId
        ? { ...table, position_x: Math.round(x), position_y: Math.round(y) }
        : table
    );
    
    // Guardar en el servidor
    try {
      await api.put(`/admin/branch/${branchId}/tables/layout`, {
        tables: [{ id: tableId, position_x: Math.round(x), position_y: Math.round(y) }]
      });
      onTablesUpdate();
    } catch (error) {
      toast.error('Error al guardar la posición');
      onTablesUpdate(); // Recargar para revertir
    }
  };

  const getShape = (table) => {
    const color = TABLE_STATUS_COLORS[table.status] || TABLE_STATUS_COLORS.available;
    const x = table.position_x || 0;
    const y = table.position_y || 0;
    const width = table.width || 60;
    const height = table.height || 60;
    const isSelected = selectedId === table.id;
    
    const commonProps = {
      x,
      y,
      fill: color,
      stroke: isSelected ? '#000' : '#fff',
      strokeWidth: isSelected ? 3 : 2,
      draggable: true,
      onDragEnd: (e) => handleDragEnd(e, table.id),
      onClick: () => setSelectedId(table.id),
      onTap: () => setSelectedId(table.id),
    };
    
    const textProps = {
      x: x + width / 2,
      y: y + height / 2 - 10,
      text: table.table_number,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#fff',
      align: 'center',
      offsetX: width / 2,
    };
    
    const statusTextProps = {
      x: x + width / 2,
      y: y + height / 2 + 10,
      text: TABLE_STATUS_LABELS[table.status] || 'Libre',
      fontSize: 10,
      fontFamily: 'Arial',
      fill: '#fff',
      align: 'center',
      offsetX: width / 2,
    };
    
    let shape;
    
    switch (table.shape) {
      case 'circle':
        const radius = width / 2;
        shape = (
          <Circle
            {...commonProps}
            radius={radius}
            x={x + radius}
            y={y + radius}
          />
        );
        textProps.x = x + radius;
        textProps.y = y + radius - 10;
        statusTextProps.x = x + radius;
        statusTextProps.y = y + radius + 10;
        break;
      case 'rectangle':
        shape = (
          <Rect
            {...commonProps}
            width={width}
            height={height}
            cornerRadius={8}
          />
        );
        break;
      default: // square
        shape = (
          <Rect
            {...commonProps}
            width={width}
            height={height}
            cornerRadius={8}
          />
        );
    }
    
    return (
      <Group key={table.id}>
        {shape}
        <Text {...textProps} />
        <Text {...statusTextProps} />
      </Group>
    );
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };
    
    const newPosition = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setStageScale(newScale);
    setStagePosition(newPosition);
  };

  const handleStageDrag = (e) => {
    setStagePosition({ x: e.target.x(), y: e.target.y() });
  };

  // Calcular el bounding box de todas las mesas para ajustar la vista
  const getBounds = () => {
    if (!tables.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    tables.forEach(table => {
      const x = table.position_x || 0;
      const y = table.position_y || 0;
      const width = table.width || 60;
      const height = table.height || 60;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    return { minX, minY, maxX, maxY };
  };

  // Ajustar vista al cargar
  useEffect(() => {
    if (tables.length > 0 && stageRef.current && containerRef.current) {
      const bounds = getBounds();
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const contentWidth = bounds.maxX - bounds.minX;
      const contentHeight = bounds.maxY - bounds.minY;
      
      const scaleX = (containerWidth - 100) / contentWidth;
      const scaleY = (containerHeight - 100) / contentHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      
      const newX = containerWidth / 2 - centerX * newScale;
      const newY = containerHeight / 2 - centerY * newScale;
      
      setStageScale(newScale);
      setStagePosition({ x: newX, y: newY });
    }
  }, [tables]);

  return (
    <div ref={containerRef} className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      <Stage
        ref={stageRef}
        width={containerRef.current?.clientWidth || 800}
        height={500}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable
        onDragMove={handleStageDrag}
        onWheel={handleWheel}
      >
        <Layer>
          {/* Fondo de cuadrícula */}
          <Rect
            x={0}
            y={0}
            width={2000}
            height={2000}
            fill="#f3f4f6"
          />
          
          {/* Líneas de la cuadrícula */}
          {Array.from({ length: 40 }).map((_, i) => (
            <React.Fragment key={i}>
              <Rect
                x={i * 50}
                y={0}
                width={1}
                height={2000}
                fill="#e5e7eb"
              />
              <Rect
                x={0}
                y={i * 50}
                width={2000}
                height={1}
                fill="#e5e7eb"
              />
            </React.Fragment>
          ))}
          
          {/* Mesas */}
          {tables.map(table => getShape(table))}
        </Layer>
      </Stage>
      
      {/* Leyenda */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow p-2 text-xs space-y-1">
        {Object.entries(TABLE_STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span>{TABLE_STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>
      
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow p-2 text-xs text-gray-500">
        🖱️ Arrastra mesas para moverlas | 🖱️ Rueda para zoom
      </div>
    </div>
  );
}

export default TableMap;