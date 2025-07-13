class Sensor{
    constructor(car){
        this.car=car;
        this.rayCount=5;//センサーの数
        this.rayLength=150;//センサーの有効距離
        this.rayOffset=0;
        this.raySpread=Math.PI/2;//センサーの展開角度設定 45度　PIは180度
        
        this.ray=[];//センサー格納配列
        this.readings=[];
    }

    update(roadBorders,traffic, markings = []) {
        this.#castRays();
        this.readings=[];
        for(let i=0;i<this.rays.length;i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic,
                    markings
                )
            );
        };
    }

    #getReading(ray, roadBorders, traffic, markings = []) {
        let touches = [];

        // 道路境界線との交差
        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0], ray[1],
                roadBorders[i][0], roadBorders[i][1]
            );
            if (touch) {
                touches.push(touch);
            }
        }

        // 他の車との交差
        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;
            for (let j = 0; j < poly.length; j++) {
                const value = getIntersection(
                    ray[0], ray[1],
                    poly[j], poly[(j + 1) % poly.length]
                );
                if (value) {
                    touches.push(value);
                }
            }
        }

        // 停止線や信号などのマーカー線分との交差
        for (let i = 0; i < markings.length; i++) {
            const touch = getIntersection(
                ray[0], ray[1],
                markings[i][0], markings[i][1]
            );
            if (touch) {
                touches.push(touch);
            }
        }

        if (touches.length == 0) {
            return null;
        } else {
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset == minOffset);
        }
    }


    #castRays(){
        this.rays=[];
        for(let i=0;i<this.rayCount;i++){
            /*光線の角度を 中心から左右対称に分布 させるための計算です。
            例えば、ray_spread = np.pi/2（90度）の場合、ray_spread / 2 は 45度 になります。
            lerp 関数に渡す際に、ray_spread / 2 から -ray_spread / 2 までの範囲で補間することで、光線が 中心を基準に左右45度ずつ広がる 形になります。*/
            const rayAngle=lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1?0.5:i/(this.rayCount-1)
            )+this.car.angle+this.rayOffset;

            const start={x:this.car.x,y:this.car.y};
            const end={
                x:this.car.x-Math.sin(rayAngle)*this.rayLength,
                y:this.car.y-Math.cos(rayAngle)*this.rayLength
            };

            this.rays.push([start,end]);
        }
    }

    drow(ctx){
        for(let i=0;i<this.rayCount;i++){
            let end=this.rays[i][1];
            if(this.readings[i]){
                end=this.readings[i];
            }
            //センサーの黄色線
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            )

            ctx.stroke();
            //センサーの黒線
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            )

            ctx.stroke();
        }
    }
}