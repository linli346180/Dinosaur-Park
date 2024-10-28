
export class Vector2 {
    x = 0;
    y = 0;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;

    }

    set(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
    }
    setVec(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    plus(vector: Vector2, isNew = true) {
        if (isNew) {
            return new Vector2(this.x + vector.x, this.y + vector.y);
        } else {
            this.x += vector.x;
            this.y += vector.y;
            return this;
        }

    }

    static plus(v1: Vector2, v2: Vector2) {
        return tmpVec1.set(v1.x + v2.x, v1.y + v2.y);
    }

    minus(vector: Vector2, isNew = true) {
        if (isNew) {
            return new Vector2(this.x - vector.x, this.y - vector.y);
        } else {
            this.x -= vector.x;
            this.y -= vector.y;
            return this;
        }
    }

    static minus(v1: Vector2, v2: Vector2) {
        return tmpVec1.set(v1.x - v2.x, v1.y - v2.y);
    }

    multiply(vector: Vector2) {
        return this.x * vector.x + this.y * vector.y;
    }

    scale(k: number, isNew = true) {
        if (isNew) {
            return new Vector2(this.x * k, this.y * k);
        } else {
            this.x *= k;
            this.y *= k;
            return this;
        }
    }

    static scale(v: Vector2, k: number) {
        return tmpVec1.set(v.x * k, v.y * k);
    }

    copy(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    substract(out: Vector2, other: Vector2) {
        out.x -= other.x;
        out.y -= other.y;
        return out;
    }

    lengthSqr() {
        return this.x ** 2 + this.y ** 2;
    }
}

const tmpVec1 = new Vector2();
const tmpVec2 = new Vector2();
const tmpVec3 = new Vector2();

export class Obstacle {
    next: Obstacle;
    previous: Obstacle;
    direction: Vector2;
    point: Vector2;
    id: number;
    convex: boolean;
}

export class Line {
    point: Vector2;
    direction: Vector2;
}

export class KeyValuePair<K, V> {
    key: K;
    value: V;
    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }
}

export class RVOMath {

    static RVO_EPSILON = 0.00001;

    static absSq(v: Vector2) {
        return v.multiply(v);
    };

    static normalize(v: Vector2, isNew = true) {
        return v.scale(1 / RVOMath.abs(v), isNew); // v / abs(v)
    };

    static distSqPointLineSegment(vector1: Vector2, vector2: Vector2, vector3: Vector2) {
        let aux1 = tmpVec1.setVec(vector3).minus(vector1, false);
        let aux2 = tmpVec2.setVec(vector2).minus(vector1, false);

        let r = aux1.multiply(aux2) / RVOMath.absSq(aux2);

        if (r < 0) {
            return RVOMath.absSq(aux1);
        }
        else if (r > 1) {
            return RVOMath.absSq(Vector2.minus(vector3, vector2));
        }
        else {
            return RVOMath.absSq(tmpVec1.setVec(vector3).minus(tmpVec3.setVec(vector1).plus(aux2.scale(r, false), false), false));
        }
    };

    static sqr(p: number) {
        return p * p;
    };

    static det(v1: Vector2, v2: Vector2) {
        return v1.x * v2.y - v1.y * v2.x;
    };

    static abs(v: Vector2) {
        return Math.sqrt(RVOMath.absSq(v));
    };

    static leftOf(a: Vector2, b: Vector2, c: Vector2) {
        return RVOMath.det(tmpVec1.setVec(a).minus(c, false), tmpVec2.setVec(b).minus(a, false));
    };

}