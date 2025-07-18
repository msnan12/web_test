const rightPanelWidth=300;

const carCanvas=document.getElementById("carCanvas");
carCanvas.width=window.innerWidth;
carCanvas.height=window.innerHeight;

const miniMapCanvas=document.getElementById("miniMapCanvas");
miniMapCanvas.width=rightPanelWidth;
miniMapCanvas.height=rightPanelWidth;

statistics.style.width = rightPanelWidth+"px";
statistics.style.height = window.innerHeight - rightPanelWidth -75 + "px";

const carCtx = carCanvas.getContext("2d");

const viewport = new ViewPort(carCanvas,world.zoom,world.offset);
const miniMap = new MiniMap(miniMapCanvas, world.graph, miniMapCanvas.width,miniMapCanvas.height);

const N=100;
const cars=generateCars(1,"KEYS").concat(generateCars(N, "AI"));

const myCar=cars[0];
save();
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        console.log(i+":保存された情報を取得しました");
        if(i>2){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
    console.log("保存された情報を取得しました");
}

for(let i=0;i<cars.length; i++){
    const div = document.createElement("div");
    div.id = "stat_"+i;
    div.innerText = i;
    div.style.color = cars[i].color;
    div.classList.add("stat");
    statistics.appendChild(div);
}

let roadBorders=[];
const target = world.markings.find((m)=>m instanceof Target);
if(target){
    world.generateCorridor(myCar,target.center,true);
    roadBorders= world.corridor.borders.map((s)=>[s.p1,s.p2]);
}else{
    roadBorders= world.roadBorders.map((s)=>[s.p1,s.p2]);
}

let frameCount=0;
let started=false;

startCounter();
animate();


function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(myCar.brain)
    );
    console.log(myCar.brain.levels[1].output+"保存しました")
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N, type){
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
        const color = type == "AI" ? getRandomColor() : "blue";
        const car = new Car(
            startPoint.x,
            startPoint.y,
            30,
            50,
            type,
            startAngle,
            3,
            color
        );
        car.name = type == "AI" ? "AI"+i : "player";
        car.load(carInfo);
        cars.push(car);
    }
    return cars;
}

function updateCarProgress(car){
    if(!car.finishTime){
        car.progress = 0;
        const carSeg = getNearestSegment(car,world.corridor.skeleton);
        for(let i=0;i<world.corridor.skeleton.length;i++){
            const s=world.corridor.skeleton[i];
            if(s.equals(carSeg)){
                const proj = s.projectPoint(car);
                const firstPartOfSegment = new Segment(s.p1, proj.point);
                car.progress += firstPartOfSegment.length();
                break;
            }else{
                car.progress += s.length();
            }
        }
        const totalDistance = world.corridor.skeleton.reduce(
            (acc, s) => acc + s.length(),0
        );
        car.progress /= totalDistance;
        if (car.progress >= 1){
            car.progress=1;
            car.finishTime = frameCount;
        }
    }
}

function startCounter(){
    const timeout = 1000;
    counter.innerText = "3";
    setTimeout(() => {
        counter.innerText = "2";
        setTimeout(() => {
            counter.innerText = "1";
            setTimeout(() => {
                counter.innerText = "GO!";
                setTimeout(() => {
                    counter.innerText = "";
                    started=true;
                    frameCount=0;
                }, timeout);
            }, timeout);
        }, timeout);
    }, timeout);
}

function animate(){
    carCtx.clearRect(0,0, carCanvas.width, carCanvas.height);

    if(started){
        for(let i=0;i<cars.length;i++){
            cars[i].update(roadBorders,[]);
        }
    }

    world.cars=cars;
    world.bestCar=myCar;

    viewport.offset.x=-myCar.x;
    viewport.offset.y=-myCar.y;

    viewport.reset();
    const viewPoint = scale(viewport.getOffset(), -1);
    // viewport.offset = scale(subtract(new Point(bestCar.x, bestCar.y), carCanvas.Center), -1);
    world.draw(carCtx, viewPoint,false);
    miniMap.update(viewPoint);

    for(let i=0; i<cars.length; i++){
        updateCarProgress(cars[i]);
    }

    cars.sort((a,b) => b.progress - a.progress);

    for(let i=0; i<cars.length; i++){
        const stat = document.getElementById("stat_"+i);
        stat.style.color=cars[i].color;
        stat.innerText = (i+1)+ ":" + cars[i].name + (cars[i].damaged ? " 💀" : "");
        stat.style.backgroundColor = cars[i].type == "AI" ? "black": "white";
        if(cars[i].finishTime){
            stat.innerHTML += "<span style='float:right'>"+
                (cars[i].finishTime/60).toFixed(1)+"s </span>";
    
        }
    }

    carCtx.restore();
    frameCount ++;
    requestAnimationFrame(animate);
}