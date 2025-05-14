export class Projection {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  overlap(p2) {
    if (this.min > p2.max || this.max < p2.min)
      return false;
    return true;
  }

  getOverlap(proj2) {
    if (this.min > proj2.max || this.max < proj2.min)
      return 0;
    return Math.min(this.max, proj2.max) - Math.max(this.min, proj2.min);
  }

  getOverlapOld(p2) {
    if (!this.overlap(p2))
      return 0;
    // m1 < n1 and m2 < n2
    if (this.min < p2.min && this.max < p2.max) {
      return Math.abs(this.max - p2.min);
    }
    else if (p2.min < this.min && p2.max < this.max) {
      return Math.abs(p2.max - this.min);
    }
    else {
      // p1 contains p2 or p2 contains p1
      let overlap = Math.min(this.max - this.min, p2.max - p2.min);
      // Return the smallest overlap, as containment will add leftover space
      return overlap;
    }
  }

  contains(p2) {
    if (!this.overlap(p2))
      return false;

    return p2.min >= this.min && p2.max <= this.max;
  }
}