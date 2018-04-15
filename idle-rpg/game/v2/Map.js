const BaseGame = require('../core/BaseGame');
const maps = require('../v1/data/maps');

class Map extends BaseGame {

  moveToRandomMap(player) {
    return this.randomBetween(0, 3)
      .then((movement) => {
        const mapSize = maps[maps.length - 1].coords;

        switch (movement) {
          case 0:
            // UP - Move down if at edge
            if (player.map.coords[1] === 0) {
              player.map.coords[1]++;
              return {
                map: this.getMapByCoords(player.map.coords),
                direction: 'South'
              };
            }

            player.map.coords[1]--;
            return {
              map: this.getMapByCoords(player.map.coords),
              direction: 'North'
            };

          case 1:
            // Down - Move up if at edge
            if (player.map.coords[1] === mapSize[1]) {
              player.map.coords[1]--;
              return {
                map: this.getMapByCoords(player.map.coords),
                direction: 'North'
              };
            }

            player.map.coords[1]++;
            return {
              map: this.getMapByCoords(player.map.coords),
              direction: 'South'
            };

          case 2:
            // Right - Move left if at edge
            if (player.map.coords[0] === mapSize[0]) {
              player.map.coords[0]--;
              return {
                map: this.getMapByCoords(player.map.coords),
                direction: 'West'
              };
            }

            player.map.coords[0]++;
            return {
              map: this.getMapByCoords(player.map.coords),
              direction: 'East'
            };

          case 3:
            // Left - Move right if at edge
            if (player.map.coords[0] === 0) {
              player.map.coords[0]++;
              return {
                map: this.getMapByCoords(player.map.coords),
                direction: 'East'
              };
            }

            player.map.coords[0]--;
            return {
              map: this.getMapByCoords(player.map.coords),
              direction: 'West'
            };
        }
      });
  }

  getMapByCoords(coords) {
    return maps.find(map => map.coords[0] === coords[0] && map.coords[1] === coords[1]);
  }

  getMapByIndex(index) {
    return maps[index];
  }

  getTowns() {
    return maps.filter(area => area.type.name === 'Town').map(area => area.name);
  }

  getRandomTown() {
    const towns = maps.filter(area => area.type.name === 'Town');
    return towns[this.randomBetween(0, towns.length - 1)];
  }

  getMapByName(name) {
    return maps.find(map => map.name === name);
  }

  getMapsByType(type) {
    return maps.filter(area => area.type.name === type).map(area => area.name);
  }

}
module.exports = Map;
