/**
 * Polygon クラス
 * 多角形を表し、点の集合から線分を生成し、交差判定や描画を行う。
 * - `union(polys)`: 複数のポリゴンを統合し、不要な線分を削除
 * - `multiBreak(polys)`: 複数のポリゴンの交点を計算し、分割処理を行う
 * - `break(poly1, poly2)`: 2つのポリゴンの交点を計算し、分割処理を行う
 * - `containsSegment(seg)`: 線分がポリゴン内に含まれるか判定
 * - `containsPoint(point)`: 点がポリゴン内に含まれるか判定
 * - `drawSegment(ctx)`: ポリゴンの線分を描画
 * - `draw(ctx, options)`: ポリゴンを描画
 */
class Polygon {
    /**
     * @param {Array<Point>} points - ポリゴンの頂点の配列
     */
    constructor(points) {
        this.points = points;
        this.segments = [];
        for (let i = 1; i <= points.length; i++) {
            this.segments.push(
                new Segment(points[i - 1], points[i % points.length])
            );
        }
    }

    static load(info){
        return new Polygon(
            info.points.map((i) => new Point(i.x,i.y))
        );
    }

    /**
     * 複数のポリゴンを統合し、不要な線分を削除
     * @param {Array<Polygon>} polys - 統合するポリゴンの配列
     * @returns {Array<Segment>} 統合後の線分の配列
     */
    static union(polys) {
        Polygon.multiBreak(polys);
        const keptSegments = [];
        for (let i = 0; i < polys.length; i++) {
            for (const seg of polys[i].segments) {
                let keep = true;
                for (let j = 0; j < polys.length; j++) {
                    if (i !== j && polys[j].containsSegment(seg)) {
                        keep = false;
                        break;
                    }
                }
                if (keep) {
                    keptSegments.push(seg);
                }
            }
        }
        return keptSegments;
    }

    /**
     * 複数のポリゴンの交点を計算し、分割処理を行う
     * @param {Array<Polygon>} polys - 分割するポリゴンの配列
     */
    static multiBreak(polys) {
        for (let i = 0; i < polys.length; i++) {
            for (let j = i + 1; j < polys.length; j++) {
                Polygon.break(polys[i], polys[j]);
            }
        }
    }

    /**
     * 2つのポリゴンの交点を計算し、分割処理を行う
     * @param {Polygon} poly1 - ポリゴン1
     * @param {Polygon} poly2 - ポリゴン2
     */
    static break(poly1, poly2) {
        const seg1 = poly1.segments;
        const seg2 = poly2.segments;
        for (let i = 0; i < seg1.length; i++) {
            for (let j = 0; j < seg2.length; j++) {
                const int = getIntersection(
                    seg1[i].p1, seg1[i].p2, seg2[j].p1, seg2[j].p2
                );

                if (int && int.offset !== 1 && int.offset !== 0) {
                    const point = new Point(int.x, int.y);
                    let aux = seg1[i].p2;
                    seg1[i].p2 = point;
                    seg1.splice(i + 1, 0, new Segment(point, aux));
                    aux = seg2[j].p2;
                    seg2[j].p2 = point;
                    seg2.splice(j + 1, 0, new Segment(point, aux));
                }
            }
        }
    }

    intersectsPoly(poly) {
        for (let s1 of this.segments) {
            for (let s2 of poly.segments) {
                if (getIntersection(s1.p1, s1.p2, s2.p1, s2.p2)) {
                    return true;
                }
            }
        }
        return false;
    }

    distanceToPoint(point) {
        return Math.min(...this.segments.map((s) => s.distanceToPoint(point)));
    }

    distanceToPoly(poly) {
        return Math.min(...this.points.map((p) => poly.distanceToPoint(p)));
    }

    /**
     * 線分がポリゴン内に含まれるか判定
     * @param {Segment} seg - 判定する線分
     * @returns {boolean} 線分がポリゴン内に含まれる場合は true
     */
    containsSegment(seg) {
        const midpoint = average(seg.p1, seg.p2);
        return this.containsPoint(midpoint);
    }

    /**
     * 点がポリゴン内に含まれるか判定
     * @param {Point} point - 判定する点
     * @returns {boolean} 点がポリゴン内に含まれる場合は true
     */
    containsPoint(point) {
        const outerPoint = new Point(-2000, -2000);
        let intersectionCount = 0;
        for (const seg of this.segments) {
            const int = getIntersection(outerPoint, point, seg.p1, seg.p2);
            if (int) {
                intersectionCount++;
            }
        }
        return intersectionCount % 2 === 1;
    }

    /**
     * ポリゴンの線分を描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    drawSegment(ctx) {
        for (const seg of this.segments) {
            seg.draw(ctx, { color: getRandomColor(), width: 5 });
        }
    }

    /**
     * ポリゴンを描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {object} options - 描画オプション
     * @param {string} options.stroke - 線の色（デフォルト: "blue"）
     * @param {number} options.lineWidth - 線の太さ（デフォルト: 2）
     * @param {string} options.fill - 塗りつぶしの色（デフォルト: "rgba(0,0,255,0.3)"）
     */
    draw(ctx, { stroke = "blue", lineWidth = 2, fill = "rgba(0,0,255,0.3)", join = "miter" } = {}) {
        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = join;
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
