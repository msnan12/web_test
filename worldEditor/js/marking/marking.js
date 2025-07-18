class Marking {
    constructor(center, directionVector, width, height) {
        this.center = center;
        this.directionVector = directionVector;
        this.width = width;
        this.height = height;

        this.support = new Segment(
            translate(center, angle(directionVector), height / 2),
            translate(center, angle(directionVector), -height / 2)
        );

        this.poly = new Envelope(this.support, width, 0).poly;
        this.type = "marking";
    }

    static load(info) {
        const point = new Point(info.center.x, info.center.y);
        const dir = new Point(info.directionVector.x, info.directionVector.y);
        switch (info.type) {
            case "crossing":
                return new Crossing(point, dir, info.width, info.height);
                break;
            case "light":
                return new Light(point, dir, info.width, info.height);
                break;
            case "marking":
                return new Marking(point, dir, info.width, info.height);
                break;
            case "parking":
                return new Parking(point, dir, info.width, info.height);
                break;
            case "start":
                return new Start(point, dir, info.width, info.height);
                break;
            case "stop":
                return new Stop(point, dir, info.width, info.height);
                break;
            case "target":
                return new Target(point, dir, info.width, info.height);
                break;
            case "yield":
                return new Yield(point, dir, info.width, info.height);
                break;
        }
    }

    draw(ctx) {
        this.poly.draw(ctx);
    }
}
