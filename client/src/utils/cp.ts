import { ClientCPDto, ServerCPDto } from "../../../dto/dto";
import { CP, EdgeAssignment } from "../types/cp";

export function convertServerCPDto(serverCP: ServerCPDto): CP {
  const vertices = serverCP.vertices_coords.map((point: [number, number]) => {
    return { coords: point };
  });

  const edges = serverCP.edges_vertices.map(
    (point: [number, number], index: number) => {
      return {
        vertex1: vertices[point[0]],
        vertex2: vertices[point[1]],
        assignment: serverCP.edges_assignment[index] as EdgeAssignment,
        fold_angle: serverCP.edges_foldAngle[index],
      };
    },
  );

  return { vertices: vertices, edges: edges };
}

export function convertToClientCPDto(cp: CP): ClientCPDto {
  return {
    vertices_coords: cp.vertices.map((v) => [v.coords[0], v.coords[1]]),
    edges_vertices: cp.edges.map((e) => [
      cp.vertices.indexOf(e.vertex1),
      cp.vertices.indexOf(e.vertex2),
    ]),
    edges_assignment: cp.edges.map((e) => e.assignment),
    edges_foldAngle: cp.edges.map((e) => e.fold_angle),
  };
}
