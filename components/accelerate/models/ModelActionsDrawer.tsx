"use client";

import React from "react";
import { Drawer } from "caralstable";
import type { AccelerateModel } from "../types";

interface ModelActionsDrawerProps {
  model: AccelerateModel | null;
  onClose: () => void;
}

/**
 * Drawer de acciones de un modelo desplegado.
 * Contenido pendiente de definición: por ahora solo muestra el título del modelo.
 * Se monta solo cuando hay modelo seleccionado (evita altura fantasma).
 */
export function ModelActionsDrawer({ model, onClose }: ModelActionsDrawerProps) {
  if (!model) return null;

  return <Drawer isOpen onClose={onClose} title={model.name} size="md" />;
}
