class Car {
    constructor(x, y, width, height, controlType, angle=0, maxSpeed = 2,color="blue") {
        // 位置とサイズ
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = controlType;

        // 速度・加速度・摩擦・向き
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = angle;
        

        // 衝突しているかどうかのフラグ
        this.damaged = false;

        this.fittness = 0;

        // AI制御かどうかの判定
        this.useBrain = controlType == "AI";

        // DUMMY以外の車はセンサーとニューラルネットワークを持つ
        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.stopSensor = new Sensor(this);
            this.lightSensor = new Sensor(this);
            console.log(this.sensor.rayCount);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4] // 入力・中間・出力のノード数
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

    load(info){
        this.brain = info.brain;
        console.log("brain:"+this.brain.levels[0].biases[0]);
        this.maxSpeed = info.maxSpeed;
        this.friction = info.friction;
        this.acceleration = info.acceleration;
        this.sensor.rayCount = info.sensor.rayCount;
        this.sensor.raySpread = info.sensor.raySpread;
        this.sensor.rayLength = info.sensor.rayLength;
        this.sensor.rayOffset = info.sensor.rayOffset;
        this.stopSensor.rayCount = info.stopSensor.rayCount;
        this.stopSensor.raySpread = info.stopSensor.raySpread;
        this.stopSensor.rayLength = info.stopSensor.rayLength;
        this.stopSensor.rayOffset = info.stopSensor.rayOffset;
        this.lightSensor.rayCount = info.lightSensor.rayCount;
        this.lightSensor.raySpread = info.lightSensor.raySpread;
        this.lightSensor.rayLength = info.lightSensor.rayLength;
        this.lightSensor.rayOffset = info.lightSensor.rayOffset;

        // const totalInputs = this.sensor.rayCount + 1 + 1 + 1;
        // this.brain = new NeuralNetwork(
        //     [totalInputs, 6, 3, 4] // 入力・中間・出力のノード数
        // );
        console.log("brain:"+this.brain.levels[0].biases[0]);
    }

    getScore(road) {
        let score = -this.y;
        if (this.damaged) score -= 1000;
        const laneCenter = road.getLaneCenter(1);
        score -= Math.abs(this.x - laneCenter) * 2;
        score += this.speed * 10;
        return score;
    }



    update(roadBorders, traffic, stopLines, lights) {
        if (!this.damaged) {
            this.#move();
            this.fittness += this.speed;
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);

            // 停止線センサー更新（すべての停止線に対して1本のレイ）
            
            this.stopSensor.update([], [], stopLines); // stopLines = [ [p1, p2], [p3, p4], ... ]

            // 停止線センサーの入力
            const stopReading = this.stopSensor.readings[0];
            const stopLineInput = stopReading ? 1 - stopReading.offset : 0;

            // 通常センサー入力
            const sensorInputs = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );

            // 信号入力（例：前方に赤信号があるか？）
            let signalInput = 0;
            let minDistance = Infinity;

            for (let light of lights) {
                if (light.state === "red") {
                    const dx = light.center.x - this.x;
                    const dy = light.center.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 200 && distance < minDistance) {
                        minDistance = distance;
                        signalInput = 1 - distance / 200;
                    }
                }
            }


            // 最終的なNN入力
            const inputs = [
                ...sensorInputs,
                this.speed / this.maxSpeed,
                stopLineInput,
                signalInput
            ];

            const outputs = NeuralNetwork.feedForward(inputs, this.brain);

            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
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
                this.angle -= 0.03 * flip;
            }
            if (this.controls.left) {
                this.angle += 0.03 * flip;
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
        if (this.sensor && drowSensor) {
            this.sensor.drow(ctx);
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
