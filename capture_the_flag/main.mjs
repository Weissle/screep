import * as GU from '/game/utils';
import * as GP from '/game/prototypes';
import * as GC from '/game/constants';
import * as Game from 'game';
import * as Arena from '/arena';

function filterOutUsedCreeps(my_creeps,my_creeps_used){
    var creeps = []
    for (var creep of my_creeps){
        if(my_creeps_used[creep.id] == false){
            creeps.push(creep);
        }
    }
    return creeps;
}

function pickupBodypart(body_parts,my_creeps,my_creeps_used){
    var creeps = filterOutUsedCreeps(my_creeps,my_creeps_used);
    for (var bp of body_parts){
        var creep = GU.findClosestByRange(bp,creeps)
        if(creep ==null){
            continue;
        }
        creep.pickup(bp);
        my_creeps_used[creep.id] = true;
        creeps.filter(tmp=>(tmp.id!=creep.id));
    }
}

function attackAround(my_creeps,opp_creeps,my_creeps_used){
    var creeps = filterOutUsedCreeps(my_creeps,my_creeps_used)
    for (var creep of creeps){
        var attack_part = creep.body.find(t=>t.type==GC.ATTACK) === undefined ? false:true;
        var ranged_attack_part = creep.body.find(t=>t.type==GC.RANGED_ATTACK) === undefined ? false:true;
        if(attack_part == false && ranged_attack_part == false){
            continue
        }
        var in_range_creeps = GU.findInRange(creep,opp_creeps,5);
        if(in_range_creeps.length==0){
            continue
        } 
        var opp_creep = in_range_creeps.reduce((a,b)=>(a.hits<b.hits)?a:b);
        if(opp_creep == null || opp_creep === undefined){
            continue
        }
        //TODO: better choose
        if(attack_part){
            if(creep.attack(opp_creep) == GC.ERR_NOT_IN_RANGE){
                creep.moveTo(opp_creep);
            }
        }
        else if(ranged_attack_part){
            if(creep.rangedAttack(opp_creep) == GC.ERR_NOT_IN_RANGE){
                creep.moveTo(opp_creep);
            }

        }
        my_creeps_used[creep.id] = true;
    }
}

function moveToFlag(my_creeps,flag,my_creeps_used){
    var creeps = filterOutUsedCreeps(my_creeps,my_creeps_used)
    for(var creep of creeps){
        creep.moveTo(flag);
        my_creeps_used[creep.id] = true;
    }
}

function towerAction(my_towers,my_creeps,my_flag,opp_creeps){
    for(var tower of my_towers){
        var targets = GU.findInRange(tower,opp_creeps,GC.TOWER_RANGE)
        var target = targets.reduce((a,b)=>GU.getRange(my_flag,a)<GU.getRange(my_flag,b)?a:b)
        console.log(target)
        if(target!=undefined && tower.attack(target) != GC.ERR_NOT_IN_RANGE){
            continue
        }
        targets = GU.findInRange(tower,my_creeps,GC.TOWER_RANGE)
        target = targets.reduce((a,b)=>a.hits<b.hits?a:b)
        console.log(target)
        if(target!=undefined && tower.heal(target) != GC.ERR_NOT_IN_RANGE){
            continue
        }
    }
}

export function loop() {
    // Your code goes here
    const flags = GU.getObjectsByPrototype(GP.Flag)
    const my_flag = flags.find(tmp=>tmp.my)
    const opp_flag = flags.find(tmp=>!tmp.my)
    const my_creeps = GU.getObjectsByPrototype(GP.Creep).filter(tmp=>tmp.my)
    const opp_creeps = GU.getObjectsByPrototype(GP.Creep).filter(tmp=>!tmp.my)
    const my_towers = GU.getObjectsByPrototype(GP.Structure).filter(tmp=>tmp.my)
    const opp_towers = GU.getObjectsByPrototype(GP.Structure).filter(tmp=>!tmp.my)
    const body_parts = GU.getObjectsByPrototype(GP.BodyPart)
    var my_creeps_used = {}
    for(var creep of my_creeps){
        my_creeps_used[creep.id]=false;
    }
    pickupBodypart(body_parts,my_creeps,my_creeps_used)
    attackAround(my_creeps,opp_creeps,my_creeps_used)
    moveToFlag(my_creeps,opp_flag,my_creeps_used)
    towerAction(my_towers,my_creeps,my_flag,opp_creeps)
}
