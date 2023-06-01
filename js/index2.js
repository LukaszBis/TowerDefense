const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1280
canvas.height = 768

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)



const placementTilesData2D = []

for (let i = 0; i < placementTilesData.length; i += 20) {
  placementTilesData2D.push(placementTilesData.slice(i, i + 20))
}

const placementTiles = []

placementTilesData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      placementTiles.push(
        new PlacementTile({
          position: {
            x: x * 64,
            y: y * 64
          }
        })
      )
    }
  })
})

const image = new Image()

image.onload = () => {
  c.drawImage(image, 0, 0)
}
image.src = 'img/gameMap2.png'

const enemies = []

let hp = 200

function spawnEnemies(spawnCount) {
  for (let i = 1; i < spawnCount + 1; i++) {
    const xOffset = i * 150
    enemies.push(
      new Enemy({
        position: { x: waypoints[0].x - xOffset, y: waypoints[0].y, health: hp }
      })
    )
    
  }
  hp+=40
}

let kills = 0
var buildings = []
let activeTile = undefined
let enemyCount = 3
let hearts = 10
let coins = 165
let start = false
var explosions = []

  document.querySelector('#startGame').style.display = 'flex'
  let startGame = new Audio("./sounds/game-start-6104.mp3");
  let death = new Audio("./sounds/videogame-death-sound-43894.mp3");
  let win = new Audio("./sounds/winsquare-6993.mp3");
  let hurt = new Audio("./sounds/hurt_c_08-102842.mp3");
  let shooting = new Audio("./sounds/strza-67506.mp3");
  let wave = 1;

window.addEventListener('keydown', function(event){
  if(event.code == 'Space' && start == false){
    document.querySelector('#startGame').style.display = 'none'
    start = true
    startGame.play()
    document.querySelector('#wave').innerHTML = 'WAVE ' + wave

    animate()
  }
  if(event.code == 'KeyR' && start == false){
    location.reload()
  }
})

spawnEnemies(enemyCount)


var mutedPage = false
var button = document.getElementById('mutee')
button.addEventListener('click', mutePage)
var button = document.getElementById('mutee2')
button.addEventListener('click', mutePage)
function mutePage() {
  if(mutedPage){
    startGame.muted = false
    death.muted = false
    win.muted = false
    hurt.muted = false
    shooting.muted = false
    mutedPage = false
    document.getElementsByClassName("hear")[0].style.display = 'block'
    document.getElementsByClassName("donthear")[0].style.display = 'none'
  }else{
    startGame.muted = true
    startGame.pause()
    death.muted = true
    death.pause()
    win.muted = true
    win.pause()
    hurt.muted = true
    hurt.pause()
    shooting.muted = true
    shooting.pause()
    mutedPage = true
    document.getElementsByClassName("hear")[0].style.display = 'none'
    document.getElementsByClassName("donthear")[0].style.display = 'block'
  }
}
function muteBuilding(){
  shooting.play()
}

function animate() {
  const animationId = requestAnimationFrame(animate)

  c.drawImage(image, 0, 0)

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i]
    enemy.update()

    if (enemy.position.x > canvas.width) {
      hearts -= 1
      enemies.splice(i, 1)
      document.querySelector('#hearts').innerHTML = hearts

      if (hearts <= 0) {
        death.play()
        console.log('game over')
        cancelAnimationFrame(animationId)
        document.querySelector('#gameOver').style.display = 'flex'
        start = false
      }
    }
    if(wave == 20){
      win.play()
      cancelAnimationFrame(animationId)
      document.querySelector('#youWin').style.display = 'flex'
      start = false
    }
  }

  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i]
    explosion.draw()
    explosion.update()

    if (explosion.frames.current >= explosion.frames.max - 1) {
      explosions.splice(i, 1)
    }

    console.log(explosions)
  }

  if (enemies.length === 0) {
    enemyCount += 2
    wave += 1
    document.querySelector('#wave').innerHTML = 'WAVE ' + wave

    spawnEnemies(enemyCount)
  }
  

  placementTiles.forEach((tile) => {
    tile.update(mouse)
  })

  buildings.forEach((building) => {
    building.update()
    building.target = null
    const validEnemies = enemies.filter((enemy) => {
      const xDifference = enemy.center.x - building.center.x
      const yDifference = enemy.center.y - building.center.y
      const distance = Math.hypot(xDifference, yDifference)
      return distance < enemy.radius + building.radius
    })
    building.target = validEnemies[0]

    for (let i = building.projectiles.length - 1; i >= 0; i--) {
      const projectile = building.projectiles[i]

      projectile.update()

      const xDifference = projectile.enemy.center.x - projectile.position.x
      const yDifference = projectile.enemy.center.y - projectile.position.y
      const distance = Math.hypot(xDifference, yDifference)

      if (distance < projectile.enemy.radius + projectile.radius) {
        projectile.enemy.health -= 45
        hurt.play()
        console.log(projectile.enemy.health)
        if (projectile.enemy.health <= 0) {
          const enemyIndex = enemies.findIndex((enemy) => {
            return projectile.enemy === enemy
          })

          if (enemyIndex > -1) {
            enemies.splice(enemyIndex, 1)
            coins += 40
            kills += 1
            document.querySelector('#kill').innerHTML = 'KILLS ' + kills
            document.querySelector('#coins').innerHTML = coins
          }
        }

        console.log(projectile.enemy.health)
        explosions.push(
          new Sprite({
            position: { x: projectile.position.x, y: projectile.position.y },
            imageSrc: './img/explosion.png',
            frames: { max: 4 },
            offset: { x: 0, y: 0 }
          })
        )
        building.projectiles.splice(i, 1)
      }
    }
  })
}

const mouse = {
  x: undefined,
  y: undefined
}

let buildingcost = 75
document.querySelector('#cost').innerHTML = 75

canvas.addEventListener('click', (event) => {
  if (activeTile && !activeTile.isOccupied && coins - buildingcost >= 0) {
    coins -= buildingcost
    document.querySelector('#coins').innerHTML = coins
    buildings.push(
      new Building({
        position: {
          x: activeTile.position.x,
          y: activeTile.position.y
        }
      })
    )
    activeTile.isOccupied = true
    buildings.sort((a, b) => {
      return a.position.y - b.position.y
    })
    buildingcost += 15
    document.querySelector('#cost').innerHTML = buildingcost
  }
  
})

var buildingcostdisplay = document.querySelector('#buildingcost');

canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.offsetX
  mouse.y = event.offsetY
  
  activeTile = null
  for (let i = 0; i < placementTiles.length; i++) {
    const tile = placementTiles[i]
    if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size * 2 &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile
      buildingcostdisplay.style.top = mouse.y
      buildingcostdisplay.style.left = mouse.x
      buildingcostdisplay.style.display = 'block'
      
      break
    }else{
      buildingcostdisplay.style.display = 'none'
    }
  }
})
