/* globals __DEV__ */
import Phaser from 'phaser'
import { keyboardSignal } from '../controllers/keyboard'
import { playerSignal } from '../controllers/player'

const MAX_SPEED = 200
const AGILITY = 700
const DRAG = 0.05
const DRAG_FACTOR = 1 - DRAG

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, balls, team, human }) {
    super(game, x, y, 'player')

    this.game = game
    this.balls = balls
    this.team = team
    this.animations.add('run', Phaser.Animation.generateFrameNames('running-', 0, 11, '', 2), 10, true)
    this.animations.add('stand', ['standing'], 10, true)
    this.animations.play('stand')

    this.anchor = new Phaser.Point(0.6, 0.4)
    this.scale = new Phaser.Point(1, 1)

    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
    this.body.maxVelocity.set(MAX_SPEED)
    this.body.friction.setTo(10, 10)
    this.body.bounce.setTo(0.01, 0.01)

    this.body.mass = 70

    this.timeouts = {}

    this.kickIntent = null
    this.action = null

    if (human) {
      this.game.camera.follow(this)
      this.signal = keyboardSignal
    } else {
      this.signal = playerSignal()
    }

    this.balls.forEach((ball) => {
      this.registerHandlers(game, ball)
    })
  }

  update () {
    let accel = this.body.acceleration.getMagnitude()
    this.body.acceleration.setMagnitude(accel > (AGILITY / 100) ? accel * 0.9 : 0)

    this.body.velocity.set(this.body.velocity.x * DRAG_FACTOR, this.body.velocity.y * DRAG_FACTOR)
    if (this.action) this.animations.play(this.action)
    else if (this.body.speed > MAX_SPEED / 10) this.animations.play('run')
    else this.animations.play('stand')

    if (this.body.speed > MAX_SPEED / 40) {
      var idealTurn = Phaser.Math.wrapAngle(this.body.velocity.angle(new Phaser.Point(0, 1)) - this.rotation, 1)
      var actualTurn = Math.sign(idealTurn) * Math.min(Math.abs(idealTurn), 0.2)
      this.rotation = Phaser.Math.normalizeAngle(this.rotation + actualTurn)
    }

    this.balls.forEach(this.updatePlayerBall.bind(this))
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this, 32, 32)
    }
  }

  clear (param, timeout) {
    if (this.timeouts[param]) {
      clearTimeout(this.timeouts[param])
      delete this.timeouts[param]
    }

    if (typeof timeout === 'undefined') {
      this[param] = null
      return
    }

    this.timeouts[param] = setTimeout(() => {
      this[param] = null
    }, timeout)
  }

  registerHandlers (game) {
    if (!this.signal) return

    this.signal.add((details = {}) => {
      if (this.action) return

      switch (details.direction) {
        case 'up':
          this.body.acceleration.y = -AGILITY
          return

        case 'down':
          this.body.acceleration.y = AGILITY
          return

        case 'left':
          this.body.acceleration.x = -AGILITY
          return

        case 'right':
          this.body.acceleration.x = AGILITY
          return

        default:
      }
      // Player is in possession or close to the ball
      if (new Date().getTime() - this.lastTouch < 1000 || this.ballDist < 40) {
        if (details.Z) {
          this.kickIntent = Math.min(1000, Math.max(details.Z * 2, 200))
          this.clear('kickIntent', 1000)
        }

        if (details.X) {
          const thisPos = this.body.position
          // Angle of pass is either direction in which player is accelerating, or else direction it's facing
          const thisAng = this.body.acceleration.isZero() ? this.body.angle : Math.atan2(this.body.acceleration.y, this.body.acceleration.x)
          console.log('This angle', thisAng)
          const player = this.findPlayer(thisAng)
          if (!player) return console.log('No player')
          const playerPos = player.body.position
          const playerVel = player.body.velocity
          const tanAng = Math.tan(thisAng)
          const time = (thisPos.y - playerPos.y - tanAng * (thisPos.x - playerPos.x)) / (playerVel.y - tanAng * playerVel.x)
          console.log('Time is', time)
        }
      }
    })
  }

  findPlayer (angle) {
    const { Math: PMath } = Phaser
    return this.team.reduce((memo, player) => {
      if (player === this) return memo

      const playerAngle = PMath.angleBetweenPoints(this.body.position, player.body.position)
      const angleDiff = Math.abs(PMath.wrapAngle(playerAngle - angle))
      if (angleDiff < memo.best) {
        return {
          best: angleDiff,
          player
        }
      }
      return memo
    }, { best: Math.PI, player: null }).player
  }

  updatePlayerBall (ball) {
    var speedDiff = Phaser.Point.subtract(this.body.velocity, ball.body.velocity).getMagnitude()
    var offset1 = new Phaser.Point(-15, 0).rotate(0, 0, this.rotation)
    var offset2 = new Phaser.Point(-40, 0).rotate(0, 0, this.rotation)
    this.ballDist = this.game.physics.arcade.distanceBetween(Phaser.Point.add(this.body.center, offset1), ball.body.center)
    // Ball hits player too fast for him to control
    if (speedDiff > 300 || this.action) this.game.physics.arcade.collide(this, ball)
    // Otherwise
    else {
      // If the ball is close enough
      if (this.ballDist < 20) {
        // If he's waiting to kick the ball, kick it
        if (this.kickIntent) {
          this.action = 'kick'
          ball.body.velocity = Phaser.Point.add(this.body.acceleration, this.body.velocity).setMagnitude(this.kickIntent)
          ball.verticalSpeed = this.kickIntent / 100
          this.clear('kickIntent')
          this.clear('action', 500)
        // Otherwise, dribble the ball
        } else {
          var target = Phaser.Point.add(this.body.center, offset2)
          var playerSpeed = this.body.speed
          var minKick = (this.ballDist < 5) ? 0 : 25
          var kickVector = Phaser.Point.subtract(target, ball.body.center).setMagnitude(Math.max((playerSpeed + this.ballDist) * 1.05, minKick))
          ball.body.velocity.setTo(kickVector.x, kickVector.y)
          this.lastTouch = new Date().getTime()
        }
      }
    }
  }
}
