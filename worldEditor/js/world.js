/**
 * World クラス
 * グラフ（道路の構造）を基に、道路の形状を生成し描画するクラス。
 * - `generate()`: グラフの線分を元に道路のポリゴンを作成
 * - `draw(ctx)`: キャンバス上に道路を描画
 */
class World {
    /**
     * @param {Graph} graph - 道路の構造を表すグラフ（点と線の集合）
     * @param {Season} season - 季節を表す Season インスタンス（木の生成を委譲）
     * @param {number} roadWidth
     * @param {number} roadRoudness
     * @param {number} buildingWidth
     * @param {number} buildingMinLength
     * @param {number} spacing
     * @param {number} treeSize
     * @param {number} maxTreeCount
     */
    constructor(
        graph,
        season,
        roadWidth = 100,
        roadRoudness = 15,
        buildingWidth = 150,
        buildingMinLength = 150,
        spacing = 50,
        treeSize = 160,
        maxTreeCount = 5
    ) {
        this.graph = graph;
        this.season = season;
        this.roadWidth = roadWidth;
        this.roadRoudness = roadRoudness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;
        this.treeSize = treeSize;
        this.maxTreeCount = maxTreeCount;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = [];
        this.laneGuides = [];
        this.markings = [];
        this.checkPolys = [];
        
        this.frameCount=0;

        this.generate();
    }

    static load(info){
        console.log("ロード開始");
        const season = Season.fromString(info.season.name || "spring");
        const world=new World(new Graph(),season);
        world.graph  = Graph.load(info.graph);
        world.roadWidth = info.roadWidth;
        world.roadRoudness = info.roadRoudness;
        world.buildingWidth = info.buildingWidth;
        world.buildingMinLength = info.buildingMinLength;
        world.spacing = info.spacing;
        world.treeSize = info.treeSize;
        world.maxTreeCount = info.maxTreeCount;
        world.envelopes=info.envelopes.map((e)=>Envelope.load(e));
        world.roadBorders=info.roadBorders.map((b)=>new Segment(b.p1,b.p2));
        world.buildings=info.buildings.map((e)=>Building.load(e));
        world.trees=info.trees.map((t)=>season.createTree(t.center, t.size));
        world.laneGuides=info.laneGuides.map((g)=>new Segment(g.p1,g.p2));
        world.markings=info.markings.map((m)=>Marking.load(m));
        world.zoom=info.zoom;
        world.offset=info.offset;
        return world;
    }

    setSeason(season) {
        this.season = season;
    }

    /**
     * 道路・建物・木などをまとめて生成
     */
    generate() {
        // envelopes: Envelope インスタンスからポリゴンを生成
        this.envelopes = this.graph.segments.map(
            seg => new Envelope(seg, this.roadWidth, this.roadRoudness)
        );
        // 道路境界線を統合
        this.roadBorders = Polygon.union(this.envelopes.map(e => e.poly));
        // 建物生成
        this.buildings = this.#generateBuildings();
        // 木生成
        this.maxTreeCount = this.#generateTreeCount();
        this.trees = this.#generateTrees();
        // デバッグ用ポリゴン
        this.checkPolys = this.#generateDebug();
        // レーンガイド
        this.laneGuides = this.#generateLaneGuides();
    }

    #generateLaneGuides() {
        const tmp = this.graph.segments.map(
            seg => new Envelope(seg, this.roadWidth / 2, this.roadRoudness)
        );
        return Polygon.union(tmp.map(e => e.poly));
    }

    #getBoundingBox() {
        const pts = [
            ...this.roadBorders.flatMap(s => [s.p1, s.p2]),
            ...this.buildings.flatMap(b => b.base.points)
        ];
        return {
            left: Math.min(...pts.map(p => p.x)),
            right: Math.max(...pts.map(p => p.x)),
            top: Math.min(...pts.map(p => p.y)),
            bottom: Math.max(...pts.map(p => p.y))
        };
    }

    #generateTreeCount() {
        const { left, right, top, bottom } = this.#getBoundingBox();
        const dx = Math.abs(right - left);
        const dy = Math.abs(bottom - top);
        const count = Math.floor(dx / (this.treeSize * 2) + dy / (this.treeSize * 2));
        return count;
    }

    #generateDebug(count = 10) {
        const { left, right, top, bottom } = this.#getBoundingBox();
        return [
            new Polygon([
                new Point(left, top),
                new Point(right, top),
                new Point(right, bottom),
                new Point(left, bottom)
            ])
        ];
    }

    /**
     * 木を配置: 季節オブジェクトの createTree にすべて委譲
     */
    #generateTrees() {
        const size = this.season.getSize(this.treeSize);
        const { left, right, top, bottom } = this.#getBoundingBox();

        const illegal = [
            ...this.buildings.map(b => b.base),
            ...this.envelopes.map(e => e.poly)
        ];

        const trees = [];
        let tries = 0;
        while (trees.length < this.maxTreeCount && tries < 100) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(bottom, top, Math.random())
            );
            let ok = true;
            illegal.forEach(poly => {
                if (ok && (poly.containsPoint(p) || poly.distanceToPoint(p) < size/2)) ok = false;
            });
            trees.forEach(tree => {
                if (ok && distance(tree.center, p) < size) ok = false;
            });
            // 場所が OK なら season.createTree でインスタンス取得
            if (ok) {
                const tree = this.season.createTree(p, size);
                trees.push(tree);
            }
            tries++;
        }
        return trees;
    }

    #generateBuildings() {
        const tmpEnvelopes = [];
        for (const seg of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    seg,
                    this.roadWidth + this.buildingWidth + this.spacing * 2,
                    this.roadRoudness
                )
            );
        }

        const guides = Polygon.union(tmpEnvelopes.map((e) => e.poly));

        for (let i = 0; i < guides.length; i++) {
            const seg = guides[i];
            if (seg.length() < this.buildingMinLength) {
                guides.splice(i, 1);
                i--;
            }
        }

        const supports = [];
        for (let seg of guides) {
            const len = seg.length() + this.spacing;
            const buildingCount = Math.floor(
                len / (this.buildingMinLength + this.spacing)
            );
            const buildingLength = len / buildingCount - this.spacing;
            const dir = seg.directionVector();

            let q1 = seg.p1;
            let q2 = add(q1, scale(dir, buildingLength));
            supports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++) {
                q1 = add(q2, scale(dir, this.spacing));
                q2 = add(q1, scale(dir, buildingLength));
                supports.push(new Segment(q1, q2));
            }
        }

        const bases = [];
        for (const seg of supports) {
            bases.push(new Envelope(seg, this.buildingWidth).poly);
        }

        const eps = 0.001;
        for (let i = 0; i < bases.length - 1; i++) {
            for (let j = i + 1; j < bases.length; j++) {
                if (
                    bases[i].intersectsPoly(bases[j]) ||
                    bases[i].distanceToPoly(bases[j]) < this.spacing - eps
                ) {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }

        return bases.map((b) => new Building(b));
    }

    #getIntersections(){
        const subset=[];
        for(const point of this.graph.points){
            let degree=0;
            for(const seg of this.graph.segments){
                if(seg.includes(point)){
                    degree++;
                }
            }

            if(degree>2){
                subset.push(point);
            }
        }
        //console.log(subset);
        return subset;
    }

    #updateLights(){
        const lights = this.markings.filter(m=>m instanceof Light);
        const controlCenters=[];
        for(const light of lights){
            const point=getNearestPoint(light.center,this.#getIntersections());
            
            let controlCenter=controlCenters.find(c=>c.equals(point));
            if(!controlCenter){
                if(point){//コントロールセンターがない状態で信号を追加するとエラーで止まるのを回避
                    controlCenter=new Point(point.x,point.y);
                    controlCenter.lights=[light];
                    controlCenters.push(controlCenter);
                }
            }else{
                controlCenter.lights.push(light);
            }
            
        }

        const  greenDuration=5, yellowDuration=2;
        for(const center of controlCenters){
            center.ticks=center.lights.length*(greenDuration+yellowDuration);
        }


        const tick=Math.floor(this.frameCount/60);
        for(const center of controlCenters){
            const cTick=tick%center.ticks;
            const greenYellowIndex=Math.floor(cTick/(greenDuration+yellowDuration));
            const greenYellowState=cTick%(greenDuration+yellowDuration)<greenDuration?"green":"yellow";
            for(let i=0;i<center.lights.length;i++){
                if(i==greenYellowIndex){
                    center.lights[i].state=greenYellowState;
                }else{
                    center.lights[i].state="red";
                }
            }
        }
        this.frameCount++;
    }
    

    /**
     * Canvas に全アイテムを描画
     */
    draw(ctx, viewPoint) {
        this.#updateLights();
        // 道路
        this.envelopes.forEach(env => env.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth:15 }));
        // マーキング
        this.markings.forEach(m => m.draw(ctx,{ color:"white" }));
        // 中心線
        this.graph.segments.forEach(seg => seg.draw(ctx,{ color:"white", width:4, dash:[10,10] }));
        // 境界線
        this.roadBorders.forEach(seg => seg.draw(ctx,{ color:"white", width:4 }));
        // 建物 & 木
        [...this.buildings, ...this.trees]
            .sort((a,b)=> b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint))
            .forEach(item=> item.draw(ctx, viewPoint));
    }
}
