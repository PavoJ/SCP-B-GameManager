var fs = require('fs');

var jsonConvert = function(dir)
{
  var file = fs.readFileSync(dir, 'utf-8');
  return JSON.parse(file);
}

var saveGame = function(dir, data)
{
  fs.writeFile('./saves/'+dir+'.json', data,
    function(err){
      if(err)
      {
        console.log("there has been an error while trying to save");
        throw err;
      }
      console.log("successfuly saved");
    });
    return true;
}

var exports = module.exports = {jsonConvert, saveGame};
