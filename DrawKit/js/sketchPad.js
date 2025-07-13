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
        this.paths=[];
        this.undoBtn.disabled=true;
        this.isDrawing = false;

        this.#addEventListeners();
    }

    reset(){
        this.paths=[];
        this.isDrawing = false;
        this.#redraw();
    }

    #addEventListeners() {
        const getPos = (evt) => {
            const rect = this.canvas.getBoundingClientRect();
            return [
                Math.round(evt.clientX - rect.left),
                Math.round(evt.clientY - rect.top)
            ];
        };

        this.canvas.addEventListener("pointerdown", (evt) => {
            this.isDrawing = true;
            const mouse = getPos(evt);
            this.paths.push([mouse]);
            // this.paths.push({
            //     color: this.currentColor,
            //     points: [mouse]
            // });
            this.#redraw();
        });

        this.canvas.addEventListener("pointermove", (evt) => {
            if (!this.isDrawing) return;

            const mouse = getPos(evt);
            const lastPath=this.paths[this.paths.length-1];
            lastPath.push(mouse);
            // lastPath.points.push(mouse);
            // this.#redraw();
            draw.path(this.ctx, lastPath,this.currentColor);

        });

        this.canvas.addEventListener("pointerup", () => {
            this.isDrawing = false;
        });

        this.canvas.addEventListener("pointerleave", () => {
            this.isDrawing = false;
        });

        this.undoBtn.onclick=()=>{
            this.undo();
        }

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
        draw.paths(this.ctx,this.paths);
        if(this.paths.length>0){
            this.undoBtn.disabled=false;
        }else{
            this.undoBtn.disabled=true;
        }
    }


    undo(){
        this.paths.pop();
        this.#redraw();
    }

}