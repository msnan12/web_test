/**
 * 指定した座標 `loc` に最も近いポイントを `points` 配列から探し、
 * その距離が閾値 (`threshold`) 以下の場合にその座標を返す。
 * @param {Point} loc - 基準となる座標
 * @param {Array<Point>} points - 検索対象のポイント配列
 * @param {number} threshold - 距離の閾値（デフォルトは最大値）
 * @returns {Point|null} 最も近いポイント（閾値以上の場合は null）
 */
function getNearestPoint(loc, points, threshold = Number.MAX_SAFE_INTEGER) {
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null;

    for (const point of points) {
        const dist = distance(point, loc);
        if (dist < minDist && dist < threshold) {
            minDist = dist;
            nearest = point;
        }
    }
    return nearest;
}

function getNearestSegment(loc, segments, threshold = Number.MAX_SAFE_INTEGER) {
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null;

    for (const seg of segments) {
        const dist =seg.distanceToPoint(loc);
        if (dist < minDist && dist < threshold) {
            minDist = dist;
            nearest = seg;
        }
    }
    return nearest;
}

/**
 * ユークリッド距離（直線距離）を計算する
 * 三平方の定理：
 * 𝑑=√(𝑥₂−𝑥₁)²+(𝑦₂−𝑦₁)²
 * @param {Point} p1 - 点1
 * @param {Point} p2 - 点2
 * @returns {number} 2点間の距離
 */
function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * 2つの座標を加算（ベクトルの加算）
 * @param {Point} p1 - 点1
 * @param {Point} p2 - 点2
 * @returns {Point} 加算後の新しい座標
 */
function add(p1, p2) {
    return new Point(p1.x + p2.x, p1.y + p2.y);
}

/**
 * 2つの座標を減算（ベクトルの減算）
 * @param {Point} p1 - 点1
 * @param {Point} p2 - 点2
 * @returns {Point} 減算後の新しい座標
 */
function subtract(p1, p2) {
    return new Point(p1.x - p2.x, p1.y - p2.y);
}

/**
 * 2つの座標（ベクトル）の内積を計算
 * 内積（dot product）は、2つのベクトルの方向と長さの関係を示す。
 * @param {Point} p1 - 点1（第1ベクトル）
 * @param {Point} p2 - 点2（第2ベクトル）
 * @returns {number} 内積の結果（p1.x * p2.x + p1.y * p2.y）
 */
function dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
}

/**
 * 座標のスケーリング（ベクトルの拡大・縮小）
 * @param {Point} p - 元の座標
 * @param {number} scaler - 拡大・縮小率
 * @returns {Point} 変換後の座標
 */
function scale(p, scaler) {
    return new Point(p.x * scaler, p.y * scaler);
}

/**
 * ベクトルを正規化（normalize）
 * ベクトルの大きさを 1 に保ちつつ、方向を維持する。
 * @param {Point} p - 正規化するベクトル
 * @returns {Point} 正規化されたベクトル（単位ベクトル）
 */
function normalize(p) {
    return scale(p, 1 / magnitude(p)); // ベクトルの長さで割ることで正規化
}

/**
 * ベクトルの大きさ（magnitude）を求める
 * ピタゴラスの定理を利用してベクトルの長さを計算する。
 * @param {Point} p - ベクトル
 * @returns {number} ベクトルの大きさ（長さ）
 */
function magnitude(p) {
    return Math.hypot(p.x, p.y); // √(x² + y²) を計算
}

/**
 * 指定した点 `p` の直交するベクトルを計算する関数。
 * x座標とy座標を入れ替え、y座標を反転させることで直交するベクトルを生成する。
 * 
 * @param {Point} p - 変換する元の点
 * @returns {Point} - 直交するベクトルを表す新しい Point オブジェクト
 */
function perpendicular(p) {
    return new Point(-p.y, p.x); // y座標を反転し、x座標と入れ替えることで90度回転したベクトルを生成
}



/**
 * 座標を指定した角度・距離分だけ移動
 * @param {Point} loc - 移動元の座標
 * @param {number} angle - 移動する角度（ラジアン）
 * @param {number} offset - 移動距離
 * @returns {Point} 変換後の座標
 */
function translate(loc, angle, offset) {
    return new Point(
        loc.x + Math.cos(angle) * offset, // X方向への移動
        loc.y + Math.sin(angle) * offset  // Y方向への移動
    );
}

/**
 * 座標の角度（偏角）を取得
 * @param {Point} p - 基準となる点
 * @returns {number} 角度（ラジアン単位）
 */
function angle(p) {
    return Math.atan2(p.y, p.x);
}

/**
 * 2点の平均（中点）を計算する
 * @param {Point} p1 - 点1
 * @param {Point} p2 - 点2
 * @returns {Point} 平均座標（中点）
 */
function average(p1, p2) {
    return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}

/**
 * 線形補間（Linear Interpolation）
 * `t` の割合に応じて、値 A から B へ補間する。
 * @param {number} A - 開始値
 * @param {number} B - 終了値
 * @param {number} t - 補間係数（0.0〜1.0）
 * @returns {number} 補間された値
 */
function lerp(A, B, t) {
    return A + (B - A) * t;
}

/**
 * 2D空間における2点 `A` と `B` の間の線形補間を行う関数。
 * `t` の値（0～1の範囲）に応じて、`A` から `B` の間の位置を計算する。
 * 
 * @param {Point} A - 補間の開始点
 * @param {Point} B - 補間の終了点
 * @param {number} t - 補間係数 (0.0 = A, 1.0 = B)
 * @returns {Point} - 補間された新しい座標
 */
function lerp2D(A, B, t) {
    return new Point(
        lerp(A.x, B.x, t),  // x座標の補間
        lerp(A.y, B.y, t)   // y座標の補間
    );
}

/**
 * 線形逆補間（Inverse Linear Interpolation）を行う関数。
 * 値 `v` が範囲 `[a, b]` の中でどの位置（0.0〜1.0）にあるかを計算する。
 * 
 * @param {number} a - 範囲の開始値
 * @param {number} b - 範囲の終了値
 * @param {number} v - 評価する値
 * @returns {number} - 値 `v` が `a` と `b` の間でどれだけの割合にあるか（0.0〜1.0）
 */
function invLerp(a, b, v) {
    return (v - a) / (b - a);
}

function degToRad(degree){
    return degree * Math.PI / 180;
}

/**
 * 2本の線分の交点を求める
 * @param {Point} A - 線分1の始点
 * @param {Point} B - 線分1の終点
 * @param {Point} C - 線分2の始点
 * @param {Point} D - 線分2の終点
 * @returns {Point|null} 交点の座標（存在する場合）または null
 */
function getIntersection(A, B, C, D) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    const eps = 0.001;
    if (Math.abs(bottom) > eps) {
        const t = tTop / bottom;
        const u = uTop / bottom;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            };
        }
    }

    return null;
}

/**
 * ランダムな色を HSL 形式で生成
 * @returns {string} HSL 形式の色コード
 */
function getRandomColor() {
    const hue = 290 + Math.random() * 260; // 色相範囲を 290〜550 の間でランダムに決定
    return `hsl(${hue}, 100%, 60%)`;
}


/**
 * 2D座標を擬似的に3D空間へ変換する関数。
 * 視点 `viewPoint` からの距離を考慮し、高さ `height` に応じた補正を加える。
 * 
 * @param {Point} point - 変換する元の2D座標
 * @param {Point} viewPoint - 視点の座標
 * @param {number} height - 3D効果を付与するための高さ
 * @returns {Point} - 擬似的な3D座標
 */
function getFake3DPoint(point, viewPoint, height) {
    // `point` から `viewPoint` への方向ベクトルを正規化
    const dir = normalize(subtract(point, viewPoint));

    // `point` から `viewPoint` までの距離を計算
    const dist = distance(point, viewPoint);

    // 距離に基づいてスケール係数を計算（遠くなるほど高さの影響を減少）
    const scaler = Math.atan(dist / 300) / (Math.PI / 2);

    // `point` に高さを適用した補正値を加算
    return add(point, scale(dir, height * scaler));
}




