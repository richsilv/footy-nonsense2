import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('mushroom', 'assets/images/mushroom2.png')
    this.load.image('pitch', 'assets/images/grass.jpg')
    this.load.atlas('player', 'assets/images/player/player.png', 'assets/images/player/player.json')
    this.load.atlas('ball', 'assets/images/ball/ball.png', 'assets/images/ball/ball.json')
  }

  create () {
    this.state.start('Game')
  }
}
