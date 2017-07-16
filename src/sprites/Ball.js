import Phaser from 'phaser'

const BALL_SCALE = 0.35

export default class extends Phaser.Sprite {
  constructor ({ game, x, y }) {
    super(game, x, y, 'ball')

    this.game = game

    this.animations.add('roll', Phaser.Animation.generateFrameNames('ball-', 0, 7, '', 2), 20, true)
    this.animations.play('roll')

    this.anchor.setTo(0.5, 0.5)
    this.scale.setMagnitude(BALL_SCALE)

    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
    this.body.drag.setTo(85, 85)
    this.body.bounce.setTo(1, 1)
    this.body.mass = 40

    this.altitude = 0
    this.verticalSpeed = 0
  }

  update () {
    this.verticalSpeed -= 0.10
    this.altitude += this.verticalSpeed

    if (this.altitude < 0) {
      this.altitude = 0
      this.verticalSpeed = -0.5 * this.verticalSpeed
    }

    this.scale.setMagnitude((1 + (this.altitude / 150)) * BALL_SCALE)

    this.animations.getAnimation('roll').speed = this.body.speed / 5

    if (this.body.speed > 5) {
      this.animations.play('roll')
      this.rotation = this.body.velocity.angle(new Phaser.Point(0, 1))
    } else {
      this.animations.stop('roll')
    }
  }
}
