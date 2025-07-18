const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=500;


const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width/2,carCanvas.width*0.9);


//const car = new Car(road.getLaneCenter(1),100,30,50,"KEYS");
//const car = new Car(road.getLaneCenter(1),100,30,50,"AI");

const N=200;
const cars=generateCars(N);

let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
    console.log("保存された情報を取得しました");
}

const traffic=[
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-900,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-900,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-1200,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-1200,30,50,"DUMMY",2,getRandomColor())
]

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
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));

    }
    return cars;
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }

    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    // bestCar=cars.find(
    //     c=>c.y==Math.min(
    //         ...cars.map(c=>c.y)
    //     )
    // );

    bestCar = cars.reduce((best, curr) =>
        curr.getScore(road) > best.getScore(road) ? curr : best, cars[0]
    );


    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight/2;

    carCtx.save();
    //console.log(-car.y);
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.75);
    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/100;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);

    requestAnimationFrame(animate);
}


