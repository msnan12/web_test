class Light extends Marking{
    constructor(center,directionVector,width,height){
        super(center,directionVector,width,18);
        this.boorder=this.poly.segments[0];//日本の場合はここ変更2に
        this.state="off";
        this.type="light";
    }

    draw(ctx){
        const perp=perpendicular(this.directionVector);
        const line=new Segment(
            add(this.center,scale(perp,this.width/2)),
            add(this.center,scale(perp,-this.width/2))
        );

        const green=lerp2D(line.p1,line.p2,0.2);
        const yellow=lerp2D(line.p1,line.p2,0.5);
        const red=lerp2D(line.p1,line.p2,0.8);

        new Segment(green,red).draw(ctx,{
            width:this.height,
            cap: "round"
        });

        green.draw(ctx,{size:this.height*0.6,color:"#060"});
        yellow.draw(ctx,{size:this.height*0.6,color:"#660"});
        red.draw(ctx,{size:this.height*0.6,color:"#600"});

        switch(this.state){
            case "green":
                green.draw(ctx,{size:this.height*0.6,color:"#0F0"});
                break;
            case "yellow":
                yellow.draw(ctx,{size:this.height*0.6,color:"#FF0"});
                break;
            case "red":
                red.draw(ctx,{size:this.height*0.6,color:"#F00"});
                break;
        }

        //debug
        // this.boorder.draw(ctx,{color:"red"})
    }
}
    