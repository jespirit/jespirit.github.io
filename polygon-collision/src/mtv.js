// MTV = Minimum Translation Vector
// https://dyn4j.org/2010/01/sat/#sat-proj
export class MTV {
  constructor(axis, overlap, edge) {
    this.axis = axis;
    this.overlap = overlap;
    this.edge = edge;
  }
}