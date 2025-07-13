class SketchPad{
    constructor(container,undoBtn,size=400){
        this.undoBtn = undoBtn;
        this.canvas=document.createElement("canvas");
        this.canvas.width=size;
        this.canvas.height=size;
        this.canvas.style=`
            background-color:white;
            box-shadow:0px 0px 10px 2px black;
            touch-action: none;
        `;
        container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
        this.currentColor = "black";
        this.history = [];
        this.paths=[];
        this.#saveHistory(); // 最初の状態を保存
        this.#updateUndoButton();

        this.#addEventListeners();
    }

    #addEventListeners() {
        let isDrawing = false;
        let hasDrawn = false;

        const getPos = (evt) => {
            const rect = this.canvas.getBoundingClientRect();
            return [
                Math.round(evt.clientX - rect.left),
                Math.round(evt.clientY - rect.top)
            ];
        };

        this.canvas.addEventListener("pointerdown", (evt) => {
            isDrawing = true;
            hasDrawn = false;
            const mouse = getPos(evt);
            this.paths.push(mouse);
            this.#redraw();
        });

        this.canvas.addEventListener("pointermove", (evt) => {
            if (!isDrawing) return;

            const mouse = getPos(evt);
            const lastPath=this.paths[this.paths.length-1];
            lastPath.push(mouse);
            this.#redraw();
        });

        this.canvas.addEventListener("pointerup", () => {
            if (isDrawing && hasDrawn) {
                this.#saveHistory(); // ← ここだけで保存
            }
            isDrawing = false;
        });

        this.canvas.addEventListener("pointerleave", () => {
            if (isDrawing && hasDrawn) {
                this.#saveHistory(); // ← これを残すなら isDrawing 条件が必要！
            }
            isDrawing = false;
        });

        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.undo();
        });


        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "z") {
                this.undo();
            }
        });

    }

    #redraw(){
        this.ctx.clearRect(0,0,
            this.canvas.width,this.canvas.height);
        draw.paths(this.ctx,this.paths,this.currentColor);
    }

    // #saveHistory() {
    //     this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    //     // 履歴が多すぎると重いので適当に制限
    //     if (this.history.length > 10)this.history.shift();
    //         this.#updateUndoButton();
    
    // }

    // undo() {
    //     if (this.history.length < 2) return;
    //     this.history.pop(); // 現在の状態を捨てる
    //     const previous = this.history[this.history.length - 1];
    //     this.ctx.putImageData(previous, 0, 0);
    //     this.#updateUndoButton();
    // }
    undo(){
        this.paths.pop();
        this.#redraw();
    }

    // #updateUndoButton() {
    //     if (this.undoBtn) {
    //         const disabled = this.history.length < 2;
    //         this.undoBtn.disabled = disabled;
    //         this.undoBtn.classList.toggle("disabled", disabled);
    //     }
    // }
}