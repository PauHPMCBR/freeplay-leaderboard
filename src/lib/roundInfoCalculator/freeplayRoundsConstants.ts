/*export type BloonType = 
  "Red" | "Blue" | "Green" | "Yellow" | "Pink" | "Purple" | "Black" | "White" | "Zebra" | "Rainbow" |
  "Lead" | "LeadFortified" | "Ceramic" | "CeramicFortified" | 
  "Moab" | "Bfb" | "Zomg" | "Ddt" | "Bad";*/

type NonMoabData = {
  isMoab: false;
  RBE: number;
  superRBE: number,
  cash: number;
  superCash: number;
}

type MoabData = {
  isMoab: true;
  cash: number;
  sumMoabHealth: number;
  numCeramics: number;
}

export type BloonData = NonMoabData | MoabData;

export const bloon_data: Record<string, BloonData> = {
  Red:{
    isMoab:false,
    RBE:1,
    superRBE:1,
    cash:1,
    superCash:1
  },
  Blue:{
    isMoab:false,
    RBE:2,
    superRBE:2,
    cash:2,
    superCash:2
  },
  Green:{
    isMoab:false,
    RBE:3,
    superRBE:3,
    cash:3,
    superCash:3
  },
  Yellow:{
    isMoab:false,
    RBE:4,
    superRBE:4,
    cash:4,
    superCash:4
  },
  Pink:{
    isMoab:false,
    RBE:5,
    superRBE:5,
    cash:5,
    superCash:5
  },
  Black:{
    isMoab:false,
    RBE:11,
    superRBE:6,
    cash:11,
    superCash:6
  },
  White:{
    isMoab:false,
    RBE:11,
    superRBE:6,
    cash:11,
    superCash:6
  },
  Purple:{
    isMoab:false,
    RBE:11,
    superRBE:6,
    cash:11,
    superCash:6
  },
  Zebra:{
    isMoab:false,
    RBE:23,
    superRBE:7,
    cash:23,
    superCash:7
  },
  Lead:{
    isMoab:false,
    RBE:23,
    superRBE:7,
    cash:23,
    superCash:7
  },
  LeadFortified:{
    isMoab:false,
    RBE:26,
    superRBE:10,
    cash:23,
    superCash:7
  },
  Rainbow:{
    isMoab:false,
    RBE:47,
    superRBE:8,
    cash:47,
    superCash:8
  },
  Ceramic:{
    isMoab:false,
    RBE:104,
    superRBE:68,
    cash:95,
    superCash:95
  },
  CeramicFortified:{
    isMoab:false,
    RBE:114,
    superRBE:128,
    cash:95,
    superCash:95
  },
  Moab:{
    isMoab:true,
    cash:381,
    sumMoabHealth:200,
    numCeramics:4
  },
  Bfb:{
    isMoab:true,
    cash:1525,
    sumMoabHealth:1500,
    numCeramics:16
  },
  Zomg:{
    isMoab:true,
    cash:6101,
    sumMoabHealth:10000,
    numCeramics:64
  },
  Ddt:{
    isMoab:true,
    cash:381,
    sumMoabHealth:400,
    numCeramics:4
  },
  Bad:{
    isMoab:true,
    cash:13346,
    sumMoabHealth:41200,
    numCeramics:140
  }
}
