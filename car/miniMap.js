class MiniMap{
    constructor(canvas,graph,width,height){
        this.canvas=canvas;
        this.graph=graph;
        this.width=width;
        this.height=height;

        canvas.width=width;
        canvas.height=height;
        this.ctx = canvas.getContext("2d");    
        
    }

    update(viewPoint){
        this.ctx.clearRect(0, 0, this.width, this.height);

        const scaler = 0.05;
        const scaleViewPoint = scale(viewPoint, -scaler);
        this.ctx.save();
        this.ctx.translate(
            scaleViewPoint.x+this.width/2, 
            scaleViewPoint.y+this.height/2
        );
        this.ctx.scale(scaler, scaler);
        for(const seg of this.graph.segments){
            seg.draw(this.ctx, {width: 3/scaler, color:"white"});
        }
        this.ctx.restore();
        new Point(this.width/2,this.height/2).draw(this.ctx, {color:"blue", outline: true});
    }
}