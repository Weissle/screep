import * as GU from '/game/utils';
import * as GP from '/game/prototypes';
import * as GC from '/game/constants';
import * as Game from 'game';
import * as Arena from '/arena';

export function loop() {
    // Your code goes here
    const mySpawns = GU.getObjectsByPrototype(GP.StructureSpawn).filter(s => s.my);
    const mySpawn = mySpawns[0];
    const center_x = mySpawn.x, center_y = mySpawn.y;
    const tower_offset=[[-1,0],[-1,-0]]
    const myScreeps = GU.getObjectsByPrototype(GP.Creep).filter(s => s.my);
    var myWorkers = []
    var myAttacker = []
    // var myTowers = GU.getObjectsByPrototype(GP.OwnedStructure).filter(s => s.my);
    var myConstructionSites = GU.getObjectsByPrototype(GP.ConstructionSite).filter(s => s.my);
    var myTowers = GU.getObjectsByPrototype(GP.StructureTower).filter(s => s.my);
    for(const creep of myScreeps){
        if (creep.body.find(t=>t.type == GC.WORK)) myWorkers.push(creep);
        else if (creep.body.find(t=>t.type == GC.ATTACK)) myAttacker.push(creep);
    }

    if(myWorkers.length < 4){
        let creep = mySpawn.spawnCreep([GC.WORK,GC.CARRY,GC.MOVE]);
    }
    else if(myAttacker.length < 0){
        let creep = mySpawn.spawnCreep([GC.ATTACK,GC.MOVE]);
    }
    if(myTowers.length + myConstructionSites.length < 1){
        var tmp = myTowers.length + myConstructionSites.length;
        let tower = GU.createConstructionSite({x:center_x+tower_offset[tmp][0],y:center_y+tower_offset[tmp][1]},GP.StructureTower)
        console.log(myTowers.length,tower)
    }
    const sources = GU.getObjectsByPrototype(GP.Source)
    for(var i=0;i<myWorkers.length;i++){
        const creep = myWorkers[i];
        var collect_source_number = (Game.getTicks()>230) ? 2:3;
        if(i<collect_source_number){
            if(creep.store[GC.RESOURCE_ENERGY] < creep.store.getCapacity()){
                const source = GU.findClosestByPath(creep,sources);
                if(creep.harvest(source) == GC.ERR_NOT_IN_RANGE){
                    creep.moveTo(source);
                }
            }
            else if(creep.store[GC.RESOURCE_ENERGY] == creep.store.getCapacity()){
                const spawn = GU.findClosestByPath(creep,mySpawns);
                if(creep.transfer(spawn,GC.RESOURCE_ENERGY) == GC.ERR_NOT_IN_RANGE){
                    creep.moveTo(spawn);
                }            
            }
        }
        else{
            const need_build_tower = myConstructionSites[0];
            if(creep.store[GC.RESOURCE_ENERGY] == 0){
                const spawn = GU.findClosestByPath(creep,mySpawns);
                if(creep.withdraw(spawn,GC.RESOURCE_ENERGY) == GC.ERR_NOT_IN_RANGE){
                    creep.moveTo(spawn);
                }
            }
            else {
                if(need_build_tower == undefined){
                    if(creep.transfer(myTowers[0],GC.RESOURCE_ENERGY) == GC.ERR_NOT_IN_RANGE){
                        creep.moveTo(myTowers[0]);
                    }
                } 
                else if(creep.build(need_build_tower) == GC.ERR_NOT_IN_RANGE){
                    creep.moveTo(need_build_tower);
                }            
            }
        }
        const oppCreeps = GU.getObjectsByPrototype(GP.Creep).filter(s => !s.my);
        for(const tow of myTowers){
            let tar = tow.findClosestByPath(oppCreeps);
            console.log(tar,tow.attack(tar));
        }
        for(const atter of myAttacker){
            let targetsInRange = GU.findInRange(atter,oppCreeps,4);
            if(targetsInRange.length == 0){
                atter.moveTo({x:center_x-1,y:center_y-2});
            }
            if(atter.attack(targetsInRange[0]) == GC.ERR_NOT_IN_RANGE){
                atter.moveTo(targetsInRange[0]);
            };
        }
    }
}
