/**
 * Envelope クラス
 * 指定された線（skeleton）を基準に、幅と丸みを持つポリゴンを生成するクラス。
 * - `#generatePolygon(width, roundness)`: ポリゴンの頂点を計算
 * - `draw(ctx, options)`: ポリゴンを描画
 */
class Envelope {
    /**
     * @param {Segment} skeleton - 基準となる線分
     * @param {number} width - ポリゴンの幅
     * @param {number} roundness - 丸みの度合い（デフォルト: 1）
     */
    constructor(skeleton, width, roundness = 1) {
        if(skeleton){
            this.skeleton = skeleton; // 基準となる線分
            this.poly = this.#generatePolygon(width, roundness); // ポリゴンを生成
        }
    }

    static load(info){
        const env=new Envelope();
        env.skeleton=new Segment(info.skeleton.p1,info.skeleton.p2);
        env.poly=Polygon.load(info.poly);
        return env;
    }


    /**
     * ポリゴンの頂点を計算
     * @param {number} width - ポリゴンの幅
     * @param {number} roundness - 丸みの度合い
     * @returns {Polygon} 生成されたポリゴン
     */
    #generatePolygon(width, roundness) {
        const { p1, p2 } = this.skeleton;

        const radius = width / 2; // 幅の半分を半径として使用
        const alpha = angle(subtract(p1, p2)); // 線分の角度を取得
        const alpha_cw = alpha + Math.PI / 2; // 右側（時計回り）
        const alpha_ccw = alpha - Math.PI / 2; // 左側（反時計回り）

        const points = [];
        const step = Math.PI / Math.max(1, roundness); // 丸みの度合いに応じたステップサイズ
        const esp = step / 2; // 誤差補正のためのオフセット

        // 左側の頂点を計算
        for (let i = alpha_ccw; i <= alpha_cw + esp; i += step) {
            points.push(translate(p1, i, radius));
        }

        // 右側の頂点を計算
        for (let i = alpha_ccw; i <= alpha_cw + esp; i += step) {
            points.push(translate(p2, Math.PI + i, radius));
        }

        return new Polygon(points); // 計算した頂点からポリゴンを生成
    }

    /**
     * ポリゴンを描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {object} options - 描画オプション
     */
    draw(ctx, options) {
        this.poly.draw(ctx, options); // ポリゴンを描画
        // this.poly.drawSegment(ctx); // 必要なら線分を描画
    }
}
