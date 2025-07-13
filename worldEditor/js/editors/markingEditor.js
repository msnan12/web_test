class MarkingEditor{
    constructor(viewport,world){
        this.viewport=viewport;
        this.world=world;
        // this.targetSegments=targetSegments;

        this.canvas=viewport.canvas;
        this.ctx=this.canvas.getContext("2d");

        this.mouse=null;
        this.intent=null;
        this.markings=world.markings;
    }

    get targetSegments() {
        return this.world.laneGuides;
    }

    createMarking(center,directionVector){
        console.warn("MarkingEditor.createMarking() はサブクラスでオーバーライドしてください");
        return center;
    }
     enable(){
        this.#addEventListeners();
    }

    disable(){
        this.#removeEventListeners();
        this.intent=null;
    }
    /**
     * イベントリスナー有効か
     */
    #addEventListeners() {
        this.handleMouseDownBound = this.#handleMouseDown.bind(this);
        this.handleMouseMoveBound = this.#handleMouseMove.bind(this);
        this.handleContextMenuBound = (evt) => evt.preventDefault();
        this.canvas.addEventListener("mousedown", this.handleMouseDownBound);
        this.canvas.addEventListener("mousemove", this.handleMouseMoveBound);
        this.canvas.addEventListener("contextmenu", this.handleContextMenuBound);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.handleMouseDownBound);
        this.canvas.removeEventListener("mousemove", this.handleMouseMoveBound);
        this.canvas.removeEventListener("contextmenu", this.handleContextMenuBound);
    }

    /**
     * マウス移動時の処理
     * @param {MouseEvent} evt - マウスイベント
     */
    #handleMouseMove(evt) {
        if (this.viewport.spaceKeyActive) return; // スペースキーが押されているときは動作しない

        this.mouse = this.viewport.getMouse(evt, true); // マウス位置を取得
        const seg = getNearestSegment(
            this.mouse, 
            this.targetSegments, 
            20 * this.viewport.zoom
        ); // 近くのsegumentを取得
        if(seg){
            const proj=seg.projectPoint(this.mouse);
            if(proj.offset >= 0 && proj.offset<=1){
                this.intent= this.createMarking(
                    proj.point,
                    seg.directionVector()
                )
            }else{
                this.intent=null
            };
        }else{
            this.intent=null;
        }
        
    }

    /**
     * マウスクリック時の処理
     * @param {MouseEvent} evt - マウスイベント
     */
    #handleMouseDown(evt) {
        if (this.viewport.spaceKeyActive) return; // スペースキーが押されているときは動作しない

        if(evt.button==0){
            if(this.intent){
                // console.log(this.intent);
                this.markings.push(this.intent);
                this.intent=null;
            }
        }
        if(evt.button==2){
            for(let i=0;i<this.markings.length;i++){
                const poly=this.markings[i].poly;
                if(poly.containsPoint(this.mouse)){
                    this.markings.splice(i,1);
                    break;
                }
            }
        }
    }


    display(){
        if(this.intent){
            this.intent.draw(this.ctx);
        }
    }
}