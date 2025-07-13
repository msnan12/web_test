/**
 * Point クラス
 * 2D座標系の点を表し、座標の比較や描画を行う。
 * - `equals(point)`: 他の点と同じ座標か判定
 * - `draw(ctx, options)`: 指定の描画オプションを適用して点を描画
 */
class Point {
    /**
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 他の点と同じ座標かどうかを判定する
     * @param {Point} point - 比較対象の点
     * @returns {boolean} 座標が一致する場合は true
     */
    equals(point) {
        return this.x == point.x && this.y == point.y;
    }

    /**
     * 点を描画する
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {object} options - 描画オプション
     * @param {number} options.size - 点のサイズ（デフォルト: 18）
     * @param {string} options.color - 点の色（デフォルト: "black"）
     * @param {boolean} options.outline - 黄色の枠を描画するか（デフォルト: false）
     * @param {boolean} options.fill - 黄色の塗りを追加するか（デフォルト: false）
     */
    draw(ctx, { size = 18, color = "black", outline = false, fill = false } = {}) {
        const rad = size / 2;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
        ctx.fill(); // 点を描画

        if (outline) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.arc(this.x, this.y, rad * 0.6, 0, Math.PI * 2);
            ctx.stroke(); // 黄色の枠を描画
        }

        if (fill) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, rad * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "yellow";
            ctx.fill(); // 黄色の塗りを追加
        }
    }
}
