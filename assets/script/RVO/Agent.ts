import { RVOMath, Vector2, Line, KeyValuePair, Obstacle } from "./Common";
import { Simulator } from "./Simulator";

const tmpVec1 = new Vector2();
const tmpVec2 = new Vector2();
const tmpVec3 = new Vector2();
const tmpVec4 = new Vector2();
const tmpVec5 = new Vector2();
const tmpVec6 = new Vector2();
const tmpVec7 = new Vector2();
const tmpVec8 = new Vector2();

/**
  agentNeighbors_​ 是一个 key-value 对组成的数组，
  obstaclNeighbors_​ 是一个 key-value 对组成的数组，
  orcaLines_​ 是由线段组成的数组，（Optimal Reciprocal Collision Avoidance）。
  position_​ 是该代理的位置向量。
  prefVelocity_​ 是该代理的期望速度向量。
  velocity_​ 是该代理的实际速度向量。
  id​ 是该代理的唯一标识符。
  maxNeighbors_​ 是该代理寻找的邻居代理的最大数目。
  maxSpeed_​ 是该代理的最大速度。
  neighborDist​ 是寻找邻居代理的搜索距离。
  radius_​ 是该代理的半径。
  timeHorizon​ 是该代理计算动态物体时的时间窗口大小。
  timeHorizonObst​ 是该代理计算静态物体时的时间窗口大小。
  newVelocity_​ 是该代理计算出的新速度。
  mass​ 是该代理的质量。
 */
/**
 * 代理类 
 * */
export class Agent {
    orcaLines_: Line[] = [];                    //用于计算过程中的 ORCA
    agentNeighbors_: KeyValuePair<number, Agent>[] = [];    //用于存储与该代理距离最近的其他代理的标识符和代理实例。
    obstaclNeighbors_: KeyValuePair<number, Obstacle>[] = [];   //用于存储与该代理距离最近的障碍物的标识符和障碍物实例。
    position_: Vector2 = new Vector2(0, 0); //该代理的位置向量
    prefVelocity_: Vector2 = new Vector2(0, 0); //该代理的期望速度向量
    velocity_: Vector2 = new Vector2(0, 0); //该代理的实际速度向量
    newVelocity_: Vector2 = new Vector2(0, 0); //该代理计算出的新速度

    id: number = 0;
    maxNeighbors_: number = 0;
    maxSpeed_: number = 0.0;
    neighborDist: number = 0.0;
    radius_: number = 0.0;
    timeHorizon: number = 0.0;
    timeHorizonObst: number = 0.0;
    mass: number = 1;

    /** 计算相邻代理 */
    computeNeighbors(sim: Simulator) {
        this.obstaclNeighbors_.length = 0;
        let rangeSq = (this.timeHorizonObst * this.maxSpeed_ + this.radius_) ** 2;
        sim.kdTree.computeObstacleNeighbors(this, rangeSq);
        this.agentNeighbors_.length = 0;
        if (this.maxNeighbors_ > 0) {
            rangeSq = this.neighborDist ** 2;
            rangeSq = sim.kdTree.computeAgentNeighbors(this, rangeSq);
        }
    }

    /* 计算新速度 */
    computeNewVelocity(dt: number) {
        this.orcaLines_.length = 0;
        let orcaLines = this.orcaLines_;
        let invTimeHorizonObst = 1.0 / this.timeHorizonObst;

        /* Create obstacle ORCA lines. */
        for (let i = 0; i < this.obstaclNeighbors_.length; ++i) {
            let obstacle1 = this.obstaclNeighbors_[i].value;
            let obstacle2 = obstacle1.next;
            const relativePosition1 = tmpVec1.setVec(obstacle1.point).minus(this.position_, false);
            const relativePosition2 = tmpVec2.setVec(obstacle2.point).minus(this.position_, false);

            let alreadyCovered = false;
            for (let j = 0; j < orcaLines.length; ++j) {
                if (RVOMath.det(tmpVec3.setVec(relativePosition1).scale(invTimeHorizonObst, false).minus(orcaLines[j].point, false), orcaLines[j].direction) - invTimeHorizonObst * this.radius_ >= -RVOMath.RVO_EPSILON
                    && RVOMath.det(tmpVec4.setVec(relativePosition2).scale(invTimeHorizonObst, false).minus(orcaLines[j].point, false), orcaLines[j].direction) - invTimeHorizonObst * this.radius_ >= -RVOMath.RVO_EPSILON) {
                    alreadyCovered = true;
                    break;
                }
            }

            if (alreadyCovered) {
                continue;
            }

            /* Not yet covered. Check for collisions. */
            let distSq1 = RVOMath.absSq(relativePosition1);
            let distSq2 = RVOMath.absSq(relativePosition2);
            let radiusSq = RVOMath.sqr(this.radius_);

            const obstacleVector = tmpVec5.setVec(obstacle2.point).minus(obstacle1.point, false);
            tmpVec6.setVec(relativePosition1).scale(-1, false);

            let s = tmpVec6.multiply(obstacleVector) / RVOMath.absSq(obstacleVector);
            let distSqLine = RVOMath.absSq(tmpVec6.minus(obstacleVector.scale(s, false), false));

            let line = new Line();
            if (s < 0 && distSq1 <= radiusSq) {
                /* Collision with left vertex. Ignore if non-convex. */
                if (obstacle1.convex) {
                    line.point = new Vector2(0, 0);
                    line.direction = RVOMath.normalize(new Vector2(-relativePosition1.y, relativePosition1.x), false);
                    orcaLines.push(line);
                }
                continue;
            }
            else if (s > 1 && distSq2 <= radiusSq) {
                /* Collision with right vertex. Ignore if non-convex 
                 * or if it will be taken care of by neighoring obstace */
                if (obstacle2.convex && RVOMath.det(relativePosition2, obstacle2.direction) >= 0) {
                    line.point = new Vector2(0, 0);
                    line.direction = RVOMath.normalize(new Vector2(-relativePosition2.y, relativePosition2.x), false);
                    orcaLines.push(line);
                }
                continue;
            }
            else if (s >= 0 && s <= 1 && distSqLine <= radiusSq) {
                /* Collision with obstacle segment. */
                line.point = new Vector2(0, 0);
                line.direction = obstacle1.direction.scale(-1);
                orcaLines.push(line);
                continue;
            }

            /* 
             * No collision.  
             * Compute legs. When obliquely viewed, both legs can come from a single
             * vertex. Legs extend cut-off line when nonconvex vertex.
             */
            let leftLegDirection: Vector2, rightLegDirection: Vector2;

            if (s < 0 && distSqLine <= radiusSq) {
                /*
                 * Obstacle viewed obliquely so that left vertex
                 * defines velocity obstacle.
                 */
                if (!obstacle1.convex) {
                    /* Ignore obstacle. */
                    continue;
                }

                obstacle2 = obstacle1;

                let leg1 = Math.sqrt(distSq1 - radiusSq);
                leftLegDirection = (new Vector2(relativePosition1.x * leg1 - relativePosition1.y * this.radius_, relativePosition1.x * this.radius_ + relativePosition1.y * leg1)).scale(1 / distSq1, false);
                rightLegDirection = (new Vector2(relativePosition1.x * leg1 + relativePosition1.y * this.radius_, -relativePosition1.x * this.radius_ + relativePosition1.y * leg1)).scale(1 / distSq1, false);
            }
            else if (s > 1 && distSqLine <= radiusSq) {
                /*
                 * Obstacle viewed obliquely so that
                 * right vertex defines velocity obstacle.
                 */
                if (!obstacle2.convex) {
                    /* Ignore obstacle. */
                    continue;
                }

                obstacle1 = obstacle2;

                let leg2 = Math.sqrt(distSq2 - radiusSq);
                leftLegDirection = (new Vector2(relativePosition2.x * leg2 - relativePosition2.y * this.radius_, relativePosition2.x * this.radius_ + relativePosition2.y * leg2)).scale(1 / distSq2, false);
                rightLegDirection = (new Vector2(relativePosition2.x * leg2 + relativePosition2.y * this.radius_, -relativePosition2.x * this.radius_ + relativePosition2.y * leg2)).scale(1 / distSq2, false);
            }
            else {
                /* Usual situation. */
                if (obstacle1.convex) {
                    let leg1 = Math.sqrt(distSq1 - radiusSq);
                    leftLegDirection = (new Vector2(relativePosition1.x * leg1 - relativePosition1.y * this.radius_, relativePosition1.x * this.radius_ + relativePosition1.y * leg1)).scale(1 / distSq1, false);
                }
                else {
                    /* Left vertex non-convex; left leg extends cut-off line. */
                    leftLegDirection = obstacle1.direction.scale(-1);
                }

                if (obstacle2.convex) {
                    let leg2 = Math.sqrt(distSq2 - radiusSq);
                    rightLegDirection = (new Vector2(relativePosition2.x * leg2 + relativePosition2.y * this.radius_, -relativePosition2.x * this.radius_ + relativePosition2.y * leg2)).scale(1 / distSq2, false);
                }
                else {
                    /* Right vertex non-convex; right leg extends cut-off line. */
                    rightLegDirection = obstacle1.direction;
                }
            }

            /* 
             * Legs can never point into neighboring edge when convex vertex,
             * take cutoff-line of neighboring edge instead. If velocity projected on
             * "foreign" leg, no constraint is added. 
             */

            let leftNeighbor = obstacle1.previous;

            let isLeftLegForeign = false;
            let isRightLegForeign = false;

            if (obstacle1.convex && RVOMath.det(leftLegDirection, Vector2.scale(leftNeighbor.direction, -1)) >= 0.0) {
                /* Left leg points into obstacle. */
                leftLegDirection = leftNeighbor.direction.scale(-1);
                isLeftLegForeign = true;
            }

            if (obstacle2.convex && RVOMath.det(rightLegDirection, obstacle2.direction) <= 0.0) {
                /* Right leg points into obstacle. */
                rightLegDirection = obstacle2.direction;
                isRightLegForeign = true;
            }

            /* Compute cut-off centers. */
            let leftCutoff = obstacle1.point.minus(this.position_).scale(invTimeHorizonObst, false);
            let rightCutoff = obstacle2.point.minus(this.position_).scale(invTimeHorizonObst, false);
            let cutoffVec = rightCutoff.minus(leftCutoff);

            /* Project current velocity on velocity obstacle. */

            /* Check if current velocity is projected on cutoff circles. */
            let t = (obstacle1 == obstacle2) ? 0.5 : tmpVec1.setVec(this.velocity_).minus(leftCutoff, false).multiply(cutoffVec) / RVOMath.absSq(cutoffVec);
            let tLeft = tmpVec1.setVec(this.velocity_).minus(leftCutoff, false).multiply(leftLegDirection);
            let tRight = tmpVec1.setVec(this.velocity_).minus(rightCutoff, false).multiply(rightLegDirection);

            if ((t < 0.0 && tLeft < 0.0) || (obstacle1 == obstacle2 && tLeft < 0.0 && tRight < 0.0)) {
                /* Project on left cut-off circle. */
                let unitW = RVOMath.normalize(tmpVec1.setVec(this.velocity_).minus(leftCutoff, false));

                line.direction = new Vector2(unitW.y, -unitW.x);
                line.point = unitW.scale(this.radius_ * invTimeHorizonObst, false).plus(leftCutoff, false);
                orcaLines.push(line);
                continue;
            }
            else if (t > 1.0 && tRight < 0.0) {
                /* Project on right cut-off circle. */
                let unitW = RVOMath.normalize(tmpVec1.setVec(this.velocity_).minus(rightCutoff, false));

                line.direction = new Vector2(unitW.y, -unitW.x);
                line.point = unitW.scale(this.radius_ * invTimeHorizonObst, false).plus(rightCutoff, false);
                orcaLines.push(line);
                continue;
            }

            /* 
             * Project on left leg, right leg, or cut-off line, whichever is closest
             * to velocity.
             */
            // let distSqCutoff = ((t < 0.0 || t > 1.0 || obstacle1 == obstacle2) ? Infinity : RVOMath.absSq(this.velocity_.minus(cutoffVec.scale(t).plus(leftCutoff))));
            let distSqCutoff = ((t < 0.0 || t > 1.0 || obstacle1 == obstacle2) ? Infinity :
                RVOMath.absSq(Vector2.minus(this.velocity_, Vector2.plus(Vector2.scale(cutoffVec, t), leftCutoff))));

            // let distSqLeft = ((tLeft < 0.0) ? Infinity : RVOMath.absSq(this.velocity_.minus(leftLegDirection.scale(tLeft).plus(leftCutoff))));
            let distSqLeft = ((tLeft < 0.0) ? Infinity :
                RVOMath.absSq(Vector2.minus(this.velocity_, Vector2.plus(Vector2.scale(leftLegDirection, tLeft), leftCutoff))));

            // let distSqRight = ((tRight < 0.0) ? Infinity : RVOMath.absSq(this.velocity_.minus(rightLegDirection.scale(tRight).plus(rightCutoff))));
            let distSqRight = ((tRight < 0.0) ? Infinity :
                RVOMath.absSq(Vector2.minus(this.velocity_, Vector2.plus(Vector2.scale(rightLegDirection, tRight), rightCutoff))));

            if (distSqCutoff <= distSqLeft && distSqCutoff <= distSqRight) {
                /* Project on cut-off line. */
                line.direction = obstacle1.direction.scale(-1);
                let aux = new Vector2(-line.direction.y, line.direction.x);
                line.point = aux.scale(this.radius_ * invTimeHorizonObst, false).plus(leftCutoff, false);
                orcaLines.push(line);
                continue;
            }
            else if (distSqLeft <= distSqRight) {
                /* Project on left leg. */
                if (isLeftLegForeign) {
                    continue;
                }

                line.direction = leftLegDirection;
                let aux = new Vector2(-line.direction.y, line.direction.x);
                line.point = aux.scale(this.radius_ * invTimeHorizonObst, false).plus(leftCutoff, false);
                orcaLines.push(line);
                continue;
            }
            else {
                /* Project on right leg. */
                if (isRightLegForeign) {
                    continue;
                }

                line.direction = rightLegDirection.scale(-1);
                let aux = new Vector2(-line.direction.y, line.direction.x);
                line.point = aux.scale(this.radius_ * invTimeHorizonObst, false).plus(rightCutoff, false);
                orcaLines.push(line);
                continue;
            }
        }

        let numObstLines = orcaLines.length;

        let invTimeHorizon = 1.0 / this.timeHorizon;

        /* Create agent ORCA lines. */
        for (let i = 0; i < this.agentNeighbors_.length; ++i) {
            let other = this.agentNeighbors_[i].value;

            let relativePosition = other.position_.minus(this.position_);

            // mass
            let massRatio = (other.mass / (this.mass + other.mass));
            let neighborMassRatio = (this.mass / (this.mass + other.mass));

            // let velocityOpt = (massRatio >= 0.5 ? (this.velocity_.minus(this.velocity_.scale(massRatio)).scale(2)) : this.prefVelocity_.plus(this.velocity_.minus(this.prefVelocity_).scale(massRatio * 2)));
            let velocityOpt = (massRatio >= 0.5 ?
                (Vector2.minus(this.velocity_, Vector2.scale(this.velocity_, massRatio)).scale(2)) :
                Vector2.plus(this.prefVelocity_, Vector2.minus(this.velocity_, this.prefVelocity_).scale(massRatio * 2)));

            // let neighborVelocityOpt = (neighborMassRatio >= 0.5 ? other.velocity_.scale(2).scale(1 - neighborMassRatio) : (other.prefVelocity_.plus(other.velocity_.minus(other.prefVelocity_).scale(2 * neighborMassRatio))));
            let neighborVelocityOpt = (neighborMassRatio >= 0.5 ?
                tmpVec1.setVec(other.velocity_).scale(2 * (1 - neighborMassRatio)) :
                (other.prefVelocity_.plus(tmpVec2.setVec(other.velocity_).minus(other.prefVelocity_, false).scale(2 * neighborMassRatio, false))));

            let relativeVelocity = velocityOpt.minus(neighborVelocityOpt);//this.velocity.minus(other.velocity);
            let distSq = RVOMath.absSq(relativePosition);
            let combinedRadius = this.radius_ + other.radius_;
            let combinedRadiusSq = RVOMath.sqr(combinedRadius);

            let line = new Line();
            let u: Vector2;

            if (distSq > combinedRadiusSq) {
                /* No collision. */
                let w = relativeVelocity.minus(tmpVec1.setVec(relativePosition).scale(invTimeHorizon, false)); // Vector
                /* Vector from cutoff center to relative velocity. */
                let wLengthSq = RVOMath.absSq(w);

                let dotProduct1 = w.multiply(relativePosition);

                if (dotProduct1 < 0.0 && RVOMath.sqr(dotProduct1) > combinedRadiusSq * wLengthSq) {
                    /* Project on cut-off circle. */
                    let wLength = Math.sqrt(wLengthSq);
                    let unitW = w.scale(1 / wLength);

                    line.direction = new Vector2(unitW.y, -unitW.x);
                    u = unitW.scale(combinedRadius * invTimeHorizon - wLength);
                }
                else {
                    /* Project on legs. */
                    let leg = Math.sqrt(distSq - combinedRadiusSq);

                    if (RVOMath.det(relativePosition, w) > 0.0) {
                        /* Project on left leg. */
                        let aux = new Vector2(relativePosition.x * leg - relativePosition.y * combinedRadius, relativePosition.x * combinedRadius + relativePosition.y * leg);
                        line.direction = aux.scale(1 / distSq, false);
                    }
                    else {
                        /* Project on right leg. */
                        let aux = new Vector2(relativePosition.x * leg + relativePosition.y * combinedRadius, -relativePosition.x * combinedRadius + relativePosition.y * leg);
                        line.direction = aux.scale(-1 / distSq, false);
                    }

                    let dotProduct2 = relativeVelocity.multiply(line.direction);
                    u = line.direction.scale(dotProduct2).minus(relativeVelocity, false);
                }
            }
            else {
                /* Collision. Project on cut-off circle of time timeStep. */
                let invTimeStep = 1.0 / dt;

                /* Vector from cutoff center to relative velocity. */
                let w = tmpVec2.setVec(relativeVelocity).minus(tmpVec1.setVec(relativePosition).scale(invTimeStep), false);

                let wLength = RVOMath.abs(w);
                let unitW = w.scale(1 / wLength, false);

                line.direction = new Vector2(unitW.y, -unitW.x);
                u = unitW.scale(combinedRadius * invTimeStep - wLength, false);
            }


            // line.point = u.scale(0.5).plus(this.velocity);
            line.point = u.scale(massRatio, false).plus(velocityOpt, false);
            orcaLines.push(line);
        }

        let lineFail = this.linearProgram2(orcaLines, this.maxSpeed_, this.prefVelocity_, false, this.newVelocity_);

        if (lineFail < orcaLines.length) {
            this.linearProgram3(orcaLines, numObstLines, lineFail, this.maxSpeed_, this.newVelocity_);
        }
    }

    insertAgentNeighbor(agent: Agent, rangeSq: number) {
        if (this != agent) {
            let distSq = RVOMath.absSq(tmpVec1.setVec(this.position_).minus(agent.position_, false));

            if (distSq < rangeSq) {
                if (this.agentNeighbors_.length < this.maxNeighbors_) {
                    this.agentNeighbors_.push(new KeyValuePair(distSq, agent));
                }
                let i = this.agentNeighbors_.length - 1;
                while (i != 0 && distSq < this.agentNeighbors_[i - 1].key) {
                    this.agentNeighbors_[i] = this.agentNeighbors_[i - 1];
                    --i;
                }
                this.agentNeighbors_[i] = new KeyValuePair<number, Agent>(distSq, agent);

                if (this.agentNeighbors_.length == this.maxNeighbors_) {
                    rangeSq = this.agentNeighbors_[this.agentNeighbors_.length - 1].key;
                }
            }
        }
        return rangeSq;
    }

    insertObstacleNeighbor(obstacle: Obstacle, rangeSq: number) {
        let nextObstacle = obstacle.next;

        let distSq = RVOMath.distSqPointLineSegment(obstacle.point, nextObstacle.point, this.position_);

        if (distSq < rangeSq) {
            this.obstaclNeighbors_.push(new KeyValuePair<number, Obstacle>(distSq, obstacle));

            let i = this.obstaclNeighbors_.length - 1;
            while (i != 0 && distSq < this.obstaclNeighbors_[i - 1].key) {
                this.obstaclNeighbors_[i] = this.obstaclNeighbors_[i - 1];
                --i;
            }
            this.obstaclNeighbors_[i] = new KeyValuePair<number, Obstacle>(distSq, obstacle);
        }
    }

    update(dt: number) {
        this.velocity_.copy(this.newVelocity_);
        this.position_.copy(tmpVec1.setVec(this.position_).plus(tmpVec2.setVec(this.velocity_).scale(dt, false), false));
    };

    linearProgram1(lines: Line[], lineNo: number, radius: number, optVelocity: Vector2, directionOpt: boolean, result: Vector2) {
        let dotProduct = lines[lineNo].point.multiply(lines[lineNo].direction);
        let discriminant = RVOMath.sqr(dotProduct) + RVOMath.sqr(radius) - RVOMath.absSq(lines[lineNo].point);

        if (discriminant < 0.0) {
            /* Max speed circle fully invalidates line lineNo. */
            return false;
        }

        let sqrtDiscriminant = Math.sqrt(discriminant);
        let tLeft = -dotProduct - sqrtDiscriminant;
        let tRight = -dotProduct + sqrtDiscriminant;

        for (let i = 0; i < lineNo; ++i) {
            let denominator = RVOMath.det(lines[lineNo].direction, lines[i].direction);
            let numerator = RVOMath.det(lines[i].direction, tmpVec1.setVec(lines[lineNo].point).minus(lines[i].point, false));

            if (Math.abs(denominator) <= RVOMath.RVO_EPSILON) {
                /* Lines lineNo and i are (almost) parallel. */
                if (numerator < 0.0) {
                    return false;
                }
                else {
                    continue;
                }
            }

            let t = numerator / denominator;

            if (denominator >= 0.0) {
                /* Line i bounds line lineNo on the right. */
                tRight = Math.min(tRight, t);
            }
            else {
                /* Line i bounds line lineNo on the left. */
                tLeft = Math.max(tLeft, t);
            }

            if (tLeft > tRight) {
                return false;
            }
        }

        if (directionOpt) {
            if (optVelocity.multiply(lines[lineNo].direction) > 0.0) {
                // Take right extreme
                result.copy(Vector2.plus(lines[lineNo].point, tmpVec1.setVec(lines[lineNo].direction).scale(tRight, false)));
            }
            else {
                // Take left extreme.
                result.copy(Vector2.plus(lines[lineNo].point, tmpVec1.setVec(lines[lineNo].direction).scale(tLeft, false)));
            }
        }
        else {
            // Optimize closest point
            let t = lines[lineNo].direction.multiply(optVelocity.minus(lines[lineNo].point));
            if (t < tLeft) {
                result.copy(Vector2.plus(lines[lineNo].point, tmpVec1.setVec(lines[lineNo].direction).scale(tLeft, false)));
            }
            else if (t > tRight) {
                result.copy(Vector2.plus(lines[lineNo].point, tmpVec1.setVec(lines[lineNo].direction).scale(tRight, false)));
            }
            else {
                result.copy(Vector2.plus(lines[lineNo].point, tmpVec1.setVec(lines[lineNo].direction).scale(t, false)));
            }
        }

        return true;
    }

    linearProgram2(lines: Line[], radius: number, optVelocity: Vector2, directionOpt: boolean, result: Vector2) {
        // directionOpt 第一次为false，第二次为true，directionOpt主要用在 linearProgram1 里面
        if (directionOpt) {
            /* 
             * Optimize direction. Note that the optimization velocity is of unit
             * length in this case.
             */
            result.copy(Vector2.scale(optVelocity, radius));
        }
        else if (RVOMath.absSq(optVelocity) > RVOMath.sqr(radius)) {
            /* Optimize closest point and outside circle. */
            result.copy(RVOMath.normalize(tmpVec1.setVec(optVelocity)).scale(radius, false));
        }
        else {
            /* Optimize closest point and inside circle. */
            result.copy(optVelocity);
        }

        for (let i = 0; i < lines.length; ++i) {
            if (RVOMath.det(lines[i].direction, Vector2.minus(lines[i].point, result)) > 0.0) {
                /* Result does not satisfy constraint i. Compute new optimal result. */
                tmpVec1.setVec(result);
                if (!this.linearProgram1(lines, i, radius, optVelocity, directionOpt, result)) {
                    result.copy(tmpVec1);
                    return i;
                }
            }
        }

        return lines.length;
    }

    linearProgram3(lines: Line[], numObstLines: number, beginLine: number, radius: number, result: Vector2) {
        let distance = 0.0;
        // 遍历所有剩余ORCA线
        for (let i = beginLine; i < lines.length; ++i) {
            // 每一条 ORCA 线都需要精确的做出处理，distance 为 最大违规的速度
            if (RVOMath.det(lines[i].direction, Vector2.minus(lines[i].point, result)) > distance) {
                /* Result does not satisfy constraint of line i. */
                //std::vector<Line> projLines(lines.begin(), lines.begin() + numObstLines);
                let projLines = []; // new List<Line>();
                // 1.静态阻挡的orca线直接加到projLines中
                for (let ii = 0; ii < numObstLines; ++ii) {
                    projLines.push(lines[ii]);
                }
                // 2.动态阻挡的orca线需要重新计算line，从第一个非静态阻挡到当前的orca线
                for (let j = numObstLines; j < i; ++j) {
                    let line = new Line();

                    let determinant = RVOMath.det(lines[i].direction, lines[j].direction);

                    if (Math.abs(determinant) <= RVOMath.RVO_EPSILON) {
                        /* Line i and line j are parallel. */
                        if (lines[i].direction.multiply(lines[j].direction) > 0.0) {
                            /* Line i and line j point in the same direction. */
                            continue;
                        }
                        else {
                            /* Line i and line j point in opposite direction. */
                            line.point = lines[i].point.plus(lines[j].point).scale(0.5, false);
                        }
                    }
                    else {
                        line.point = lines[i].point.plus(Vector2.scale(lines[i].direction, RVOMath.det(lines[j].direction, Vector2.minus(lines[i].point, lines[j].point)) / determinant));
                    }

                    line.direction = RVOMath.normalize(Vector2.minus(lines[j].direction, lines[i].direction));
                    projLines.push(line);
                }

                // let tempResult = result.clone();
                tmpVec1.setVec(result);
                if (this.linearProgram2(projLines, radius, new Vector2(-lines[i].direction.y, lines[i].direction.x), true, result) < projLines.length) {
                    /* This should in principle not happen.  The result is by definition
                     * already in the feasible region of this linear program. If it fails,
                     * it is due to small floating point error, and the current result is
                     * kept.
                     */
                    result.copy(tmpVec1);
                }

                distance = RVOMath.det(lines[i].direction, Vector2.minus(lines[i].point, result));
            }
        }
    }
}