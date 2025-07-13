class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 3,color="blue") {
        // 位置とサイズ
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // 速度・加速度・摩擦・向き
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;

        // 衝突しているかどうかのフラグ
        this.damaged = false;

        // AI制御かどうかの判定
        this.useBrain = controlType == "AI";

        // DUMMY以外の車はセンサーとニューラルネットワークを持つ
        if (controlType != "DUMMY") {
            this.senser = new Senser(this);
            this.brain = new NeuralNetwork(
                [this.senser.rayCount, 6, 4] // 入力・中間・出力のノード数
            );
        }

        // 操作入力（手動／AI／DUMMY）
        this.controls = new Controls(controlType);

        this.img=new Image();
        this.img.src="car.png";

        this.mask=document.createElement("canvas");
        this.mask.width=width;
        this.mask.height=height;

        const maskCtx=this.mask.getContext("2d");
        this.img.onload=()=>{
            maskCtx.fillStyle=color;
            maskCtx.rect(0,0,this.width,this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation="destination-atop";
            maskCtx.drawImage(this.img,0,0,this.width,this.height);
        }
    }

    getScore(road) {
        let score = -this.y;
        if (this.damaged) score -= 1000;
        const laneCenter = road.getLaneCenter(1);
        score -= Math.abs(this.x - laneCenter) * 2;
        score += this.speed * 10;
        return score;
    }



    update(roadBorders, traffic) {
        // 車が壊れていない場合のみ移動・衝突判定を行う
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon(); // 現在の形状を取得
            this.damaged = this.#assessDamage(roadBorders, traffic); // 衝突判定
        }

        // センサーが存在する場合（AIまたは手動）
        if (this.senser) {
            this.senser.update(roadBorders, traffic); // センサーによる距離計測

            // センサー結果を0〜1の値に正規化（nullなら0）
            const offsets = this.senser.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );

            // ニューラルネットワークで制御出力を得る
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            // console.log(outputs);

            // AI制御の場合、出力値で操作を設定
            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
            // if (this.useBrain) {
            //     this.controls.forward = outputs[0] > 0.3;
            //     this.controls.left = outputs[1] > 0.3;
            //     this.controls.right = outputs[2] > 0.3;
            //     this.controls.reverse = outputs[3] > 0.3;
            // }

        }
    }

    // 衝突しているかどうかを判定
    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    // 現在の位置と角度から四角形ポリゴンを生成（衝突判定用）
    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2; // 中心から各頂点への距離（外接円の半径）
        const alpha = Math.atan2(this.width, this.height); // 対角の角度

        // 四隅の座標を順に計算
        points.push({ // 右上
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({ // 右下
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({ // 左下
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({ // 左上
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points;
    }

    // 車の移動ロジック（加速・減速・旋回・摩擦）
    #move() {
        // 前進（加速）
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        // 後退（加速）
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        // 前進の最大速度制限
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        // 後退の最大速度制限（前進の半分）
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        // 摩擦による減速（前進時）
        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        // 摩擦による減速（後退時）
        if (this.speed < 0) {
            this.speed += this.friction;
        }

        // 微小速度のときは停止
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        // 移動中のみ回転可能
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.right) {
                this.angle -= 0.01 * flip;
            }
            if (this.controls.left) {
                this.angle += 0.01 * flip;
            }
        }

        // x, y 位置の更新（角度に基づく進行方向へ）
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    // 描画処理
    draw(ctx,  drowSensor = false) {
        // // 損傷状態で赤、それ以外は指定色
        // if (this.damaged) {
        //     ctx.fillStyle = "red";
        // } else {
        //     ctx.fillStyle = color;
        // }

        // // ポリゴン（4点）を描画
        // ctx.beginPath();
        // ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        // for (let i = 0; i < this.polygon.length; i++) {
        //     ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        // }
        // ctx.fill();

        // センサーの可視化
        if (this.senser && drowSensor) {
            this.senser.drow(ctx);
        }
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        if(!this.damaged){
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height
            );
            ctx.globalCompositeOperation="multiply";
        };
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.restore();

        
    }
}
