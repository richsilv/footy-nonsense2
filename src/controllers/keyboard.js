import Phaser from 'phaser'

export const keyboardSignal = new Phaser.Signal()

export function registerKeyboard (game) {
  const cursors = game.input.keyboard.createCursorKeys()
  Object.keys(cursors).forEach(key => {
    cursors[key].onHoldCallback = () => {
      keyboardSignal.dispatch({ direction: key })
    }
  })

  const timers = {}
  const makeTimedSignal = (keyName) => {
    timers[keyName] = null
    const key = game.input.keyboard.addKey(Phaser.KeyCode[keyName])

    key.onDown.add(() => {
      timers[keyName] = new Date().getTime()
    })
    key.onUp.add(() => {
      const time = timers[keyName]
      if (time) {
        keyboardSignal.dispatch({ [`${keyName}`]: new Date().getTime() - time })
        timers[keyName] = null
      }
    })
  }

  makeTimedSignal('Z')
  makeTimedSignal('X')
}
