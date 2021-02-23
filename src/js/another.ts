
class Animal{
    move(distanceInMeters: number=0){
        console.log(`moved ${distanceInMeters}m.`)
    }
}

class Dog extends Animal{
    bark(){
        console.log("Woof")
    }
}

const dog = new Dog();
dog.bark();
dog.move(10);
dog.bark();