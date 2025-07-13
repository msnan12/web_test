/**
 * GraphEditor クラス
 * キャンバス上でグラフ（点と線）を編集するためのクラス。
 * - `mousedown` でポイントを選択・追加・削除
 * - `mousemove` でポイントをドラッグ
 * - `display()` でグラフを描画
 */
class GraphEditor {
    /**
     * @param {Viewport} viewport - キャンバスの表示領域
     * @param {Graph} graph - 編集対象のグラフ（点と線の集合）
     */
    constructor(viewport, graph) {
        this.viewport = viewport;  // キャンバス要素の参照
        this.canvas = viewport.canvas;
        this.graph = graph;  // グラフ（点と線の集合）の参照

        this.ctx = this.canvas.getContext("2d");  // 2D描画コンテキストを取得

        this.selected = null; // 選択されたポイント
        this.hoverd = null;   // マウスホバー中のポイント
        this.dragging = false; // ドラッグ状態フラグ
        this.mouse = null;

    }

    enable(){
        this.#addEventListeners();
    }

    disable(){
        this.#removeEventListeners();
        this.selected=false;
        this.hoverd=false;
    }
    /**
     * イベントリスナー有効か
     */
    #addEventListeners() {
        this.handleMouseDownBound = this.#handleMouseDown.bind(this);
        this.handleMouseMoveBound = this.#handleMouseMove.bind(this);
        this.handleContextMenuBound = (evt) => evt.preventDefault();
        this.handleMouseUpBound = () => { this.dragging = false; };
        this.canvas.addEventListener("mousedown", this.handleMouseDownBound);
        this.canvas.addEventListener("mousemove", this.handleMouseMoveBound);
        this.canvas.addEventListener("contextmenu", this.handleContextMenuBound);
        this.canvas.addEventListener("mouseup", this.handleMouseUpBound);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.handleMouseDownBound);
        this.canvas.removeEventListener("mousemove", this.handleMouseMoveBound);
        this.canvas.removeEventListener("contextmenu", this.handleContextMenuBound);
        this.canvas.removeEventListener("mouseup", this.handleMouseUpBound);
    }



    /**
     * マウス移動時の処理
     * @param {MouseEvent} evt - マウスイベント
     */
    #handleMouseMove(evt) {
        if (this.viewport.spaceKeyActive) return; // スペースキーが押されているときは動作しない

        this.mouse = this.viewport.getMouse(evt, true); // マウス位置を取得
        this.hoverd = getNearestPoint(this.mouse, this.graph.points, 10 * this.viewport.zoom); // 近くのポイントを取得

        if (this.dragging) {
            // ドラッグ中のポイントの位置を更新
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }

    /**
     * マウスクリック時の処理
     * @param {MouseEvent} evt - マウスイベント
     */
    #handleMouseDown(evt) {
        if (this.viewport.spaceKeyActive) return; // スペースキーが押されているときは動作しない

        if (evt.button === 2) { // 右クリック
            if (this.selected) {
                this.selected = null;
            } else if (this.hoverd) {
                this.#removePoint(this.hoverd); // ホバーしているポイントを削除
            }
        }

        if (evt.button === 0) { // 左クリック
            if (this.hoverd) {
                this.#selected(this.hoverd);
                this.dragging = true; // ドラッグ開始
                return;
            }
            this.graph.addPoint(this.mouse); // 新しいポイントを追加
            this.#selected(this.mouse);
            this.hoverd = this.mouse; // 追加したポイントにホバー状態を設定
        }
    }

    /**
     * ポイントを選択し、必要なら線を追加
     * @param {Point} point - 選択するポイント
     */
    #selected(point) {
        if (this.selected) {
            this.graph.tryAddSegment(new Segment(this.selected, point)); // 選択されたポイント間に線を追加
        }
        this.selected = point;
    }

    /**
     * 指定されたポイントをグラフから削除
     * @param {Point} point - 削除するポイント
     */
    #removePoint(point) {
        this.graph.removePoint(point);
        this.hoverd = null; // ホバー状態をリセット
        if (this.selected === point) {
            this.selected = null; // 選択ポイントをリセット
        }
    }

    /**
     * グラフを破棄（リセット）
     */
    dispose() {
        this.graph.dispose();
        this.selected = null;
        this.hoverd = null;
    }

    /**
     * グラフを描画
     */
    display() {
        this.graph.draw(this.ctx); // グラフを描画

        if (this.hoverd) {
            this.hoverd.draw(this.ctx, { fill: true }); // ホバーしているポイントを強調表示
        }

        if (this.selected) {
            const intent = this.hoverd ? this.hoverd : this.mouse;
            new Segment(this.selected, intent).draw(this.ctx, { dash: [3, 3] });
            this.selected.draw(this.ctx, { outline: true }); // 選択されたポイントを枠表示
        }
    }
}
