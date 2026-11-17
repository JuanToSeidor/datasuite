"use client";

import React from "react";
import { getStraightPath, type ConnectionLineComponentProps } from "@xyflow/react";

/** Línea de conexión recta con un punto en el extremo (portada de datasync; allí tampoco está conectada al canvas). */
function CustomConnectionLine({ fromX, fromY, toX, toY, connectionLineStyle }: ConnectionLineComponentProps) {
  const [edgePath] = getStraightPath({ sourceX: fromX, sourceY: fromY, targetX: toX, targetY: toY });

  return (
    <g>
      <path style={connectionLineStyle} fill="none" d={edgePath} />
      <circle cx={toX} cy={toY} fill="currentColor" r={3} stroke="currentColor" strokeWidth={1.5} />
    </g>
  );
}

export default CustomConnectionLine;
