/**
 * ViewPort クラス
 * キャンバスの表示領域を管理し、ズームやドラッグによる移動を制御するクラス。
 * - `reset()` : 描画前にキャンバスを初期化し、中心移動・ズーム・オフセットを適用
 * - `getMouse(evt, subtractDragOffset)` : マウスのスクリーン座標を論理座標で取得
 * - `getOffset()` : 現在のドラッグ／オフセットを含む合成オフセットを取得
 * - `#handleMouseWheel(evt)` : ホイール操作によるズーム（マウス位置を中心に補正）
 * - `#handleMouseMove(evt)` : ドラッグ中の座標差分を計算
 * - `#handleMouseDown(evt)`, `#handleMouseUp(evt)` : ドラッグ開始・終了
 * - `#handleKeyDown(evt)`, `#handleKeyUp(evt)` : スペースキーでドラッグモード切替、Ctrlキーでズーム制御
 */
class ViewPort {
    constructor(canvas,zoom=1,offset=null) {
        this.canvas = canvas;
        this.ctx    = canvas.getContext("2d");

        // ズーム倍率（1=100%）
        this.zoom = zoom;
        // キャンバスの中心点（原点移動用）
        this.center = new Point(canvas.width / 2, canvas.height / 2);
        // オフセット（ドラッグ移動量を反映）
        this.offset = offset ? offset : scale(this.center, -1);
        // スペースキー押下中かどうか
        this.spaceKeyActive = false;

        // ドラッグ情報を初期化
        this.drag = {
            start:  new Point(0, 0),
            end:    new Point(0, 0),
            offset: new Point(0, 0),
            active: false
        };

        // private メソッドを bind して public プロパティとして保持
        this.handleMouseWheel = this.#handleMouseWheel.bind(this);
        this.handleMouseDown  = this.#handleMouseDown.bind(this);
        this.handleMouseUp    = this.#handleMouseUp.bind(this);
        this.handleMouseMove  = this.#handleMouseMove.bind(this);
        this.handleKeyDown    = this.#handleKeyDown.bind(this);
        this.handleKeyUp      = this.#handleKeyUp.bind(this);

        // イベントリスナーを登録
        this.#addEventListeners();
    }

    /**
     * 描画前にキャンバスをリセットし、中心移動→ズーム→オフセットを適用
     */
    reset() {
        // 全消去
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        // 原点をキャンバス中央に移動
        this.ctx.translate(this.center.x, this.center.y);
        // ズーム倍率を適用（逆数を使うことで「カメラ視点」のように動作）
        this.ctx.scale(1 / this.zoom, 1 / this.zoom);
        // 現在のドラッグオフセットを適用
        const offset = this.getOffset();
        this.ctx.translate(offset.x, offset.y);
    }

    /**
     * マウス位置を「論理座標」に変換して取得
     * @param {MouseEvent} evt
     * @param {boolean} subtractDragOffset - ドラッグオフセットを引くか
     */
    getMouse(evt, subtractDragOffset = false) {
        // スクリーン座標 → 中心原点 → ズーム → オフセット の逆変換
        const p = new Point(
            (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
            (evt.offsetY - this.center.y) * this.zoom - this.offset.y
        );
        return subtractDragOffset
            ? subtract(p, this.drag.offset)
            : p;
    }

    /** 現在のオフセット（ドラッグ中も含む）を取得 */
    getOffset() {
        return add(this.offset, this.drag.offset);
    }

    /** イベントリスナーを一括登録 */
    #addEventListeners() {
        this.canvas.addEventListener("wheel",     this.handleMouseWheel);
        this.canvas.addEventListener("mousedown", this.handleMouseDown);
        this.canvas.addEventListener("mouseup",   this.handleMouseUp);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup",   this.handleKeyUp);
    }

    /** イベントリスナーを解除したいときに呼ぶ */
    destroy() {
        this.canvas.removeEventListener("wheel",     this.handleMouseWheel);
        this.canvas.removeEventListener("mousedown", this.handleMouseDown);
        this.canvas.removeEventListener("mouseup",   this.handleMouseUp);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup",   this.handleKeyUp);
    }

    /** ドラッグ開始判定 */
    #handleMouseDown(evt) {
        // スペースキー押しながら左クリック、または通常時は中クリック
        if ((this.spaceKeyActive && evt.button === 0) ||
            (!this.spaceKeyActive && evt.button === 1)) {
            this.drag.start  = this.getMouse(evt);
            this.drag.active = true;
        }
    }

    /** ドラッグ終了時のオフセット確定 */
    #handleMouseUp(evt) {
        if (this.drag.active) {
            // ドラッグ中のオフセットを累積オフセットに追加
            this.offset = add(this.offset, this.drag.offset);
            // ドラッグ情報をリセット
            this.drag = {
                start:  new Point(0, 0),
                end:    new Point(0, 0),
                offset: new Point(0, 0),
                active: false
            };
        }
    }

    /** ドラッグ中の移動量を更新 */
    #handleMouseMove(evt) {
        if (this.drag.active) {
            this.drag.end    = this.getMouse(evt);
            // 2点間の差分をオフセットとして保持
            this.drag.offset = subtract(this.drag.end, this.drag.start);
        }
    }

    /** マウスホイールでズーム；中心補正付き */
    #handleMouseWheel(evt) {
        evt.preventDefault();  // ページスクロール防止

        const oldZoom = this.zoom;
        const dir     = Math.sign(evt.deltaY);
        const step    = 0.1;
        const newZoom = Math.max(1, Math.min(5, oldZoom + dir * step));
        if (newZoom === oldZoom) return;  // 変化なしなら無視

        // ズーム前のマウス位置（論理座標）
        const mouseBefore = this.getMouse(evt);

        // 実際のズーム値を更新
        this.zoom = newZoom;

        // ズーム後も同じスクリーン位置が同じ論理位置を指すよう補正
        const mouseAfter = this.getMouse(evt);
        const delta      = subtract(mouseAfter, mouseBefore);
        this.offset      = subtract(this.offset, delta);
    }

    /** キー押下：スペース押しでドラッグモードに */
    #handleKeyDown(evt) {
        if (evt.key === " ") {
            this.spaceKeyActive = true;
        }
        // Ctrl + "-" / ";" でズーム調整（任意機能）
        if (evt.ctrlKey) {
            evt.preventDefault();
            if (evt.key === "-") {
                this.zoom = Math.min(5, this.zoom + 1);
            } else if (evt.key === ";") {
                this.zoom = Math.max(1, this.zoom - 1);
            }
        }
    }

    /** スペースキー離しでドラッグモード解除 */
    #handleKeyUp(evt) {
        if (evt.key === " ") {
            this.spaceKeyActive = false;
            // ドラッグ状態をクリア
            this.drag = {
                start:  new Point(0, 0),
                end:    new Point(0, 0),
                offset: new Point(0, 0),
                active: false
            };
        }
    }
}
