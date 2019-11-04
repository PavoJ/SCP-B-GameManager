var express = require('express');
var fileParse = require('./fileParser.js');
var playerManager = require('./playerManager.js');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
server = http.createServer(app);
var io = require('socket.io')(server);


var urlencodedParser = bodyParser.urlencoded({extended: false});

var Feats = fileParse.jsonConvert('./Feats.json').f;
var Flaws = fileParse.jsonConvert('./Flaws.json').f;

var playerData = {};
var playerCount = 0;

var tempData = {};
var tempCount = 0;
var tempChar;

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

app.get('/', function(req, res){//start
  res.render('index.ejs');
});

app.get('/FF', function(req, res)
{
  res.render('onlyFF.ejs');
});

app.post('/F&F', urlencodedParser, function(req, res){//dopo aver scelto il nome e le stats del personaggio
  if(req.body.playerName == 'GM'){
      res.render('GMPanel.ejs');
  }
  else{
    tempChar = playerManager.createChar(req.body);

    if(tempChar!=0)
    {
      tempData[tempCount] = JSON.parse(JSON.stringify(tempChar));
      tempData[tempCount].player = tempCount+1;
      tempData[tempCount].currentPlayer = -1;
      console.log(tempData[tempCount].playerName + "\n" + tempData[tempCount].player);
      tempCount++;

      res.render('Feats&Flaws.ejs', {'playerNum':tempCount, 'data':tempData[tempCount-1]});
    }
    else
    {
      res.render('wrongIndex.ejs');
    }

  }
});

app.post('/start', urlencodedParser, function(req, res){//Dopo aver scelto i feats e flaws

  if(tempData[Number(req.body.playerNum)-1]==undefined || req.body.playerName!=tempData[Number(req.body.playerNum)-1].playerName)
  {
    if(tempData[Number(req.body.playerNum)-1].currentPlayer!=-1)
    {
      res.render('gameStartimg.ejs', {'data': playerData[tempData[Number(req.body.playerNum)-1].currentPlayer]});
    }
    else
    {
      res.render('index.ejs');
    }
  }

  delete req.body.playerName;
  var h = Object.keys(req.body);
  var count = 0;

  console.log(h);
  for( a=0 ; a<h.length ; a++ )
  {
    if(h[a]!='playerNum')
    {
      if(Number(h[a])<=83)
      {
        count+=Feats[Number(h[a])].cost;
      }
      else
      {
        count+=Flaws[Number(h[a])-84].cost;
      }

    }
  }
  if(count<=2)//se i FF sono validi
  {
    for( a=0 ; a<h.length ; a++ )
      if(h[a]!='playerNum')
      {
        if(Number(h[a])<=83)
        {
          tempData[Number(req.body.playerNum)-1].ff.push(Feats[Number(h[a])]);
        }
        else
        {
          tempData[Number(req.body.playerNum)-1].ff.push(Flaws[Number(h[a])-84]);
        }
      }

      if(tempData[Number(req.body.playerNum)-1].currentPlayer==-1)
      {
        playerData[playerCount] = JSON.parse(JSON.stringify(tempData[Number(req.body.playerNum)-1]));
        playerData[playerCount].player = playerCount+1;
        playerCount++;

        tempData[Number(req.body.playerNum)-1].currentPlayer = playerCount-1;

        console.log(playerData[playerCount-1]);

        res.render('gameStartimg.ejs', {'data': playerData[playerCount-1]});
      }
      else
      {
        res.render('gameStartimg.ejs', {'data': playerData[tempData[Number(req.body.playerNum)-1].currentPlayer]});
      }

  }
  else
  {
    res.render('wrongFeats&Flaws.ejs', {'playerNum':req.body.playerNum, 'data':tempData[Number(req.body.playerNum)-1]});
  }

});

/*Obsoleta
app.post('/GM/playerMod', urlencodedParser, function(req, res){//trasferimento informazioni personaggio al GM
  res.render('playerMod.ejs', {'data':playerData[req.body.playerNum]});
});
*/

app.post('/GM/invMod', urlencodedParser, function(req, res)//aggiunta di oggetti all'inventario
{
  var pList = req.body.playerList;
  for(var a=0 ; a<pList.length ; a++)
  {
    playerData[pList[a]].inventory.push(JSON.parse('{"name":"' + req.body.itemName +'","damage":"' + req.body.itemDamage + '","weight":"' + req.body.itemWeight + '"}'));

    ++playerData[pList[a]].inventorySize;

    playerData[pList[a]].weight+=Number(req.body.itemWeight);
    console.log(playerData[pList[a]].weight);
    req.body.weight = playerData[pList[a]].weight;

    io.emit('invChange'+(Number(pList[a])+1), req.body);
    console.log('invChange'+(Number(pList[a])+1) + ' sent.');
  }

  res.render('GMPanel.ejs');
});

app.get("/relog/:user", function(req, res){//riconnessione
  if((req.params.user-1)<=playerCount)
  {
    res.render('gameStartimg.ejs', {'data': playerData[Number(req.params.user)-1]});
  }
});

app.post('/GM', urlencodedParser, function(req, res){//modifica informazioni personaggio

  var props = ["H", "B", "LA", "RA", "LL", "RL", "AH", "AB", "ALA", "ARA", "ALL", "ARL", "sanity", "fear", "stress", "strain", "karma", "curse", "weight", "weightM"];
  var container = {};
  var pNum;
  var el;

  for(var b=0 ; b<props.length ; b++)
  {
    el = (req.body[props[b]]?req.body[props[b]]:undefined);
    if(el!=undefined)
    {
      container[props[b]] = el;
    }
  }
  for(var a=0 ; a<req.body.playerList.length ; a++)
  {
    pNum = req.body.playerList[a];

    for(var b=0 ; b<props.length ; b++)
    {
      el = container[props[b]];
      if(el!=undefined && el!="0")
      {
        console.log(props[b] + "=" + el);
        if(el[0] == "0" && el[1] == "0")
        {
          playerData[pNum][props[b]] = 0;
        }
        else if((el[0] == "0" && el[1] != "0") || (el[0] == "-" && el[1] == "0"))
        {
          playerData[pNum][props[b]] = Number(playerData[pNum][props[b]])+Number(el);
        }
        else
        {
            playerData[pNum][props[b]] = Number(el);
        }
        console.log(props[b] + "=" + playerData[pNum][props[b]]);
      }
    }

    playerData[pNum].HP = (Number(container["H"]?container["H"]:playerData[pNum].H)+Number(container["B"]?container["B"]:playerData[pNum].B)+Number(container["RA"]?container["RA"]:playerData[pNum].RA)+Number(container["LA"]?container["LA"]:playerData[pNum].LA)+Number(container["RL"]?container["RL"]:playerData[pNum].RL)+Number(container["LL"]?container["LL"]:playerData[pNum].LL));
    playerData[pNum].AHP = (Number(container["AH"]?container["AH"]:playerData[pNum].AH)+Number(container["AB"]?container["AB"]:playerData[pNum].AB)+Number(container["ARA"]?container["ARA"]:playerData[pNum].ARA)+Number(container["ALA"]?container["ALA"]:playerData[pNum].ALA)+Number(container["ARL"]?container["ARL"]:playerData[pNum].ARL)+Number(container["ALL"]?container["ALL"]:playerData[pNum].ALL));

    container["HP"] = playerData[pNum].HP;
    container["AHP"] = playerData[pNum].AHP;

    io.emit('statChange'+(Number(pNum)+1), container);
    console.log('statChange'+(Number(pNum)+1) + ' sent.');
    console.log(container);
  }

  res.render('GMPanel.ejs');
});

/*Obsoleta
app.post('/GM/invGet', urlencodedParser,  function(req, res)//causa invRem, chiamato dal GM
{
  res.render('invView.ejs', {'playerNum':Number(req.body.playerNum)+1});
});
*/

app.post('/invRem', urlencodedParser, function(req, res)//per rimuovere un oggetto dall'inventario
{
  var invRm = Object.keys(req.body);

  for(i=0 ; i<invRm.length ; i++)
  {
    if(invRm[i]!='playerNum')
    {
      playerData[Number(req.body.playerNum)].weight -= Number(playerData[Number(req.body.playerNum)].inventory[invRm[i]]['weight']);

      delete playerData[Number(req.body.playerNum)].inventory[invRm[i]];
    }
  }
  io.emit("inv"+(Number(req.body.playerNum)+1), playerData[Number(req.body.playerNum)].inventory, playerData[Number(req.body.playerNum)].weight);
  res.render('GMPanel.ejs');
});

app.post('/saveGame', urlencodedParser, function(req, res)//game saving
{
  console.log(playerData);
  fileParse.saveGame(req.body.data, JSON.stringify(playerData));
  console.log(playerData);

  res.render("GMPanel.ejs");
});

app.post('/loadGame', urlencodedParser, function(req, res)//game loading
{
  playerData = fileParse.jsonConvert("./saves/"+req.body.data+'.json');
  playerCount = playerData.length||0;
  console.log("loaded save. playerCount:"+playerCount);
  res.render('GMPanel.ejs');
});

io.on('connection', function(socket){
  socket.on('playerList', function(){
    io.emit('playerInfo', playerData);
  });
  socket.on("invReq", function(pNum){
    if(pNum!=-1 && pNum<=playerCount)
    {
      io.emit("inv"+pNum, playerData[Number(pNum)-1].inventory, playerData[Number(pNum)-1].weight);
    }
  });
  socket.on("F&F_req", function(){//richiesti per elencarli
    io.emit("F&F", Feats, Flaws);
  });
  socket.on("FFReq", function(pNum){//richiesti da un giocatore
    io.emit("FF"+pNum, playerData[Number(pNum-1)].ff);
  });
  socket.on("pInfo", function(pNum, cond){
    if(cond)
    {
      io.emit("ePInfo"+pNum, playerData[pNum]);
    }
    else
    {
        io.emit("ePInfo"+pNum, 0);
    }
  });
});


server.listen('3000', function(){
  console.log('Listening on *:3000');
});
