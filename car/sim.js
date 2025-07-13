const carCanvas=document.getElementById("carCanvas");
const networkCanvas=document.getElementById("networkCanvas");
const miniMapCanvas=document.getElementById("miniMapCanvas");

carCanvas.width=window.innerWidth-550;
carCanvas.height=window.innerHeight;
networkCanvas.width=500;
networkCanvas.height=window.innerHeight*2/3;

miniMapCanvas.width=500;
miniMapCanvas.height=window.innerHeight*1/3;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const worldString = localStorage.getItem("world");
const worldhInfo = worldString ? JSON.parse(worldString) : null;
const seasonName = worldhInfo?.season?.name || "spring"; // デフォルトは春
const currentSeason = Season.fromString(seasonName);

const world = worldhInfo
? World.load(worldhInfo)
: new World(new Graph(),currentSeason);
const viewport = new ViewPort(carCanvas,world.zoom,world.offset);
const miniMap = new MiniMap(miniMapCanvas, world.graph, miniMapCanvas.width, miniMapCanvas.height);

const N=1;
const cars=generateCars(N);

let bestCar=cars[0];
// if(localStorage.getItem("BestBrain")){
//     for(let i=0;i<cars.length;i++){
//         cars[i].brain=JSON.parse(
//             localStorage.getItem("BestBrain"));
//         // console.log(i+":保存された情報を取得しました");
//         if(i!=0){
//             NeuralNetwork.mutate(cars[i].brain,0.1);
//         }
//     }
//     console.log("保存された情報を取得しました");
// }


const traffic=[];

let roadBorders=[];
const target = world.markings.find((m)=>m instanceof Target);
const start = world.markings.find((m)=>m instanceof Start);
console.log("start:"+target);
if(target){
    world.generateCorridor(start.center,target.center);
    roadBorders= world.corridor.borders.map((s)=>[s.p1,s.p2]);
}else{
    roadBorders= world.roadBorders.map((s)=>[s.p1,s.p2]);
}

animate();


function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain)
    );
    console.log(bestCar.brain.levels[1].output+"保存しました")
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const startPoints = world.markings.filter((m)=>m instanceof Start);
    const startPoint = startPoints.length>0
        ? startPoints[0].center
        : new Point(100,100);
    const dir = startPoints.length>0
        ? startPoints[0].directionVector
        : new Point(0,-1);
    const startAngle = -angle(dir)+Math.PI/2;

    const cars=[];
    for(let i=1;i<=N;i++){
        const car = new Car(startPoint.x,startPoint.y,30,50,"AI",startAngle);
        car.load(carInfo);
        cars.push(car);
    }
    return cars;
}

function animate(time){
    carCtx.clearRect(0,0, carCanvas.width, carCanvas.height);
    // networkCtx.setTransform(1, 0, 0, 1, 0, 0);        // 変換行列をリセット
    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
    
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(roadBorders,[]);
    }

    for(let i=0;i<cars.length;i++){
        cars[i].update(roadBorders,traffic);
    }
    bestCar=cars.find(
        c=>c.fittness==Math.max(
            ...cars.map(c=>c.fittness)
        )
    );

    world.cars=cars;
    world.bestCar=bestCar;

    viewport.offset.x=-bestCar.x;
    viewport.offset.y=-bestCar.y;

    viewport.reset();
    const viewPoint = scale(viewport.getOffset(), -1);
    // viewport.offset = scale(subtract(new Point(bestCar.x, bestCar.y), carCanvas.Center), -1);
    world.draw(carCtx, viewPoint,false);
    miniMap.update(viewPoint);
    

    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    
    carCtx.restore();


    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);

    requestAnimationFrame(animate);
}


