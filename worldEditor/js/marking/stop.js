class Stop extends Marking{
    constructor(center,directionVector,width,height){
        super(center,directionVector,width,height);
        this.boorder=this.poly.segments[2];//日本の場合はここ変更0に
        this.type="stop";
    }

    draw(ctx){
        this.boorder.draw(ctx,{width:5, color:"white"});

        ctx.save();
        ctx.translate(this.center.x,this.center.y);
        ctx.rotate(angle(this.directionVector)-Math.PI/2);
        ctx.scale(1,3);

        ctx.beginPath();
        ctx.textBaseline="middle";
        ctx.textAlign="center";
        ctx.fillStyle="white";
        ctx.font="bold "+this.height *0.3+"px Arial";
        ctx.fillText("STOP",0,1);
        ctx.closePath();
        ctx.restore();
    }
}
    