class Road{
    constructor(x,width,laneCount=3){
        this.x=x;
        this.width=width;
        this.laneCount=laneCount;

        this.left=x-width/2;
        this.right=x+width/2;

        const infinity=1000000;
        this.top=-infinity;
        this.bottom=infinity;

        const topLeft={x:this.left, y:this.top};
        const bottomLeft={x:this.left, y:this.bottom};
        const topRigth={x:this.right, y:this.top};
        const bottomRigth={x:this.right, y:this.bottom};

        this.borders=[
            [topLeft, bottomLeft],
            [topRigth ,bottomRigth]
        ]
    }

    //車線ごとの中心を求める
    getLaneCenter(laneindex){
        const lineWidth=this.width/this.laneCount;
        return this.left+lineWidth/2+
            Math.min(laneindex,this.laneCount-1)*lineWidth;//車線数を超えないようにminで制限
    }
    

    draw(ctx){
        ctx.lineWidth=5;
        ctx.strokeStyle="white";

        for(let i=0;i<=this.laneCount;i++){
             const x=lerp(
                this.left,
                this.right,
                i/this.laneCount
            );

            ctx.setLineDash([30,30]);
            ctx.beginPath();
            ctx.moveTo(x,this.top);
            ctx.lineTo(x,this.bottom);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        this.borders.forEach(border=>{
            ctx.beginPath();
            ctx.moveTo(border[0].x,border[0].y);
            ctx.lineTo(border[1].x,border[1].y);
            ctx.stroke();
        })

    }

    a(ctx){
        console.log(this.bottom)
        ctx.lineWidth=5;
        ctx.strokeStyle="white";
        ctx.setLineDash([20,20]);

            ctx.beginPath();
            ctx.moveTo(10,10);
            ctx.lineTo(10,300);
            ctx.stroke();

    }
}

