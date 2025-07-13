class Season {
    constructor(name, sizeModifier, color, temperature) {
        this.name = name; // "spring", "summer", etc.
        this.sizeModifier = sizeModifier; // 木のサイズに影響
        this.color = color; // 季節の特徴的な色
        this.temperature = temperature; // 気温
    }

    getSize(baseSize) {
        return baseSize * this.sizeModifier;
    }

    getSeason() {
        return this.name;
    }

    getColor() {
        return this.color;
    }

    static fromString(seasonName) {
        const seasons = {
            spring: new Season("spring", 1.8, "rgb(213, 111, 191)", 15),
            summer: new Season("summer", 2.0, "rgb(30,180,70)", 30),
            autumn: new Season("autumn", 1.4, "rgb(209, 132, 0)", 10),
            winter: new Season("winter", 1.0, "rgb(89, 74, 39)", -5),
        };
        return seasons[seasonName] || new Season("default", 1, "gray", 0);
    }
}


