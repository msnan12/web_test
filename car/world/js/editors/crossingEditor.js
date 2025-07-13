// CrossingEditor.js
class CrossingEditor extends MarkingEditor {
    constructor(viewport, world) {
        // laneGuides を使うまま
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        // ① 道路に垂直な単位ベクトルを計算
        const perp = perpendicular(directionVector);
        const len  = Math.hypot(perp.x, perp.y);
        const unit = { x: perp.x / len, y: perp.y / len };

        // ② roadWidth / 4 だけ内側へ移動（－符号で中心方向）
        const correctedCenter = add(center, scale(unit, this.world.roadWidth / 4));

        // ③ その中心で Crossing を生成
        return new Crossing(
            correctedCenter,          // ← 修正後の中心点
            directionVector,
            this.world.roadWidth,     // 幅は道路幅
            this.world.roadWidth / 2  // 太さ（＝横断歩道の長さ）
        );
    }
}
