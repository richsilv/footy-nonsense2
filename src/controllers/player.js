import { Signal } from 'phaser'

export function playerSignal () {
  const signal = new Signal()
  const directions = ['up', 'down', 'left', 'right']

  let direction = directions[0]

  function changeDirection () {
    direction = directions[Math.floor(Math.random() * directions.length)]
    const delay = Math.floor(Math.random() * 5000)
    setTimeout(changeDirection, delay)
  }

  setInterval(() => {
    signal.dispatch({ direction })
  }, 0)
  changeDirection()

  return signal
}
