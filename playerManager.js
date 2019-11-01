var fs = require('./fileParser.js');

var createChar = function(data)
{
   data.might = +data.might;
   data.agility = +data.agility;
   data.vitality = +data.vitality;
   data.smarts = +data.smarts;
   data.experience = +data.experience;
   data.influence = +data.influence;

   var statsSum = data.might+data.agility+data.smarts+data.experience+data.influence+data.vitality;
   if(statsSum!=60)
   {
     return 0;
   }

  switch(data.class)
  {
    case 'E':
      data.H = 10;
      data.B = 15;
      data.RA = data.LA = 5;
      data.RL = data.LL = 5;
      data.AH = 5;
      data.AB = 5;
      data.ARA = data.ALA = 3;
      data.ARL = data.ALL = 2;

      data.vitality += 2;
      data.agility += 1;
      data.might -= 1;
      data.smarts -= 2;

      data.sanityM = data.sanity = 35;
      break;

    case 'D':
      data.H = 5;
      data.B = 10;
      data.RA = data.LA = 5;
      data.RL = data.LL = 5;
      data.AH = 0;
      data.AB = 0;
      data.ARA = data.ALA = 0;
      data.ARL = data.ALL = 0;

      data.experience += 2;
      data.influence += 1;
      data.agility -= 1;
      data.might -= 2;

      data.sanityM = data.sanity = 40;
      break;

    case 'Cso':
      data.H = 4;
      data.B = 15;
      data.RA = data.LA = 5;
      data.RL = data.LL = 5;
      data.AH = 0;
      data.AB = 10;
      data.ARA = data.ALA = 5;
      data.ARL = data.ALL = 5;

      data.smarts += 1;
      data.influence += 2;
      data.vitality -= 1;
      data.experience -= 1;
      data.might -= 1;

      data.sanityM = data.sanity = 30;
      break;

    case 'Cr':
      data.H = 4;
      data.B = 10;
      data.RA = data.LA = 4;
      data.RL = data.LL = 3;
      data.AH = 0;
      data.AB = 1;
      data.ARA = data.ALA = 1;
      data.ARL = data.ALL = 0;

      data.might += 2;
      data.influence += 1;
      data.agility += 1;
      data.smarts -= 2;
      data.experience -= 2;

      data.sanityM = data.sanity = 50;
      break;

    case 'Btro':
      data.H = 6;
      data.B = 19;
      data.RA = data.LA = 10;
      data.RL = data.LL = 10;
      data.AH = 5;
      data.AB = 10;
      data.ARA = data.ALA = 5;
      data.ARL = data.ALL = 5;

      data.smarts += 1;
      data.influence += 3;
      data.vitality -= 1;
      data.agility -= 1;
      data.might -= 2;

      data.sanityM = data.sanity = 35;
      break;

    case 'Bcs':
      data.H = 5;
      data.B = 15;
      data.RA = data.LA = 8;
      data.RL = data.LL = 8;
      data.AH = 1;
      data.AB = 7;
      data.ARA = data.ALA = 2;
      data.ARL = data.ALL = 1;

      data.might += 1;
      data.influence += 1;
      data.smarts -= 1;
      data.experience -= 1;

      data.sanityM = data.sanity = 30;
      break;

    case 'A':
      data.H = 4;
      data.B = 10;
      data.RA = data.LA = 5;
      data.RL = data.LL = 5;
      data.AH = 0;
      data.AB = 4;
      data.ARA = data.ALA = 1;
      data.ARL = data.ALL = 0;

      data.might += 2;
      data.agility += 1;
      data.smarts -= 1;
      data.influence -= 2;

      data.sanityM = data.sanity = 20;
      break;

  }
  if(data.might<=1){
    data.weightM = 182;
    data.meleeDMG = 5;
  }
  else if(data.might<=4){
    data.weightM = 113;
    data.meleeDMG = 3;
  }
  else if(data.might<=8){
    data.weightM = 77;
    data.meleeDMG = 1;
  }
  else if(data.might<=11){
    data.weightM = 50;
    data.meleeDMG = 0;
  }
  else if(data.might<=15){
    data.weightM = 32;
    data.meleeDMG = -1;
  }
  else if(data.might<=19){
    data.weightM = 23;
    data.meleeDMG = -3;
  }
  else if(data.might>=20){
    data.weightM = 30;
    data.meleeDMG = -5;
  }


  data.MH = data.H;
  data.MB = data.B;
  data.MA = data.LA;
  data.ML = data.LL;

  data.weight = 0;

  data.HP = data.HPM = data.H+data.B+data.RA*2+data.RL*2;
  data.AP = data.AH+data.AB+data.ARA*2+data.ARL*2;

  data.fear = 0;
  data.strain = 0;
  data.stress = 0;
  data.karma = 0;
  data.curse = 0;

  data.inventory = [];
  data.inventorySize = 1;

  data.ff = [];

  var dataT = JSON.stringify(data);
  dataT = dataT.split('');
  for (var i = 0; i < dataT.length; i++) {
    if(dataT[i]==="'"){
      dataT[i] = '"';
    }
  }
  data = dataT.join('');
  data = JSON.parse(data);
  return data;
}

var exports = module.exports = {createChar};
