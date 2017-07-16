import Phaser from 'phaser'
import Ball from '../sprites/Ball'
import Player from '../sprites/Player'
import { registerKeyboard } from '../controllers/keyboard'

const playerStarts = [
  { x: 600, y: 200, human: true },
  { x: 200, y: 600 }
]
const ballStarts = [
  { x: 600, y: 600 }
]

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    this.players = []
    this.balls = []
    const team = []

    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.world.setBounds(0, 0, 2000, 2000)

    //  This will run in Canvas mode, so let's gain a little speed and display
    this.game.renderer.clearBeforeRender = false
    this.game.renderer.roundPixels = true
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.world.setBounds(0, 0, 2000, 2000)

    this.pitch = this.add.tileSprite(0, 0, 2000, 2000, 'pitch')
    this.pitch.fixedToCamera = false
    this.game.camera.deadzone = new Phaser.Rectangle(350, 250, 100, 100)

    this.balls = ballStarts.map((ballStart) => {
      const ball = new Ball(Object.assign({ game: this.game }, ballStart))
      this.game.add.existing(ball)
      return ball
    })
    this.players = playerStarts.map((playerStart) => {
      const player = new Player(Object.assign({ game: this.game, balls: this.balls, team }, playerStart))
      team.push(player)
      this.game.add.existing(player)
      return player
    })

    // Set up the keyboard
    registerKeyboard(this.game)
  }
}
