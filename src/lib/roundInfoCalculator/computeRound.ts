import { freeplay_groups, FreeplayGroup } from "./freeplayGroupsConstant"
import { bloon_data } from "./freeplayRoundsConstants"

const cash_multiplier = (round: number) => {
  if (round <= 50) {return 1}
  if (round <= 60) {return 0.5}
  if (round <= 85) {return 0.2}
  if (round <= 100) {return 0.1}
  if (round <= 120) {return 0.05}
  return 0.02;
}

/*const speed_multiplier = (round: number) => {
  if (round <= 80) {return 1}
  if (round <= 100) {return 0.5}
  if (round <= 124) {return 0.2}
  if (round <= 150) {return 0.1}
  if (round <= 250) {return 0.05}
  return 6 + ((round - 252) * 0.02);
}*/

const health_multiplier = (round: number) => {
  if (round <= 80) return 1;
  if (round <= 100) return (round-30) / 50;
  if (round <= 124) return (round-72) / 20;
  if (round <= 150) return ((3*round)-320) / 20;
  if (round <= 250) return ((7*round)-920) / 20;
  if (round <= 300) return round-208.5;
  if (round <= 400) return ((3*round)-717) / 2;
  if (round <= 500) return ((5*round)-1517) / 2;
  return (5 * round)-2008.5;
}

const pythonModulo = (a: number, b: number) => {
  return a - b * Math.floor(a / b);
}

const get_bloon_cash = (bloon: string, round: number) => {
  const freeplay = round > 80;
  bloon = bloon.replace("Fortified", "").replace("Camo", "").replace("Regrow", "");
  const mult = cash_multiplier(round);
  const data = bloon_data[bloon];
  if (data.isMoab) return mult * data.cash;
  if (freeplay && data.superCash) return mult * data.superCash;
  else return mult * data.cash;
}

const get_ceramic_hp = (fortified: boolean, freeplay: boolean) => {
  const ceramicFortifiedData = bloon_data["CeramicFortified"];
  const ceramicData = bloon_data["Ceramic"];
  if (ceramicData.isMoab || ceramicFortifiedData.isMoab) return 0;
  return fortified ?
  (freeplay ? ceramicFortifiedData.superRBE : ceramicFortifiedData.RBE)
  : (freeplay ? ceramicData.superRBE : ceramicData.RBE);
}

const get_RBE = (bloon: string, round: number) => {
  const fortified = bloon.includes("Fortified");
  const freeplay = round > 80;
  bloon = bloon.replace("Fortified", "").replace("Camo", "").replace("Regrow", "");
  const health_mul = health_multiplier(round) * (fortified ? 2 : 1);
  const moab = bloon_data[bloon];
  const ceramic_health = get_ceramic_hp(fortified, freeplay);
  if (moab.isMoab) {
      return ((moab["sumMoabHealth"] * health_mul) + (moab["numCeramics"]*ceramic_health));
  }
  let key = bloon;
  if (fortified) key = key + "Fortified";
  const bloon_d = bloon_data[key];

  if (bloon_d.isMoab) return 0; //so eslint/typescript recognizes this correctly

  if (freeplay) return bloon_d["superRBE"];
  else {return bloon_d["RBE"]}
}


const get_next_seed = (seed: number) => {
  seed = (seed * 0x41a7) % 0x7fffffff;
  const value = seed / 0x7ffffffe;
  return [value, seed];
}

const get_next_seed_bounded = (seed: number, min_: number, max_: number) => {
  if (min_ == max_) {
      return [max_, max_];
  }
  const inv_range = min_ - max_;
  const seedNew = (seed * 0x41a7) % 0x7fffffff;
  let shift = pythonModulo(seedNew, inv_range);
  //var shift = seedNew % inv_range;
  //console.log(seedNew.toLocaleString() + "%" + inv_range.toLocaleString() + " = " + shift.toLocaleString());
  if (shift == 0) {
      shift += inv_range;
  }
  return [max_ + shift, seedNew];
}

const shuffle_seeded_2 = (l: number[], seed: number) => {
  const list_len = l.length;
  //console.log(list_len);
  for (let i = 0; i < list_len; i++) {
      const vSeed = get_next_seed_bounded(seed, i, list_len)
      const index = vSeed[0];
      //console.log(index);
      seed = vSeed[1];

      const liOld = l[i];
      const lIndexOld = l[index];
      

      l[i] = lIndexOld;
      l[index] = liOld;
  }
  return { l, seed };
}



const get_budget = (round: number) => {
  if (round > 100) return (round*4000) - 225000;
  const budget = round**7.7;
  const helper = round**1.75;
  if (round > 50) return (budget * 5e-11) + helper + 20;
  return ((1 + (round * 0.01)) * ((round * -3) + 400) * (((budget * 5e-11) + helper + 20)/160) * 0.6);
}

const get_score = (model: FreeplayGroup, round: number) => {
  let bloon = model["group"]["bloon"];
  const count = model["group"]["count"];
  let mult = 1.0;
  if (bloon.includes("Camo")) {
      mult += 0.1;
      bloon = bloon.replace("Camo", "");
  }
  if (bloon.includes("Regrow")) {
      mult += 0.1;
      bloon = bloon.replace("Regrow", "");
  }
  const RBE = get_RBE(bloon, round) * mult * count;
  if (count == 1) return RBE;
  const spacing = model["group"]["end"] / (60 * count);
  if (spacing >= 1) return 0.8 * RBE;
  if (spacing >= 0.5) return RBE;
  if (spacing > 0.1) return 1.1 * RBE;
  if (spacing > 0.08) return 1.4 * RBE;
  return 1.8 * RBE;
}

const float32 = (num: number) => {
const f32 = new Float32Array(1);
f32[0] = num;
return f32[0];
}

export type IncludeRoundInfo = {
  cash: boolean;
  RBE: boolean;
  sendTime: boolean;
  FBADs: boolean;
  BADs: boolean;
  fullRound: boolean;
}

export const compute_round = (seed: number, start: number, end: number, includeInfo: IncludeRoundInfo) => {
  let round = start;
  let total_RBE = 0;
  let total_cash = 0.0;
  let total_time = 0;
  let total_BADs = 0;
  let total_FBADs = 0;
  const full_rounds = [];

  while (round <= end) {
      let rand = seed + round;

      let test_groups = [...Array(529).keys()]; //[0, 1,..., 528]
      //console.log(test_groups)
      //console.log(rand);
      //var test_groups = Array.from({length: 528}, (v, i) => i);
      const result = shuffle_seeded_2(test_groups, rand);
      test_groups = result.l;
      rand = result.seed;
      //console.log(test_groups);

      //console.log(rand);
      let budget;
      let v = 0;
      if (round > 1) {
          const vSeed = get_next_seed(rand);
          v = float32(vSeed[0]);
          rand = vSeed[1];
          budget = get_budget(round) * (1.5-v);
      }
      else budget = get_budget(round);
      //console.log(budget);
      //console.log(v);
      let round_RBE = 0;
      let round_cash = 0.0;
      let round_time = 0;
      let round_BADs = 0;
      let round_FBADs = 0;
      const full_round = [];
      
      
      for (let i = 0; i < test_groups.length-1; i++) {
          const i2 = test_groups[i];
          const obj = freeplay_groups[i2];
          //console.log(i2);
          const bounds = obj["bounds"];
          
          let j2 = 0;
          for (let j = 0; j < bounds.length; j++) {
              if (bounds[j]["lowerBounds"] <= round && round <= bounds[j]["upperBounds"]) {
                  j2 = bounds.length+1;
                  //console.log(bounds[j]["lowerBounds"]);
                  //console.log(bounds[j]["upperBounds"]);
              }
          }
          if (j2 == bounds.length+1) {
              let score;
              if (obj["score"] == 0) {
                score = get_score(obj, round);
              }
              else {
                score = obj["score"];
              }
              if (score <= budget) {
                  const bloon = obj["group"]["bloon"];
                  let bloon_str;
                  if (bloon.includes("Ceramic") && bloon.includes("Fortified")){
                      bloon_str = bloon.replace("Fortified", "");
                      bloon_str = bloon_str.replace("Ceramic", "F-Ceram");
                  } else if (bloon.includes("Lead") && bloon.includes("Fortified")){
                      bloon_str = bloon.replace("Fortified", "");
                      bloon_str = bloon_str.replace("Lead", "F-Lead");
                  } else {
                      bloon_str = bloon;
                  }
                  const count = obj["group"]["count"];
                  let currBloonLine = includeInfo.fullRound ?
                    bloon_str.padEnd(17, ' ') + " | " + `${count}`.padEnd(5) + " | "
                    : "";
                  
                  if (includeInfo.cash) {
                      const cash = get_bloon_cash(bloon, round) * count
                      round_cash += cash;
                      //console.log(cash);
                      //console.log("$" + cash.toLocaleString() + " | ")
                      //console.log(round_cash);
                      if (includeInfo.fullRound) currBloonLine += "$" + cash.toLocaleString().padEnd(10) + " | "
                  }

                  if (includeInfo.RBE) {
                      let RBE=get_RBE(bloon, round) * count
                      round_RBE += RBE;
                      RBE = parseFloat(RBE.toFixed(2));
                      if (includeInfo.fullRound) currBloonLine += `${RBE}`.padEnd(11) + " | ";
                  }

                  if (includeInfo.sendTime) {
                      const time = obj["group"]["end"];
                      round_time += time;
                      if (includeInfo.fullRound) currBloonLine += `${(time/60).toLocaleString()}`.padEnd(8) + " | ";
                  }
                  
                  
                  if (bloon == "BadFortified" && includeInfo.FBADs) {
                      total_FBADs += count;
                      round_FBADs += count;
                  }
                  if (bloon == "Bad" && includeInfo.BADs) {
                      total_BADs += count;
                      round_BADs += count;
                  }
                  if (includeInfo.fullRound) {
                    currBloonLine += "Group: " + i2.toLocaleString().padEnd(3) + " | ";
                    full_round.push(currBloonLine);
                  }
                  
                  budget -= score; 
                  //console.log(bloon);
              }


          }
      }
      round++;
      if (includeInfo.fullRound) full_round.push("End of round cash: " + ((round-1)+100).toLocaleString());
      total_cash += round_cash + ((round-1)+100);
      total_RBE += round_RBE;
      total_time += (round_time / 60);
      if (includeInfo.fullRound) {
          const cash_str = includeInfo.cash ? `$${round_cash.toFixed(2)}`.padEnd(11, ' ') + " | " : "";
          const rbe_str = includeInfo.RBE ? `${Math.round(round_RBE)}`.padEnd(11, ' ') + " | " : "";
          const time_str = includeInfo.sendTime ? `${parseFloat((round_time / 60).toFixed(3))}s`.padEnd(8, ' ') + " | " : "";
          const default_str = ("Round " + (round-1).toLocaleString() + ": ").padEnd(28) + cash_str + rbe_str + time_str;
          const fbads_str = includeInfo.FBADs ? round_FBADs + " FBADs | " : "";
          const bads_str = includeInfo.BADs ? round_BADs + " BADs |" : "";
          const round_str = (default_str + fbads_str + bads_str);
          full_round.push('-'.repeat(round_str.length));
          full_round.push(round_str.replaceAll(' ', "&nbsp;"));
          full_round.push('-'.repeat(round_str.length));
      }
      if (includeInfo.fullRound) {
          
          full_rounds.push(full_round);
          
      }
  }
  return { total_cash, total_RBE, total_time, total_FBADs, total_BADs, full_rounds }
}