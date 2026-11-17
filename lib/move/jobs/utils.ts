import { TEdgeWorkflow, TJob, TNodeWorkflow } from './types';

// Función que recibe los edges y nodes del workflow, y a partir de estos reordena los nodos de un workflow, según el orden de ejecución y paralelismo, guardandolos en un array de arrays.
export function orderNodes(edges: TEdgeWorkflow[], nodes: TNodeWorkflow[]) {
  const orderedNodes = [];

  //Busca el nodo de control que indica el inicio del flujo.
  const startNode = nodes.find((node) => node.type === 'startNodeFlow');

  if (!startNode) {
    throw new Error('No start node found.');
  }

  //Crea un mapa de nodos, para poder acceder a ellos por su id.
  const nodeMap: { [key: string]: TNodeWorkflow } = {};
  nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });

  //Crea un map de los nodos que son hijos, padres.
  const childMap: { [key: string]: TNodeWorkflow[] } = {};
  const parentMap: { [key: string]: number } = {};
  //Crea un map de las dependencias de cada nodo.
  const dependenciesMap: { [key: string]: string[] } = {};

  //Recorre los edges para llenar los maps.
  edges.forEach((edge) => {
    if (!childMap[edge.source]) {
      childMap[edge.source] = [];
    }

    //Se agrega el nodo al que apunta el edge como hijo del nodo de origen. Esto es para tener un control de los nodos hijos de cada nodo.
    childMap[edge.source].push(nodeMap[edge.target]);

    if (!parentMap[edge.target]) {
      parentMap[edge.target] = 0;
    }

    //Se incrementa el contador de padres del nodo al que apunta el edge. Para tener un control de cuantos nodos padres tiene cada nodo.
    parentMap[edge.target]++;

    if (!dependenciesMap[edge.target]) {
      dependenciesMap[edge.target] = [];
    }

    //Si el nodo de origen no es el nodo de control, se agrega como dependencia el id del nodo al que depende el nodo actual (edge.target = id del nodo dependiente).
    if (startNode.id !== edge.source) {
      dependenciesMap[edge.target].push(edge.source);
    }
  });

  //Se crea una cola para recorrer los nodos.
  const queue: TNodeWorkflow[][] = [[startNode]];
  //Se crea un set para guardar los nodos ya visitados.
  const visited = new Set<string>();
  //Se agrega el nodo de control que indica el inicio de flujo a los nodos visitados.
  visited.add(startNode.id);

  while (queue.length > 0) {
    //Se elimina el primer elemento de la queue y obtenemos el nivel actual.
    const currentLevel = queue.shift() || [];
    if (currentLevel[0].id !== startNode.id) {
      orderedNodes.push(
        currentLevel.map((node) => ({
          id: node.id,
          extractionNodeId: node.data.extractionNodeId,
          type: node.type,
          dependencies: dependenciesMap[node.id] || [],
          executionConfig: {
            errorDependencies:
              node?.executionConfig?.errorDependencies || 'continue_execution',
          },
        })),
      );
    }
    const nextLevel: TNodeWorkflow[] = [];
    //Se recorren los nodos del nivel actual
    for (const node of currentLevel) {
      if (childMap[node.id]) {
        //Se recorren los nodos hijos del nodo actual
        for (const nextNode of childMap[node.id]) {
          //Se decrementa el contador de padres del nodo hijo.
          parentMap[nextNode.id]--;
          //Cuando el contador de padres del nodo hijo llega a 0 y estos nodos no fueron visitados.
          if (parentMap[nextNode.id] === 0 && !visited.has(nextNode.id)) {
            nextLevel.push(nextNode);
            visited.add(nextNode.id);
          }
        }
      }
    }
    //Si hay nodos en el siguiente nivel, se agregan a la queue.
    if (nextLevel.length > 0) {
      queue.push(nextLevel);
    }
  }

  return orderedNodes;
}


// Función para contar los jobs con el mismo nombre base, ignorando los paréntesis y el número dentro de ellos
export const countJobsByName = (jobs: TJob[], baseName: string, jobId?: string) => {
  // Función para extraer el nombre base sin paréntesis
  const extractBaseName = (name: string) => {
    const match = name.match(/^([^()]+)\s*\(\d+\)$/);
    return match ? match[1].trim() : name;
  };
  const baseNameWithoutSpaces = baseName.trim();

  // Filtrar los jobs que tienen el mismo nombre base
  const jobsWithSameBaseName = jobs?.filter((job) => {
    return extractBaseName(job.name) === baseNameWithoutSpaces;
  });
  const jobsWithSameBaseNameWithoutCurrentJob = jobsWithSameBaseName?.filter((job) => job.job_id !== jobId);

  return jobId ? jobsWithSameBaseNameWithoutCurrentJob?.length : jobsWithSameBaseName?.length;
};


export const formatTimeExecution = (time: number) => {
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};