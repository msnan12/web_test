/**
 * Segment クラス
 * 2点 (p1, p2) を結ぶ線分を表し、線分の描画や比較を行う。
 * - `equals(seg)`  : 他の Segment と同じ線分か判定
 * - `includes(point)`: 指定した点が線分上にあるか判定
 * - `draw(ctx, options)`: 指定の描画オプションを適用して線分を描画
 */
class Segment {
    /**
     * @param {Point} p1 - 線分の始点
     * @param {Point} p2 - 線分の終点
     */
    constructor(p1, p2, oneWay=false) {
        this.p1 = p1;
        this.p2 = p2;
        this.oneWay = oneWay;
    }

    /**
     * 線分の長さを計算
     * @returns {number} 線分の長さ
     */
    length() {
        return distance(this.p1, this.p2);
    }

    /**
     * 線分の方向ベクトルを取得
     * ベクトルの正規化を行い、単位ベクトルを返す。
     * @returns {Point} 方向ベクトル（正規化済み）
     */
    directionVector() {
        return normalize(subtract(this.p2, this.p1));
    }

    /**
     * 指定した点から線分までの最短距離を計算
     * - 点が線分の範囲内に投影される場合はその距離を返す。
     * - それ以外の場合は、始点または終点までの距離の最小値を返す。
     * @param {Point} point - 計算対象の点
     * @returns {number} 線分までの最短距離
     */
    distanceToPoint(point) {
        const proj = this.projectPoint(point);
        if (proj.offset > 0 && proj.offset < 1) {
            return distance(point, proj.point);
        }
        const distToP1 = distance(point, this.p1);
        const distToP2 = distance(point, this.p2);
        return Math.min(distToP1, distToP2);
    }

    /**
     * 指定した点を線分上に投影
     * - 点を線分上に投影し、投影された点とオフセット値を返す。
     * @param {Point} point - 投影する点
     * @returns {Object} 投影結果 { point: 投影された点, offset: 線分上の位置 (0~1) }
     */
    projectPoint(point) {
        const a = subtract(point, this.p1);
        const b = subtract(this.p2, this.p1);
        const normB = normalize(b);
        const scaler = dot(a, normB);
        const proj = {
            point: add(this.p1, scale(normB, scaler)),
            offset: scaler / magnitude(b)
        };
        return proj;
    }


    /**
     * 他の線分と同じかどうかを判定する
     * @param {Segment} seg - 比較対象の線分
     * @returns {boolean} 線分が等しい場合は true
     */
    equals(seg) {
        return this.includes(seg.p1) && this.includes(seg.p2);
    }

    /**
     * 指定した点が線分の端点のどちらかに含まれているか判定する
     * @param {Point} point - チェックする点
     * @returns {boolean} 点が線分上にある場合は true
     */
    includes(point) {
        return this.p1.equals(point) || this.p2.equals(point);
    }

    /**
     * 線分を描画する
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {object} options - 描画オプション
     * @param {number} options.width - 線の太さ（デフォルト: 2）
     * @param {string} options.color - 線の色（デフォルト: "black"）
     * @param {Array<number>} options.dash - 破線の設定（デフォルト: []）
     */
    draw(ctx, { width = 2, color = "black", dash = [], cap = "butt" } = {}) {
        ctx.beginPath();
        ctx.lineWidth = width; // 線の太さを設定
        ctx.strokeStyle = color; // 線の色を設定
        ctx.lineCap = cap;
        if(this.oneWay){
            dash=[4,4];
        }
        ctx.setLineDash(dash); // 破線の設定（通常は [] = 実線）
        ctx.moveTo(this.p1.x, this.p1.y); // 始点を指定
        ctx.lineTo(this.p2.x, this.p2.y); // 終点を指定
        ctx.stroke(); // 線を描画
        ctx.setLineDash([]); // 破線の設定をリセット
    }
}
