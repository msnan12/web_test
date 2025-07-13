class Tree {
    constructor(center, size, color, height = 200) {
        this.center = center;
        this.size = size;
        this.color = color;
        this.height = height
        this.base = this._generateLevel(center, size, 1);
    }

    _generateLevel(point, size, noize) {
        const points = [];
        const rad = size / 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
            const kindOfRandom = Math.cos(((a + this.center.x) * size) % 17) ** 2;
            const noisyRadius = rad * lerp(noize, 1, kindOfRandom);
            points.push(translate(point, a, noisyRadius));
        }
        return new Polygon(points);
    }


    draw(ctx, viewPoint) {
        console.warn("Tree.draw() はサブクラスでオーバーライドしてください");
    }
}

// 松の木（細長い三角形の葉）
class PineTree extends Tree {
    draw(ctx, viewPoint) {
        const top = getFake3DPoint(this.center, viewPoint, this.height);

        const levelCount = 10;
        for (let level = 0; level < levelCount; level++) {
            const t = level / (levelCount - 1);
            const point = lerp2D(this.center, top, t);

            //0~3は幹
            if (level < 3) {
                point.draw(ctx, { size: this.size / 5, color: "rgba(148,98,50,100)" });
            } else {
                const color = "rgb(30," + lerp(30, 120, t) + ",70)";
                const size = lerp(this.size, 40, t);
                const poly = this._generateLevel(point, size, 0.5);
                if (level === 3) {
                    this.base = this._generateLevel(point, size, 0.5);
                }
                poly.draw(ctx, { fill: color, stroke: "rgba(0,0,0,0)" });
            }

        }

    }
}

// 広葉樹（丸い葉と太い幹）
class BroadleafTree extends Tree {
    draw(ctx, viewPoint) {
        const top = getFake3DPoint(this.center, viewPoint, this.height);

        const levelCount = 10;
        let temp = this.color.match(/\d+/g).map(Number);
        for (let level = 0; level < levelCount; level++) {
            const t = level / (levelCount - 1);
            const point = lerp2D(this.center, top, t);
            let diffZize = 0;
            let sizeMax = false;
            //0~3は幹
            if (level < 5) {
                point.draw(ctx, { size: this.size / 5, color: "rgba(148,98,50,100)" });
            } else {
                const color = "rgb(" + temp[0] + "," + lerp(temp[1], Math.min(temp[1] + 80, 255), t) + "," + temp[2] + ")";
                switch (level) {
                    case 4:
                        diffZize = this.size * 0.6;
                        break;
                    case 5:
                        diffZize = this.size * 0.6;
                        break;
                    case 6:
                        diffZize = this.size * 0.8;
                        break;
                    case 7:
                        diffZize = this.size * 0.9;
                        sizeMax = true;
                        break;
                    case 8:
                        diffZize = this.size * 0.7;
                        break;
                    case 9:
                        diffZize = this.size * 0.5;
                        break;
                }
                const size = lerp(this.size, diffZize, t);
                const poly = this._generateLevel(point, size, 0.8);
                if (sizeMax) {
                    this.base = this._generateLevel(point, size, 0.8);
                    sizeMax = false;
                }

                poly.draw(ctx, { fill: color, stroke: "rgba(0,0,0,0)" });

            }
        }
    }
}

// 枯れ木（幹だけ）
class DeadTree extends Tree {
    draw(ctx, viewPoint) {
        const top = getFake3DPoint(this.center, viewPoint, this.height);

        // 幹のみ
        new Segment(this.center, top).draw(ctx, { stroke: "gray", width: 5 });
    }
}
