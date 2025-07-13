/**
 * World クラス
 * グラフ（道路の構造）を基に、道路の形状を生成し描画するクラス。
 * - `generate()`: グラフの線分を元に道路のポリゴンを作成
 * - `draw(ctx)`: キャンバス上に道路を描画
 */
class World {
    /**
     * @param {Graph} graph - 道路の構造を表すグラフ（点と線の集合）
     * @param {number} roadWidth - 道路の幅（デフォルト: 100）
     * @param {number} roadRoudness - 道路の丸み（デフォルト: 15）
     * constructor(graph, roadWidth = 100, roadRoudness = 15, buildingWidth = 150, buildingMinLength = 150, spacing = 50, treeSize = 160, maxTreeCount = 5, season = Season.fromString("summer"))

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
        this.graph = graph; // 道路の構造を表すグラフ
        this.roadWidth = roadWidth; // 道路の幅
        this.roadRoudness = roadRoudness; // 道路の丸み
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;
        this.treeSize = treeSize;
        this.maxTreeCount = maxTreeCount;
        this.season = season;

        this.envelopes = []; // 道路のポリゴン（Envelope）のリスト
        this.roadBordars = []; // 道路の境界線（Segment）のリスト
        this.building = [];
        this.trees = [];
        this.laneGuides=[];
        this.markings=[];

        this.checkPolys = [];//debug
        this.generate(); // 道路の形状を生成
    }

    setSeason(season) {
        this.season = season;
    }


    /**
     * グラフの線分を元に道路のポリゴンを作成
     */
    generate() {
        this.envelopes.length = 0; // 既存のポリゴンをクリア
        for (const seg of this.graph.segments) {
            this.envelopes.push(
                new Envelope(seg, this.roadWidth, this.roadRoudness) // 各線分に対して Envelope を作成
            );
        }

        // 道路の境界線を計算（ポリゴンの統合）
        this.roadBordars = Polygon.union(this.envelopes.map((e) => e.poly));
        this.buildings = this.#generateBuildings();
        this.maxTreeCount = this.#generrateTreeCount();
        this.trees = this.#generateTrees();
        this.checkPolys = this.#genetatedebug();

        this.laneGuides.length=0;
        this.laneGuides.push(...this.#generateLaneGuides());
    }

    #generateLaneGuides(){
        const tmpEnvelopes = [];
        for (const seg of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    seg,
                    this.roadWidth / 2,
                    this.roadRoudness
                )
            );
        }

        const segments = Polygon.union(tmpEnvelopes.map((e) => e.poly));
        return segments;
    }

    /**
     * ポリゴンの境界を取得
     * @returns {Object} { left, right, top, bottom }
     */
    #getBoundingBox() {
        const points = [
            ...this.roadBordars.map((s) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.base.points).flat()
        ];
        return {
            left: Math.min(...points.map((p) => p.x)),
            right: Math.max(...points.map((p) => p.x)),
            top: Math.min(...points.map((p) => p.y)),
            bottom: Math.max(...points.map((p) => p.y))
        };
    }


    #generrateTreeCount() {
        const { left, right, top, bottom } = this.#getBoundingBox();
        let x = Math.abs(left - right);
        let y = Math.abs(top - bottom);
        let xCount = x / (this.treeSize * 2);
        let yCount = y / (this.treeSize * 2);
        return Math.floor(xCount + yCount);
    }

    #genetatedebug(count = 10) {//debug
        const { left, right, top, bottom } = this.#getBoundingBox();
        const checkPolys = [];
        checkPolys.push(new Polygon([new Point(left, top), new Point(right, top),
        new Point(right, bottom), new Point(left, bottom)]));
        return checkPolys;
    }


    #generateTrees() {
        const treeSize = this.season.getSize(this.treeSize);
        const { left, right, top, bottom } = this.#getBoundingBox();
        // console.log("roadBordarsの長さ:", this.roadBordars.length);
        // console.log("roadBordars変換後:", this.roadBordars.map((s) => [s.p1, s.p2]).flat().length);
        // console.log("buildingsの長さ:", this.buildings.length);
        // console.log("buildings変換後:", this.buildings.map((b) => b.points).flat().length);
        // console.log("最終的なpointsの数:", points.length);
        // console.log(points)

        const illegalPolys = [
            ...this.buildings.map((b) => b.base),
            ...this.envelopes.map((e) => e.poly)
        ];

        const trees = [];
        let tryCount = 0;
        let treeCount = 0;
        while (tryCount < 100 && treeCount < this.maxTreeCount) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(bottom, top, Math.random())
            );
            let keep = true;

            //気が道路や建物に近すぎないか
            for (const poly of illegalPolys) {
                if (poly.containsPoint(p) || poly.distanceToPoint(p) < treeSize / 2) {
                    keep = false;
                    break;
                }
            }

            //木と木が近すぎないか
            if (keep) {
                for (const tree of trees) {
                    if (distance(tree.center, p) < treeSize) {
                        keep = false;
                        break;
                    }
                }
            }

            //木が道路から離れすぎていないか
            if (keep) {
                let closeToSomething = false;
                for (const poly of illegalPolys) {
                    if (poly.distanceToPoint(p) < treeSize * 2.0) {
                        closeToSomething = true;
                        break;
                    }
                }
                keep = closeToSomething;
            }

            if (keep) {
                switch (this.season.getSeason()) {
                    case "spring":
                        trees.push(new BroadleafTree(p, treeSize, this.season.getColor()));
                        break;
                    case "summer":
                        trees.push(new BroadleafTree(p, treeSize, this.season.getColor()));
                        break;
                    case "autumn":
                        trees.push(new BroadleafTree(p, treeSize, this.season.getColor()));
                        break;
                    case "winter":
                        trees.push(new PineTree(p, treeSize, this.season.getColor()));
                        break;
                }
                tryCount = 0;
                treeCount++; ""
            }
            tryCount++;

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




    /**
     * キャンバス上に道路を描画
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     */
    draw(ctx, viewPoint) {
        // 道路のポリゴンを描画
        for (const env of this.envelopes) {
            env.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }

        for(const marking of this.markings){
            marking.draw(ctx,{ color: "white"});
        }
        

        // 道路の中心線を描画（破線）
        for (const seg of this.graph.segments) {
            seg.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
        }

        // 道路の境界線を描画
        for (const seg of this.roadBordars) {
            seg.draw(ctx, { color: "white", width: 4 });
        }

        const items = [...this.buildings, ...this.trees];
        items.sort(
            (a, b) =>
                b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint)
        );

        for (const item of items) {
            item.draw(ctx, viewPoint);
        }


        //debugの確認
        // for (const d of this.laneGuides) {//debug
        //     d.draw(ctx,{color:"red"});
        // }

    }
}
