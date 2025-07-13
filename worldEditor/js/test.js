class Test{
    constructor(){

    }

    test1(){
        for(let a=0;a<Math.PI*2;a+=Math.PI/16){
            const kindOfRandom=Math.cos(((a+10)*80)%17)**2;
            console.log(kindOfRandom);
        }
    }
}

