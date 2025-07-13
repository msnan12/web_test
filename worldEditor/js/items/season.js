/**
 * Season クラス
 * - createTree(point,size): この季節に生える木を生成
 */
class Season {
    /**
     * @param {string} name
     * @param {number} sizeModifier
     * @param {string} color
     * @param {function(Point,number,string):Tree} makeTree - 木のファクトリ関数
     */
    constructor(name, sizeModifier, color, makeTree) {
        this.name = name;
        this.sizeModifier = sizeModifier;
        this.color = color;
        this.makeTree = makeTree;
    }

    
    static fromString(seasonName) {
        const map = {
            spring: new Season("spring", 1.8, "rgb(213,111,191)", (p,s,c)=> new BroadleafTree(p,s,c)),
            summer: new Season("summer", 2.0, "rgb(30,180,70)", (p,s,c)=> new BroadleafTree(p,s,c)),
            autumn: new Season("autumn", 1.4, "rgb(209,132,0)",(p,s,c)=> new BroadleafTree(p,s,c)),
            winter: new Season("winter", 1.0, "rgb(89,74,39)", (p,s,c)=> new PineTree(p,s,c)),
        };
        console.log("season clrate");
        return map[seasonName] || map.spring;
    }

    getSize(base) { return base * this.sizeModifier; }

    createTree(point, size) { return this.makeTree(point, size, this.color); }
}

