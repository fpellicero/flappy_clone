const GAME_WIDTH = 320;
const GAME_HEIGHT = 460;

function loadSprites() {
    game.load.spritesheet('bird', 'assets/grumpy_bird/sprite.png', 100, 102, 8); 
    game.load.image('pipe', 'assets/pipe.png');
    game.load.spritesheet('obstacle', 'assets/obstacle/obstacle.png', 37, 50);
    game.load.image('background', 'assets/backgrounds.png',)
    game.load.audio('jump', 'assets/jump.wav');
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
}

function createBird() {
    var bird = game.add.sprite(50, 245, 'bird');
    bird.scale.setTo(0.5, 0.5);
    bird.anchor.setTo(-0.2, 0.5); 
    return bird;
}

function setBirdPhysics(bird) {
    bird.animations.add('fly');
    bird.animations.play('fly', 12, true);
    bird.body.gravity.y = 1000; 
}

function setUpPhysics(bird) {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.enable(bird);
}

function initBackground() {
    return game.add.tileSprite(0,0, GAME_WIDTH, GAME_HEIGHT, 'background');
}

var mainState = {
    preload: function() {
        loadSprites();
        game.scale.forceOrientation(true);
    },
    create: function() {
        this.background = initBackground();
        this.bird = createBird(); 
        setUpPhysics(this.bird);
        setBirdPhysics(this.bird);

        this.jumpSound = game.add.audio('jump');


        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);     
        game.input.onTap.add(this.jump, this);

        // Create an empty group
        this.pipes = game.add.group(); 

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this); 

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });
    }, 
    update: function() {
        if(this.bird.alive) this.background.tilePosition.x -= 2;
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        /*if (this.bird.y < 0 || this.bird.y > 490) this.restartGame();*/
        this.bird.checkWorldBounds = true;
        this.bird.events.onOutOfBounds.add(this.restartGame);

        if (this.bird.angle < 20) this.bird.angle += 1;
    },

    jump: function() {
        if(!this.bird.alive) return;
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        this.jumpSound.play();
        // Rotate upwards
        game.add.tween(this.bird).to({angle: -20}, 100).start(); 
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    addOnePipe: function(x, y, ending, invert) {
        // Create a pipe at the position x and y
        var spriteIndex = ending ? 2 : 0;
        spriteIndex = invert ? 1 : spriteIndex;
        var pipe = game.add.sprite(x, y, 'obstacle', spriteIndex);
        

        // Add the pipe to our previously created group
        this.pipes.add(pipe);

        // Enable physics on the pipe 
        game.physics.arcade.enable(pipe);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 

        // Automatically kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        this.score += 1;
        this.labelScore.text = this.score; 

        // Add the 6 pipes 
        // With one big hole at position 'hole' and 'hole + 1'
        var holeIndex = [hole-1, hole, hole+1]
        var endingPipes = [hole - 2, hole + 2]
        for (var i = 0; i < 10; i++)
            if(holeIndex.indexOf(i) == -1) {
                var isEnding = endingPipes.indexOf(i) != -1;
                var invertPipe = (i == hole + 2);
                this.addOnePipe(320, i * 50, isEnding, invertPipe);   
            }             
    },

    hitPipe: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.bird.alive == false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    }
}

var game = new Phaser.Game(320, 460, Phaser.AUTO);

game.state.add('main', mainState);

game.state.start('main');