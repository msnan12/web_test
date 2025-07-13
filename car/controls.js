class Controls {
    constructor(type) {
        // 進行方向の入力状態（trueで押されている）
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;

        // 制御タイプに応じて挙動を分岐
        switch(type) {
            case "KEYS":
                // キーボードによる手動操作モード
                this.#addKeybordListeners();
                break;
            case "DUMMY":
                // 自動直進モード（AI学習用など）
                this.forward = true;
                break;
        }
    }

    // キーボードイベントのリスナーを追加する（プライベートメソッド）
    #addKeybordListeners() {
        // キーが押されたときの処理
        document.onkeydown = (event) => {
            switch(event.key) {
                case "ArrowLeft":
                    this.left = true; // ←キー
                    break;
                case "ArrowRight":
                    this.right = true; // →キー
                    break;
                case "ArrowUp":
                    this.forward = true; // ↑キー
                    break;
                case "ArrowDown":
                    this.reverse = true; // ↓キー
                    break;
            }
            console.table(this); // 状態を確認したいとき用
        }

        // キーが離されたときの処理
        document.onkeyup = (event) => {
            switch(event.key) {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
            }
            // console.table(this); // 状態を確認したいとき用
        }
    }
}
